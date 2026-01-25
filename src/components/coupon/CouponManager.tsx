import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    MoreVertical,
    Trash2,
    Eye,
    Copy,
    Loader2,
    Ticket,
    Calendar,
    Users,
    Percent,
    DollarSign,
} from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CouponCard, CouponData } from './CouponCard';
import { CreateCouponDialog } from './CreateCouponDialog';
import { cn } from '@/lib/utils';

interface CouponManagerProps {
    providerId: string;
    providerName: string;
    providerLogo?: string;
}

interface DBCoupon {
    id: string;
    code: string;
    name: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_discount: number | null;
    max_uses: number | null;
    used_count: number;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
    created_at: string;
}

const i18n = {
    zh: {
        title: '优惠券管理',
        create: '创建优惠券',
        empty: '暂无优惠券',
        emptyDesc: '创建您的第一张优惠券，吸引更多顾客',
        active: '生效中',
        inactive: '已停用',
        expired: '已过期',
        used: '已使用',
        times: '次',
        unlimited: '不限',
        validUntil: '有效期至',
        minPurchase: '满',
        canUse: '可用',
        noLimit: '无门槛',
        view: '查看',
        copyCode: '复制优惠码',
        delete: '删除',
        deleteConfirm: '确定要删除这张优惠券吗？',
        copied: '优惠码已复制',
        deleted: '优惠券已删除',
        toggleSuccess: '状态已更新',
    },
    en: {
        title: 'Coupon Management',
        create: 'Create Coupon',
        empty: 'No coupons yet',
        emptyDesc: 'Create your first coupon to attract more customers',
        active: 'Active',
        inactive: 'Inactive',
        expired: 'Expired',
        used: 'Used',
        times: 'times',
        unlimited: 'Unlimited',
        validUntil: 'Valid until',
        minPurchase: 'Min.',
        canUse: 'purchase',
        noLimit: 'No minimum',
        view: 'View',
        copyCode: 'Copy Code',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete this coupon?',
        copied: 'Code copied',
        deleted: 'Coupon deleted',
        toggleSuccess: 'Status updated',
    }
};

export function CouponManager({
    providerId,
    providerName,
    providerLogo
}: CouponManagerProps) {
    const { language } = useConfigStore();
    const { toast } = useToast();
    const t = i18n[language] || i18n.en;

    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<DBCoupon[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [viewCoupon, setViewCoupon] = useState<CouponData | null>(null);

    // 加载优惠券列表
    const loadCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('provider_coupons')
                .select('*')
                .eq('provider_id', providerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Failed to load coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, [providerId]);

    // 切换优惠券状态
    const toggleCouponStatus = async (coupon: DBCoupon) => {
        try {
            const { error } = await supabase
                .from('provider_coupons')
                .update({ is_active: !coupon.is_active })
                .eq('id', coupon.id);

            if (error) throw error;

            setCoupons(prev => prev.map(c =>
                c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
            ));

            toast({ title: t.toggleSuccess });
        } catch (error) {
            console.error('Failed to toggle coupon:', error);
        }
    };

    // 删除优惠券
    const deleteCoupon = async (couponId: string) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            const { error } = await supabase
                .from('provider_coupons')
                .delete()
                .eq('id', couponId);

            if (error) throw error;

            setCoupons(prev => prev.filter(c => c.id !== couponId));
            toast({ title: t.deleted });
        } catch (error) {
            console.error('Failed to delete coupon:', error);
        }
    };

    // 复制优惠码
    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: t.copied });
    };

    // 获取状态
    const getCouponStatus = (coupon: DBCoupon) => {
        const now = new Date();
        const validUntil = new Date(coupon.valid_until);

        if (validUntil < now) return 'expired';
        if (!coupon.is_active) return 'inactive';
        return 'active';
    };

    // 转换为 CouponData
    const toCouponData = (coupon: DBCoupon): CouponData => ({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || undefined,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minPurchase: coupon.min_purchase,
        maxDiscount: coupon.max_discount || undefined,
        validUntil: coupon.valid_until,
        providerName,
        providerLogo,
    });

    // 格式化日期
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(
            language === 'zh' ? 'zh-CN' : 'en-US',
            { year: 'numeric', month: 'short', day: 'numeric' }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 头部 */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.title}</h2>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.create}
                </Button>
            </div>

            {/* 空状态 */}
            {coupons.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t.empty}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            {t.emptyDesc}
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t.create}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* 优惠券列表 */
                <div className="grid gap-4">
                    {coupons.map(coupon => {
                        const status = getCouponStatus(coupon);
                        return (
                            <Card key={coupon.id} className={cn(
                                "transition-opacity",
                                status !== 'active' && "opacity-60"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* 左侧: 优惠信息 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* 折扣金额 */}
                                                <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                                                    {coupon.discount_type === 'percentage' ? (
                                                        <>
                                                            <Percent className="w-5 h-5" />
                                                            {coupon.discount_value}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DollarSign className="w-5 h-5" />
                                                            {coupon.discount_value}
                                                        </>
                                                    )}
                                                </div>

                                                {/* 优惠券名称 */}
                                                <div>
                                                    <h3 className="font-medium">{coupon.name}</h3>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {coupon.code}
                                                    </p>
                                                </div>

                                                {/* 状态标签 */}
                                                <Badge variant={
                                                    status === 'active' ? 'default' :
                                                        status === 'expired' ? 'destructive' : 'secondary'
                                                }>
                                                    {status === 'active' ? t.active :
                                                        status === 'expired' ? t.expired : t.inactive}
                                                </Badge>
                                            </div>

                                            {/* 详情 */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {t.validUntil} {formatDate(coupon.valid_until)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {t.used} {coupon.used_count}
                                                    {coupon.max_uses ? `/${coupon.max_uses}` : ''} {t.times}
                                                </span>
                                                <span>
                                                    {coupon.min_purchase > 0
                                                        ? `${t.minPurchase} $${coupon.min_purchase} ${t.canUse}`
                                                        : t.noLimit}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 右侧: 操作 */}
                                        <div className="flex items-center gap-3">
                                            {/* 启用/禁用开关 */}
                                            <Switch
                                                checked={coupon.is_active}
                                                onCheckedChange={() => toggleCouponStatus(coupon)}
                                                disabled={status === 'expired'}
                                            />

                                            {/* 更多操作 */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setViewCoupon(toCouponData(coupon))}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        {t.view}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => copyCode(coupon.code)}
                                                    >
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        {t.copyCode}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => deleteCoupon(coupon.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {t.delete}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* 创建优惠券弹窗 */}
            <CreateCouponDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                providerId={providerId}
                providerName={providerName}
                providerLogo={providerLogo}
                onCreated={() => loadCoupons()}
            />

            {/* 查看优惠券弹窗 */}
            <Dialog open={!!viewCoupon} onOpenChange={() => setViewCoupon(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{viewCoupon?.name}</DialogTitle>
                    </DialogHeader>
                    {viewCoupon && (
                        <div className="flex justify-center py-4">
                            <CouponCard coupon={viewCoupon} size="medium" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CouponManager;
