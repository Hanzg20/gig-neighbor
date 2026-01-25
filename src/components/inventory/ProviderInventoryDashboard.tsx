import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Eye, EyeOff, Loader2, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { repositoryFactory } from '@/services/repositories/factory';
import { InventoryItem, ListingMaster, ListingItem } from '@/types/domain';
import { useConfigStore } from '@/stores/configStore';
import { format } from 'date-fns';
import { AddInventoryDialog } from './AddInventoryDialog';
import { useReactToPrint } from 'react-to-print';
import { PrintableQrTemplate, PrintableQrData } from './PrintableQrTemplate';
import { supabase } from '@/lib/supabase';
import { getShareUrl } from '@/utils/url';

interface ProviderInventoryDashboardProps {
    providerId: string;
}

export function ProviderInventoryDashboard({ providerId }: ProviderInventoryDashboardProps) {
    console.log('[🎯 InventoryDashboard] Component rendered with providerId:', providerId);
    const { language } = useConfigStore();
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [listings, setListings] = useState<ListingMaster[]>([]);
    const [items, setItems] = useState<ListingItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Printing
    const printRef = useRef<HTMLDivElement>(null);
    const [itemsToPrint, setItemsToPrint] = useState<PrintableQrData[]>([]);

    const t = {
        title: language === 'zh' ? '库存管理' : 'Inventory Management',
        addBtn: language === 'zh' ? '添加库存' : 'Add Inventory',
        printBtn: language === 'zh' ? '打印二维码' : 'Print QR Codes',
        searchPlaceholder: language === 'zh' ? '搜索序列号...' : 'Search serial number...',
        statusAll: language === 'zh' ? '全部状态' : 'All Status',
        statusAvailable: language === 'zh' ? '待售' : 'Available',
        statusSold: language === 'zh' ? '已售' : 'Sold',
        statusReserved: language === 'zh' ? '预留' : 'Reserved',
        colSerial: language === 'zh' ? '序列号/卡号' : 'Serial Number',
        colProduct: language === 'zh' ? '关联商品' : 'Product',
        colStatus: language === 'zh' ? '状态' : 'Status',
        colAdded: language === 'zh' ? '入库时间' : 'Added Date',
        colSecret: language === 'zh' ? '密钥/密码' : 'Secret Code',
        noData: language === 'zh' ? '暂无库存数据' : 'No inventory data found',
        action: language === 'zh' ? '操作' : 'Action',
    };

    const loadData = async () => {
        console.log('[📦 InventoryDashboard] Starting to load data for provider:', providerId);
        setLoading(true);
        try {
            // 检查用户认证状态
            const { data: { user } } = await supabase.auth.getUser();
            console.log('[🔐 InventoryDashboard] Current user:', user?.id);
            console.log('[🔐 InventoryDashboard] User authenticated:', !!user);

            const inventoryRepo = repositoryFactory.getInventoryRepository();
            const listingRepo = repositoryFactory.getListingRepository();
            const itemRepo = repositoryFactory.getListingItemRepository();

            console.log('[📦 InventoryDashboard] Fetching inventory and listings...');
            const [invData, lstData] = await Promise.all([
                inventoryRepo.getByProvider(providerId),
                listingRepo.getByProvider(providerId)
            ]);

            console.log('[📦 InventoryDashboard] Inventory data received:', invData.length, 'items');
            console.log('[📦 InventoryDashboard] Listings data received:', lstData.length, 'listings');
            console.log('[📦 InventoryDashboard] First inventory item:', invData[0]);

            setInventory(invData);
            setListings(lstData);

            // Fetch all items for these listings
            const allItems: ListingItem[] = [];
            for (const lst of lstData) {
                const variants = await itemRepo.getByMaster(lst.id);
                allItems.push(...variants);
            }
            setItems(allItems);
            console.log('[📦 InventoryDashboard] Total items loaded:', allItems.length);

        } catch (error) {
            console.error("[❌ InventoryDashboard] Failed to load inventory:", error);
            console.error("[❌ InventoryDashboard] Error details:", JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
            console.log('[📦 InventoryDashboard] Loading complete');
        }
    };

    useEffect(() => {
        loadData();
    }, [providerId]);

    const getProductName = (listingItemId: string) => {
        const item = items.find(i => i.id === listingItemId);
        if (!item) return listingItemId;
        const master = listings.find(l => l.id === item.masterId);

        const itemName = language === 'zh' ? item.nameZh : item.nameEn;
        const masterName = master ? (language === 'zh' ? master.titleZh : master.titleEn) : '';

        return `${masterName} - ${itemName}`;
    };

    const toggleSecret = (id: string) => {
        setShowSecrets(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Available</Badge>;
            case 'sold': return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Sold</Badge>;
            case 'reserved': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Reserved</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Print logic
    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const getMasterId = (listingItemId: string): string | null => {
        const item = items.find(i => i.id === listingItemId);
        return item?.masterId || null;
    };

    const handlePrintAll = () => {
        // For batch printing, generate ONE universal QR code per Master
        // Group inventory by Master ID
        const masterIds = new Set<string>();
        const masterToProduct = new Map<string, string>();
        const masterToImage = new Map<string, string>(); // Add image map

        filteredInventory.forEach(item => {
            const masterId = getMasterId(item.listingItemId);
            if (masterId) {
                masterIds.add(masterId);
                if (!masterToProduct.has(masterId)) {
                    // Get master name from first item
                    const listingItem = items.find(i => i.id === item.listingItemId);
                    const master = listings.find(l => l.id === listingItem?.masterId);
                    const productName = master
                        ? (language === 'zh' ? master.titleZh : master.titleEn)
                        : getProductName(item.listingItemId);
                    masterToProduct.set(masterId, productName);

                    // Get Image
                    if (master?.images && master.images.length > 0) {
                        masterToImage.set(masterId, master.images[0]);
                    }
                }
            }
        });

        // Generate one QR code per unique Master
        const printData = Array.from(masterIds).map(masterId => ({
            serialNumber: language === 'zh' ? '通用二维码' : 'Universal QR',
            productName: masterToProduct.get(masterId) || 'Product',
            productImage: masterToImage.get(masterId),
            // Use standardized URL utility
            url: getShareUrl(`/scan/${masterId}`)
        }));

        setItemsToPrint(printData);

        // Timeout to allow state to update and render before printing
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const handlePrintSingle = (item: InventoryItem) => {
        const masterId = getMasterId(item.listingItemId);
        const listingItem = items.find(i => i.id === item.listingItemId);
        const master = listings.find(l => l.id === masterId); // Get master for image

        const variantLabel = listingItem
            ? `${language === 'zh' ? listingItem.nameZh : listingItem.nameEn} - $${(listingItem.pricing.price.amount / 100).toFixed(2)}`
            : (language === 'zh' ? '扫码购买' : 'Scan to Buy');

        // Construct path for single item
        const singlePath = masterId
            ? `/scan/${masterId}?preselect=${item.listingItemId}`
            : `/scan/${item.listingItemId}`;

        setItemsToPrint([{
            serialNumber: variantLabel, // Display variant info instead of serial number
            productName: getProductName(item.listingItemId),
            productImage: master?.images?.[0], // Pass image
            url: getShareUrl(singlePath)
        }]);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold">{t.title}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrintAll} className="gap-2">
                        <Printer className="w-4 h-4" /> {t.printBtn} (Batch)
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> {t.addBtn}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t.searchPlaceholder}
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.statusAll}</SelectItem>
                                <SelectItem value="available">{t.statusAvailable}</SelectItem>
                                <SelectItem value="sold">{t.statusSold}</SelectItem>
                                <SelectItem value="reserved">{t.statusReserved}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.colSerial}</TableHead>
                                    <TableHead>{t.colProduct}</TableHead>
                                    <TableHead>{t.colSecret}</TableHead>
                                    <TableHead>{t.colStatus}</TableHead>
                                    <TableHead>{t.colAdded}</TableHead>
                                    <TableHead className="text-right">{t.action}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            {t.noData}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono font-medium">{item.serialNumber}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={getProductName(item.listingItemId)}>
                                                {getProductName(item.listingItemId)}
                                            </TableCell>
                                            <TableCell>
                                                {item.secretCode ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs">
                                                            {showSecrets[item.id] ? item.secretCode : '••••••••'}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => toggleSecret(item.id)}
                                                        >
                                                            {showSecrets[item.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                        </Button>
                                                    </div>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(item.createdAt), 'yyyy-MM-dd')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handlePrintSingle(item)}>
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AddInventoryDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                providerId={providerId}
                listings={listings}
                items={items}
                onSuccess={loadData}
            />

            {/* Hidden Print Template */}
            <PrintableQrTemplate
                ref={printRef}
                data={itemsToPrint}
            />
        </div>
    );
}
