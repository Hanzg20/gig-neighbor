import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { repositoryFactory } from '@/services/repositories/factory';
import { ListingMaster, ListingItem } from '@/types/domain';
import { useConfigStore } from '@/stores/configStore';
import { useToast } from "@/hooks/use-toast";

interface AddInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providerId: string;
    listings: ListingMaster[];
    items: ListingItem[];
    onSuccess: () => void;
}

export function AddInventoryDialog({ open, onOpenChange, providerId, listings, items, onSuccess }: AddInventoryDialogProps) {
    const { language } = useConfigStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('single');

    // Single Entry State
    const [selectedSku, setSelectedSku] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [secretCode, setSecretCode] = useState('');

    // Bulk Entry State
    const [bulkData, setBulkData] = useState('');

    const t = {
        title: language === 'zh' ? '添加库存' : 'Add Inventory',
        desc: language === 'zh' ? '为您的无人售卖业务添加新的序列号或卡密。' : 'Add new serial numbers or codes for your unmanned vending business.',
        tabSingle: language === 'zh' ? '单条录入' : 'Single Entry',
        tabBulk: language === 'zh' ? '批量导入' : 'Bulk Import',
        labelProduct: language === 'zh' ? '选择商品规格' : 'Select Product SKU',
        labelSerial: language === 'zh' ? '序列号 / 卡号' : 'Serial Number / Card ID',
        labelSecret: language === 'zh' ? '密码 / 密钥 (可选)' : 'Secret Code / PIN (Optional)',
        placeholderSerial: language === 'zh' ? '例如：CW-2024-001' : 'e.g. CW-2024-001',
        placeholderSecret: language === 'zh' ? '例如：123456' : 'e.g. 123456',
        labelBulk: language === 'zh' ? '粘贴数据 (每行一条)' : 'Paste Data (One per line)',
        placeholderBulk: language === 'zh' ? '格式：\n卡号1, 密码1\n卡号2, 密码2' : 'Format:\nSerial1, Secret1\nSerial2, Secret2',
        btnCancel: language === 'zh' ? '取消' : 'Cancel',
        btnAdd: language === 'zh' ? '确认添加' : 'Add Inventory',
        success: language === 'zh' ? '添加成功' : 'Inventory added successfully',
        error: language === 'zh' ? '添加失败' : 'Failed to add inventory',
        selectSkuPlaceholder: language === 'zh' ? '请选择...' : 'Select...',
    };

    const getSkuLabel = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return itemId;
        const master = listings.find(l => l.id === item.masterId);
        const itemName = language === 'zh' ? item.nameZh : item.nameEn;
        const masterName = master ? (language === 'zh' ? master.titleZh : master.titleEn) : '';
        return `${masterName} - ${itemName}`;
    };

    const handleSubmit = async () => {
        if (!selectedSku) {
            toast({ variant: "destructive", title: "Error", description: "Please select a product SKU." });
            return;
        }

        setLoading(true);
        const inventoryRepo = repositoryFactory.getInventoryRepository();

        try {
            if (activeTab === 'single') {
                if (!serialNumber) {
                    toast({ variant: "destructive", title: "Error", description: "Serial number is required." });
                    setLoading(false);
                    return;
                }

                await inventoryRepo.importInventory([{
                    listingItemId: selectedSku,
                    providerId,
                    serialNumber,
                    secretCode,
                    metadata: {},
                    validFrom: new Date().toISOString(),
                }]);

            } else {
                // Bulk Import Logic
                const lines = bulkData.split('\n').filter(l => l.trim());
                const importList = lines.map(line => {
                    const [sn, sc] = line.split(',').map(s => s.trim());
                    return {
                        listingItemId: selectedSku,
                        providerId,
                        serialNumber: sn,
                        secretCode: sc || undefined,
                        metadata: {},
                        validFrom: new Date().toISOString(),
                    };
                });

                if (importList.length === 0) {
                    setLoading(false);
                    return;
                }

                await inventoryRepo.importInventory(importList);
            }

            toast({ title: t.success });
            onSuccess();
            onOpenChange(false);

            // Reset form
            setSerialNumber('');
            setSecretCode('');
            setBulkData('');

        } catch (error: any) {
            console.error("Import error:", error);
            toast({
                variant: "destructive",
                title: t.error,
                description: error.message || "Something went wrong."
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter items that belong to serialized listings
    const serializedItems = items.filter(item => {
        const master = listings.find(l => l.id === item.masterId);
        return (master?.metadata as Record<string, unknown>)?.isSerialized;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.desc}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t.labelProduct}</Label>
                        <Select value={selectedSku} onValueChange={setSelectedSku}>
                            <SelectTrigger>
                                <SelectValue placeholder={t.selectSkuPlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {serializedItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {getSkuLabel(item.id)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="single">{t.tabSingle}</TabsTrigger>
                            <TabsTrigger value="bulk">{t.tabBulk}</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 space-y-4">
                            <TabsContent value="single" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t.labelSerial} <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={serialNumber}
                                        onChange={e => setSerialNumber(e.target.value)}
                                        placeholder={t.placeholderSerial}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t.labelSecret}</Label>
                                    <Input
                                        value={secretCode}
                                        onChange={e => setSecretCode(e.target.value)}
                                        placeholder={t.placeholderSecret}
                                        type="password"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="bulk" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t.labelBulk}</Label>
                                    <Textarea
                                        value={bulkData}
                                        onChange={e => setBulkData(e.target.value)}
                                        placeholder={t.placeholderBulk}
                                        className="h-32 font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Max 50 items per add.
                                    </p>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t.btnCancel}</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t.btnAdd}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
