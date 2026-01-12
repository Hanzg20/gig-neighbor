import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, QrCode, CreditCard, Gift, Loader2, Phone } from "lucide-react";
import { repositoryFactory } from '@/services/repositories/factory';
import { NotificationService } from '@/services/NotificationService';
import { ListingMaster, ListingItem, InventoryItem } from '@/types/domain';
import { useToast } from "@/hooks/use-toast";
import { useConfigStore } from '@/stores/configStore';
import { supabase } from '@/lib/supabase';

// UUID v4 generator (compatible with all browsers)
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const QuickScanCheckout = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { language } = useConfigStore();

    // Get preselect parameter from URL query string
    const searchParams = new URLSearchParams(window.location.search);
    const preselectItemId = searchParams.get('preselect');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [listing, setListing] = useState<ListingMaster | null>(null);
    const [items, setItems] = useState<ListingItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [allocatedItem, setAllocatedItem] = useState<InventoryItem | null>(null);

    const t = {
        zh: {
            title: "扫码购卡",
            quickBuyTitle: "快速购买",
            payBtn: "去支付",
            paying: "正在处理支付...",
            successTitle: "支付成功！",
            cardNumber: "您的洗车卡号",
            copyBtn: "复制卡号",
            rewardTitle: "恭喜获得 5 金豆！",
            rewardDesc: "设置密码即可领用并在下次抵扣。",
            registerBtn: "立即注册领豆",
            chooseItem: "选择规格",
            enterPhone: "输入手机号 (用于接收卡号)",
            phonePlaceholder: "您的加拿大/美国手机号",
            loading: "正在加载商品信息...",
            notFound: "商品未找到",
            inventoryError: "该规格暂时缺货，请选择其他规格或联系商家。",
            viewAllVariants: "查看所有规格",
        },
        en: {
            title: "Scan to Buy",
            quickBuyTitle: "Quick Buy",
            payBtn: "Pay Now",
            paying: "Processing payment...",
            successTitle: "Payment Successful!",
            cardNumber: "Your Card Number",
            copyBtn: "Copy Number",
            rewardTitle: "You've earned 5 JinBeans!",
            rewardDesc: "Set a password to claim and use on your next purchase.",
            registerBtn: "Register & Claim Now",
            chooseItem: "Select Variant",
            enterPhone: "Enter Phone Number (to receive code)",
            phonePlaceholder: "Your CAD/USD phone number",
            loading: "Loading product...",
            notFound: "Product not found",
            inventoryError: "This variant is out of stock. Please select another or contact the provider.",
            viewAllVariants: "View All Variants",
        }
    }[language === 'zh' ? 'zh' : 'en'];

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const repo = repositoryFactory.getListingRepository();
                const itemRepo = repositoryFactory.getListingItemRepository();

                const data = await repo.getById(id);
                if (data) {
                    setListing(data);
                    const variants = await itemRepo.getByMaster(data.id);
                    setItems(variants);

                    // Check if there's a preselect parameter
                    if (preselectItemId && variants.length > 0) {
                        const preselectedItem = variants.find(v => v.id === preselectItemId);
                        if (preselectedItem) {
                            setSelectedItem(preselectedItem);
                            console.log('[📌 QuickScan] Pre-selected variant:', preselectedItem.nameEn);
                        } else {
                            // Fallback to first item if preselect ID not found
                            setSelectedItem(variants[0]);
                        }
                    } else if (variants.length > 0) {
                        setSelectedItem(variants[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching scan data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, preselectItemId]);

    const handlePay = async () => {
        if (!selectedItem || !phoneNumber) {
            toast({
                variant: "destructive",
                title: "Missing Info",
                description: "Please select an item and enter your phone number.",
            });
            return;
        }

        setProcessing(true);

        try {
            // Create Stripe Checkout Session
            console.log('[🔵 Checkout] Creating Stripe checkout session...');

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: {
                    listingItemId: selectedItem.id,
                    phoneNumber,
                    productName: language === 'zh'
                        ? `${listing?.titleZh} - ${selectedItem.nameZh}`
                        : `${listing?.titleEn} - ${selectedItem.nameEn}`,
                    price: selectedItem.pricing.price.amount, // Amount in cents
                    currency: selectedItem.pricing.price.currency.toLowerCase(),
                    masterId: id,
                },
            });

            if (error) {
                console.error('[❌ Checkout] Failed to create session:', error);
                throw new Error(error.message || 'Failed to create checkout session');
            }

            if (!data?.url) {
                throw new Error('No checkout URL returned');
            }

            console.log('[✅ Checkout] Session created, redirecting to Stripe...');

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (error: any) {
            console.error("[❌ Payment] Error initiating checkout:", error);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: error.message || "Failed to initiate payment. Please try again.",
            });
            setProcessing(false);
        }
    };

    const copyToClipboard = () => {
        if (allocatedItem) {
            navigator.clipboard.writeText(allocatedItem.serialNumber);
            toast({ title: "Copied!", description: "Card number copied to clipboard." });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{t.loading}</p>
        </div>
    );

    if (!listing) return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <p className="text-xl font-medium">{t.notFound}</p>
        </div>
    );

    // Quick Buy Mode: If preselect parameter exists, show simplified UI
    const isQuickBuyMode = !!preselectItemId;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col">
            {/* Header - Minimalist */}
            <header className="px-4 py-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
                {isQuickBuyMode && selectedItem ? (
                    <>
                        <div className="inline-block px-3 py-1 mb-3 text-xs font-bold bg-primary/20 text-primary rounded-full">
                            {t.quickBuyTitle}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">{selectedItem.nameZh}</h1>
                        <p className="text-muted-foreground mt-2">{selectedItem.nameEn}</p>
                        <p className="text-3xl font-black text-primary mt-4">
                            ${(selectedItem.pricing.price.amount / 100).toFixed(2)} CAD
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold tracking-tight">{listing.titleZh}</h1>
                        <p className="text-muted-foreground mt-2">{listing.titleEn}</p>
                    </>
                )}
            </header>

            <main className="px-4 flex-1 pb-24">
                {!success ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Step 1: Select SKU (Hidden in Quick Buy Mode) */}
                        {!isQuickBuyMode && (
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">{t.chooseItem}</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    {items.map(item => (
                                        <Card
                                            key={item.id}
                                            className={`cursor-pointer border-2 transition-all ${selectedItem?.id === item.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent'}`}
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-lg">{item.nameZh}</p>
                                                    <p className="text-sm text-muted-foreground">{item.nameEn}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-primary">${(item.pricing.price.amount / 100).toFixed(2)}</p>
                                                    <Badge variant="outline" className="mt-1">CAD</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Buy Mode: Link to view all variants */}
                        {isQuickBuyMode && (
                            <div className="text-center">
                                <Button
                                    variant="link"
                                    className="text-sm text-muted-foreground"
                                    onClick={() => navigate(`/scan/${id}`)}
                                >
                                    {t.viewAllVariants} →
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Phone Number */}
                        <div className="space-y-3">
                            <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" /> {t.enterPhone}
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder={t.phonePlaceholder}
                                className="text-lg h-12"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground px-1">
                                {language === 'zh' ? '我们将通过此手机号为您发送电子凭证链接。' : 'We will send your voucher link via this phone number.'}
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="p-4 bg-muted/50 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {language === 'zh'
                                    ? '安全交易由 Stripe 处理。渥帮保护您的个人隐私，仅用于履约通知。'
                                    : 'Secure checkout processed by Stripe. Wobang protects your privacy.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">{t.successTitle}</h2>
                        <p className="text-muted-foreground mb-8">
                            {language === 'zh' ? '您的洗车服务已激活。' : 'Your car wash service is now active.'}
                        </p>

                        {/* Result Display */}
                        <Card className="w-full bg-primary/5 border-dashed border-2 border-primary/30">
                            <CardContent className="p-8">
                                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2 font-bold">{t.cardNumber}</p>
                                <div className="text-3xl font-mono font-black text-primary tracking-tighter mb-4">
                                    {allocatedItem?.serialNumber}
                                </div>
                                <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                                    {t.copyBtn}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Reward Section (Upsell) */}
                        <div className="mt-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 w-full">
                            <div className="flex items-center justify-center gap-2 text-amber-600 font-bold mb-2 text-lg">
                                <Gift className="w-6 h-6" /> {t.rewardTitle}
                            </div>
                            <p className="text-amber-800/70 text-sm mb-6">
                                {t.rewardDesc}
                            </p>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 shadow-lg shadow-amber-200">
                                {t.registerBtn}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer / CTA - Only show when NOT success */}
            {!success && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t">
                    <Button
                        className="w-full h-14 text-xl font-black gap-3 shadow-xl shadow-primary/20"
                        disabled={processing || !phoneNumber || !selectedItem}
                        onClick={handlePay}
                    >
                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                        {processing ? t.paying : t.payBtn}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default QuickScanCheckout;
