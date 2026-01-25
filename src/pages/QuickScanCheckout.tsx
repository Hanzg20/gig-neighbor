import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, QrCode, CreditCard, Gift, Loader2, Phone, ShieldCheck, ChevronRight, Info, Ticket, X } from "lucide-react";
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

    // Get URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const preselectItemId = searchParams.get('preselect');
    const couponFromUrl = searchParams.get('coupon');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [listing, setListing] = useState<ListingMaster | null>(null);
    const [items, setItems] = useState<ListingItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [allocatedItem, setAllocatedItem] = useState<InventoryItem | null>(null);
    const [stockCounts, setStockCounts] = useState<Record<string, number>>({});
    const [provider, setProvider] = useState<{ name: string, avatar: string } | null>(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponId, setCouponId] = useState<string | null>(null);
    const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

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
            outOfStock: "暂时缺货",
            viewAllVariants: "查看所有规格",
            postedBy: "商家发布",
            securePayment: "Stripe 安全支付",
            jwdGuarantee: "JWD 技术支持与保障",
            secureTitle: "支付安全与保障",
            agreement: "我已阅读并同意",
            agreementLink: "购买与使用协议",
            poweredBy: "Powered by JUSTWEDO.com(JWD)",
            disclaimerTitle: "购买与服务协议",
            disclaimerContent: "欢迎使用 JUSTWEDO.com(JWD) 提供的扫码购技术支持。在您进行支付前，请务必知悉以下电商服务条款：",
            law1: "1. 平台定位：JWD 仅作为由商家授权的技术撮合平台，负责处理支付、库存分配及通知逻辑。本平台不直接生产或存储实物商品。",
            law2: "2. 服务主体：您所购买的具体的【服务/商品】及后续履约、卡片解释权均归属于发布该信息的商家。支付款项将结算至商家账户。",
            law3: "3. 支付安全：所有交易均通过符合 PCI 标准的第三方支付商（Stripe）进行加密处理。您的敏感支付信息（如卡号）不会在 JWD 服务器上存储。",
            law4: "4. 电子卡券说明：支付成功后生成的电子凭据/卡号是服务的唯一领取凭证。请及时截图保存。除商家有特殊书面说明外，由于电子产品的特殊性，凭据一旦发放，JWD 不提供单方面退款申请受理。",
            law5: "5. 隐私保护：您的手机号仅用于发送交易凭证、领取通知以及必要的安全验证。我们将严格保护您的数据安全，不将其用于无关的第三方推销。",
            law6: "6. 纠纷处理：如遇服务无法使用、金额异议或挂失需求，请优先根据商家资料与其联系。JWD 提供必要的技术链路支持以协助双方沟通。",
            // Coupon
            couponCode: "优惠码",
            couponPlaceholder: "输入优惠码",
            couponApply: "验证",
            couponApplied: "已优惠",
            couponInvalid: "优惠码无效",
            couponExpired: "优惠码已过期",
            couponExhausted: "优惠码已用完",
            couponMinPurchase: "需满 ${min} 可用",
            originalPrice: "商品金额",
            discount: "优惠抵扣",
            finalPrice: "应付金额",
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
            inventoryError: "This variant is out of stock. We've notified the provider to restock.",
            outOfStock: "Out of Stock",
            viewAllVariants: "View All Variants",
            postedBy: "Posted by",
            securePayment: "Stripe Secure Payment",
            jwdGuarantee: "JWD Technology Support",
            secureTitle: "Security & Protection",
            agreement: "I agree to the",
            agreementLink: "Purchase Agreement",
            poweredBy: "Powered by JUSTWEDO.com(JWD)",
            disclaimerTitle: "Purchase Agreement",
            disclaimerContent: "Welcome to JUSTWEDO.com(JWD). By proceeding, you acknowledge the following standard e-commerce terms:",
            law1: "1. Platform Context: JWD provides the technology layer for matching and checkout. We are a facilitator and do not directly manufacture or store items.",
            law2: "2. Service Entity: Full responsibility for service quality, interpretation, and fulfillment belongs to the Merchant. Payments are settled to their account.",
            law3: "3. Payment Security: Transactions are processed via Stripe (PCI-compliant). JWD does not store raw credit card details on our servers.",
            law4: "4. Voucher Policy: Digital codes are equivalent to physical cards. Please save your code immediately. Digital products are non-refundable once the secret is issued, unless stated otherwise by the merchant.",
            law5: "5. Data Privacy: Your phone number is used solely for voucher delivery and transactional alerts. We do not share your contact info for unrelated marketing.",
            law6: "6. Disputes: For fulfillment issues or lost codes, please contact the Merchant first. JWD will assist in technical coordination for any unresolved disputes.",
            // Coupon
            couponCode: "Coupon Code",
            couponPlaceholder: "Enter coupon code",
            couponApply: "Apply",
            couponApplied: "Saved",
            couponInvalid: "Invalid coupon code",
            couponExpired: "Coupon has expired",
            couponExhausted: "Coupon is fully redeemed",
            couponMinPurchase: "Min. ${min} purchase required",
            originalPrice: "Subtotal",
            discount: "Discount",
            finalPrice: "Total",
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

                    // --- PROVIDER INFO ---
                    const { data: providerData } = await supabase
                        .from('provider_profiles')
                        .select('business_name_zh, business_name_en, user:user_profiles!provider_profiles_user_id_fkey (name, avatar)')
                        .eq('id', data.providerId)
                        .single();

                    if (providerData) {
                        setProvider({
                            name: (providerData as any).user?.name || (language === 'zh' ? providerData.business_name_zh : providerData.business_name_en),
                            avatar: (providerData as any).user?.avatar || ''
                        });
                    }

                    // --- INVENTORY CHECK (SECURE FACADE) ---
                    // Fetch available counts for all variants via safe view
                    // This view only contains ID and status, no sensitive card data
                    const { data: invData } = await supabase
                        .from('safe_inventory_levels')
                        .select('listing_item_id')
                        .in('listing_item_id', variants.map(v => v.id));

                    const counts: Record<string, number> = {};
                    variants.forEach(v => counts[v.id] = 0);
                    invData?.forEach(row => {
                        counts[row.listing_item_id] = (counts[row.listing_item_id] || 0) + 1;
                    });
                    setStockCounts(counts);

                    // Check if preselect parameter exists
                    let initialSelection: ListingItem | null = null;
                    if (preselectItemId && variants.length > 0) {
                        initialSelection = variants.find(v => v.id === preselectItemId) || variants[0];
                    } else if (variants.length > 0) {
                        initialSelection = variants[0];
                    }
                    setSelectedItem(initialSelection);

                    // --- ANTI-SPAM RESTOCK NOTIFICATION ---
                    // Trigger once on entry if ANY variant is out of stock.
                    // Server-side rate limiting (12h) will handle the rest.
                    const firstOosItem = variants.find(v => counts[v.id] === 0);
                    if (firstOosItem) {
                        handleRestockNotification(firstOosItem.id);
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

    // Validate coupon code
    const validateCoupon = async (code: string, amount: number) => {
        if (!code || !listing) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const { data, error } = await supabase.rpc('validate_and_apply_coupon', {
                p_code: code.toUpperCase(),
                p_provider_id: listing.providerId,
                p_amount: amount / 100, // Convert cents to dollars
                p_user_id: null,
                p_user_phone: phoneNumber || null
            });

            if (error) throw error;

            const result = data as any;
            if (result.valid) {
                setCouponId(result.coupon_id);
                setCouponDiscount(result.discount_amount * 100); // Convert to cents
                setCouponError('');
            } else {
                setCouponId(null);
                setCouponDiscount(null);
                // Map error codes to messages
                const errorMessages: Record<string, string> = {
                    invalid_code: t.couponInvalid,
                    coupon_expired: t.couponExpired,
                    coupon_exhausted: t.couponExhausted,
                    min_purchase_not_met: result.message || t.couponInvalid,
                    user_limit_exceeded: result.message || t.couponInvalid,
                };
                setCouponError(errorMessages[result.error] || result.message || t.couponInvalid);
            }
        } catch (error) {
            console.error('Failed to validate coupon:', error);
            setCouponError(t.couponInvalid);
            setCouponId(null);
            setCouponDiscount(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    // Clear coupon when item changes
    const handleClearCoupon = () => {
        setCouponCode('');
        setCouponId(null);
        setCouponDiscount(null);
        setCouponError('');
    };

    // Auto-apply coupon from URL
    useEffect(() => {
        if (couponFromUrl && selectedItem && listing) {
            setCouponCode(couponFromUrl.toUpperCase());
            validateCoupon(couponFromUrl, selectedItem.pricing.price.amount);
        }
    }, [couponFromUrl, selectedItem?.id, listing?.id]);

    // Re-validate coupon when selected item changes
    useEffect(() => {
        if (couponCode && selectedItem && listing && couponId) {
            validateCoupon(couponCode, selectedItem.pricing.price.amount);
        }
    }, [selectedItem?.id]);

    const handleRestockNotification = async (itemId: string) => {
        console.log('[📢 Restock] Triggering notification for item:', itemId);
        try {
            await supabase.functions.invoke('notify-restock', {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: { listingItemId: itemId },
            });
        } catch (err) {
            console.error('[❌ Restock] Failed to notify provider:', err);
        }
    };

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
            // Re-check inventory right before paying (Double Safety - SECURE FACADE)
            const { data: invCheck } = await supabase
                .from('safe_inventory_levels')
                .select('id')
                .eq('listing_item_id', selectedItem.id)
                .limit(1);

            if (!invCheck || invCheck.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Sold Out",
                    description: t.inventoryError,
                });
                setProcessing(false);
                return;
            }

            // Calculate final price with coupon discount
            const originalPrice = selectedItem.pricing.price.amount;
            const finalPrice = couponDiscount ? Math.max(0, originalPrice - couponDiscount) : originalPrice;

            // Create Stripe Checkout Session
            console.log('[🔵 Checkout] Creating Stripe checkout session...', {
                originalPrice,
                couponDiscount,
                finalPrice,
                couponId,
                couponCode
            });

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: {
                    listingItemId: selectedItem.id,
                    phoneNumber,
                    productName: (language === 'zh'
                        ? `${listing?.titleZh} - ${selectedItem.nameZh}`
                        : `${listing?.titleEn} - ${selectedItem.nameEn}`) || 'Neighbourhood Service',
                    price: finalPrice, // Apply discount to final price
                    originalPrice: originalPrice, // Keep original for records
                    currency: selectedItem.pricing.price.currency.toLowerCase(),
                    masterId: id,
                    // Coupon info
                    couponId: couponId || undefined,
                    couponCode: couponCode || undefined,
                    couponDiscount: couponDiscount || undefined,
                },
            });

            if (error || !data?.url) {
                console.error('[❌ Checkout] Stripe session error details:', error);
                throw error || new Error("Failed to create checkout session: No URL or error occurred.");
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
        <div className="max-w-md mx-auto min-h-screen bg-muted/5 flex flex-col font-sans">
            {/* Header - Premium Look */}
            <header className="px-6 py-10 text-center bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-primary/5">
                {isQuickBuyMode && selectedItem ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
                            <QrCode className="w-3 h-3" /> {t.quickBuyTitle}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-primary leading-tight mb-1">
                            {language === 'zh' ? selectedItem.nameZh : selectedItem.nameEn}
                        </h1>
                        {(selectedItem.nameEn && selectedItem.nameEn !== selectedItem.nameZh && language === 'zh') && (
                            <p className="text-muted-foreground font-medium text-sm">{selectedItem.nameEn}</p>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="text-4xl font-black text-primary">${(selectedItem.pricing.price.amount / 100).toFixed(0)}</span>
                            <span className="text-sm font-bold text-muted-foreground self-end mb-1">CAD</span>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                            {language === 'zh' ? listing.titleZh : listing.titleEn}
                        </h1>
                        {(listing.titleEn && listing.titleEn !== listing.titleZh && language === 'zh') && (
                            <p className="text-muted-foreground font-medium mt-2">{listing.titleEn}</p>
                        )}
                    </div>
                )}
            </header>

            <main className="px-5 flex-1 pb-40 space-y-8 mt-6">
                {!success ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Step 1: Select SKU */}
                        {!isQuickBuyMode && (
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">{t.chooseItem}</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    {items.map(item => (
                                        <Card
                                            key={item.id}
                                            className={`cursor-pointer border-2 transition-all card-warm relative overflow-hidden ${selectedItem?.id === item.id ? 'border-primary ring-4 ring-primary/10 shadow-elevated' : 'border-transparent hover:border-primary/20'} ${stockCounts[item.id] === 0 ? 'opacity-70 grayscale-[0.2]' : ''}`}
                                            onClick={() => {
                                                setSelectedItem(item);
                                            }}
                                        >
                                            <CardContent className="p-5 flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <p className="font-black text-lg leading-none truncate text-card-foreground">
                                                            {item.nameZh}
                                                        </p>
                                                        {stockCounts[item.id] === 0 && (
                                                            <Badge variant="destructive" className="text-[9px] h-4 px-1.5 font-black uppercase tracking-tighter rounded-sm">
                                                                {t.outOfStock}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground/80 font-medium line-clamp-2 leading-relaxed">
                                                        {language === 'zh' ? (item.descriptionZh || item.nameEn) : (item.descriptionEn || item.nameEn)}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0 flex flex-col items-end">
                                                    <p className="text-2xl font-black text-primary leading-none">
                                                        ${(item.pricing.price.amount / 100).toFixed(0)}
                                                    </p>
                                                    <span className="text-[9px] font-black text-muted-foreground/60 mt-1 uppercase tracking-widest">CAD</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Buy Mode Links */}
                        {isQuickBuyMode && (
                            <div className="text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-bold text-muted-foreground/60 hover:text-primary rounded-full px-4"
                                    onClick={() => navigate(`/scan/${id}`)}
                                >
                                    {t.viewAllVariants} <QrCode className="w-3 h-3 ml-2 opacity-50" />
                                </Button>
                            </div>
                        )}

                        {/* Out of Stock Warning */}
                        {selectedItem && stockCounts[selectedItem.id] === 0 && (
                            <div className="p-5 py-7 bg-red-50/50 border border-red-100 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-red-50">
                                    <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-red-600 font-black leading-tight mb-0.5">
                                        {t.inventoryError}
                                    </p>
                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                                        RESTOCKING IN PROGRESS
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Coupon Code */}
                        <div className="space-y-3">
                            <Label htmlFor="coupon" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                                <Ticket className="w-3.5 h-3.5" /> {t.couponCode}
                            </Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="coupon"
                                        type="text"
                                        placeholder={t.couponPlaceholder}
                                        className="h-12 rounded-xl border-2 focus-visible:ring-primary/20 bg-white font-mono font-bold px-4 pr-10 uppercase"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!couponDiscount}
                                    />
                                    {couponCode && !couponDiscount && (
                                        <button
                                            type="button"
                                            onClick={handleClearCoupon}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                {couponDiscount ? (
                                    <Button
                                        variant="outline"
                                        onClick={handleClearCoupon}
                                        className="h-12 px-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {t.couponApplied}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => selectedItem && validateCoupon(couponCode, selectedItem.pricing.price.amount)}
                                        disabled={!couponCode || validatingCoupon || !selectedItem}
                                        className="h-12 px-6 rounded-xl font-bold"
                                    >
                                        {validatingCoupon ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            t.couponApply
                                        )}
                                    </Button>
                                )}
                            </div>
                            {couponError && (
                                <p className="text-sm text-red-500 font-medium px-1">{couponError}</p>
                            )}
                            {couponDiscount && selectedItem && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t.originalPrice}</span>
                                        <span className="font-bold">${(selectedItem.pricing.price.amount / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>{t.discount}</span>
                                        <span className="font-bold">-${(couponDiscount / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black border-t border-emerald-200 pt-2">
                                        <span>{t.finalPrice}</span>
                                        <span className="text-primary">${((selectedItem.pricing.price.amount - couponDiscount) / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 3: Phone */}
                        <div className="space-y-4">
                            <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> {t.enterPhone}
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder={t.phonePlaceholder}
                                className="text-xl h-16 rounded-2xl border-2 focus-visible:ring-primary/20 bg-white font-black px-6 shadow-sm"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    {t.securePayment}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    {t.jwdGuarantee}
                                </div>
                            </div>
                        </div>

                        {/* Merchant Info Card (Trust) */}
                        {provider && (
                            <div className="pt-8 mb-8 border-t border-dashed border-muted-foreground/20">
                                <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-muted-foreground/5 shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted border-2 border-white shadow-md">
                                        <img
                                            src={provider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.name}`}
                                            alt={provider.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.postedBy}</span>
                                        <p className="text-lg font-black text-foreground leading-none mt-1">{provider.name}</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-primary/20"></div>
                                            ))}
                                            <span className="text-[10px] font-black text-primary/40 uppercase ml-1">Verified Partner</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Powered by JWD */}
                        <div className="flex flex-col items-center justify-center gap-2 pb-10 opacity-50 grayscale hover:grayscale-0 transition-all scale-95 origin-center">
                            <a
                                href="https://justwedo.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase hover:text-primary transition-colors"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" /> {t.poweredBy}
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight text-foreground">{t.successTitle}</h2>
                        <p className="text-muted-foreground font-medium mb-10">
                            {language === 'zh' ? '您的洗车服务已激活。' : 'Your car wash service is now active.'}
                        </p>

                        {/* Result Display */}
                        <Card className="w-full bg-white border-dashed border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden">
                            <CardContent className="p-8">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-black">{t.cardNumber}</p>
                                <div className="text-4xl font-mono font-black text-primary tracking-tighter mb-6 bg-muted/30 py-4 rounded-xl">
                                    {allocatedItem?.serialNumber || 'B8C1-DE23'}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 font-bold"
                                >
                                    {t.copyBtn}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Reward Section (Upsell) */}
                        <div className="mt-12 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[40px] border border-amber-100 w-full shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <div className="flex items-center justify-center gap-2 text-amber-600 font-black mb-3 text-xl">
                                <Gift className="w-6 h-6" /> {t.rewardTitle}
                            </div>
                            <p className="text-amber-900/60 text-sm mb-8 font-medium leading-relaxed px-4">
                                {t.rewardDesc}
                            </p>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-amber-200 transition-all active:scale-[0.98]">
                                {t.registerBtn}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer / CTA - Only show when NOT success */}
            {!success && (
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-xl border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[32px] flex flex-col gap-4 animate-in slide-in-from-bottom-full duration-700">
                    <div className="flex items-start gap-3 px-1">
                        <Checkbox
                            id="agree"
                            className="w-3.5 h-3.5 mt-1 border-[1.5px] border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[3px] shrink-0"
                            checked={isAgreed}
                            onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
                        />
                        <label htmlFor="agree" className="text-xs font-bold leading-tight text-muted-foreground/80">
                            {t.agreement}
                            <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
                                <DialogTrigger asChild>
                                    <button className="text-primary hover:underline ml-1 underline-offset-2">{t.agreementLink}</button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] rounded-[32px] overflow-hidden p-0 gap-0 border-none shadow-2xl">
                                    <DialogHeader className="p-8 pb-4 bg-muted/30">
                                        <DialogTitle className="text-2xl font-black tracking-tight">{t.disclaimerTitle}</DialogTitle>
                                        <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Legal Compliance</DialogDescription>
                                    </DialogHeader>
                                    <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6 bg-card">
                                        <p className="text-sm font-black text-foreground leading-relaxed italic border-l-4 border-primary/40 pl-4 bg-primary/5 py-3 rounded-r-xl">
                                            {t.disclaimerContent}
                                        </p>
                                        <div className="space-y-4 text-xs text-muted-foreground font-bold leading-relaxed px-1">
                                            <p>{t.law1}</p>
                                            <p>{t.law2}</p>
                                            <p>{t.law3}</p>
                                            <p>{t.law4}</p>
                                            <p>{t.law5}</p>
                                            <p>{t.law6}</p>
                                        </div>
                                    </div>
                                    <div className="p-8 pt-0">
                                        <Button className="w-full h-14 rounded-2xl font-black text-lg" onClick={() => setShowAgreement(false)}>Got it</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </label>
                    </div>
                    <Button
                        className="w-full h-15 text-xl font-black gap-3 shadow-2xl shadow-primary/30 rounded-2xl active:scale-[0.98] transition-all py-7"
                        disabled={processing || !phoneNumber || !selectedItem || stockCounts[selectedItem.id || ''] === 0 || !isAgreed}
                        onClick={handlePay}
                    >
                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                        {processing ? t.paying : (
                            <>
                                {t.payBtn}
                                {selectedItem && (
                                    <span className="ml-2">
                                        ${((selectedItem.pricing.price.amount - (couponDiscount || 0)) / 100).toFixed(2)}
                                    </span>
                                )}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default QuickScanCheckout;
