import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useConfigStore } from '@/stores/configStore';
import { useAuthStore } from '@/stores/authStore';
import { TrendingUp, TrendingDown, DollarSign, Ticket, Users, Calendar, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CouponStats {
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
    averageDiscountAmount: number;
    conversionRate: number;
}

interface CouponData {
    id: string;
    code: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    validUntil: string;
    isActive: boolean;
    totalDiscountGiven: number;
}

interface RedemptionRecord {
    id: string;
    couponCode: string;
    couponName: string;
    userPhone: string;
    originalAmount: number;
    discountApplied: number;
    finalAmount: number;
    redeemedAt: string;
}

export const CouponAnalytics: React.FC = () => {
    const { language } = useConfigStore();
    const { currentUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<CouponStats>({
        totalCoupons: 0,
        activeCoupons: 0,
        totalRedemptions: 0,
        totalDiscountGiven: 0,
        averageDiscountAmount: 0,
        conversionRate: 0,
    });
    const [coupons, setCoupons] = useState<CouponData[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    const t = language === 'zh' ? {
        title: '优惠券分析',
        overview: '概览',
        performance: '使用情况',
        redemptions: '使用记录',
        totalCoupons: '总优惠券数',
        activeCoupons: '活跃优惠券',
        totalRedemptions: '总使用次数',
        totalDiscount: '总折扣金额',
        avgDiscount: '平均折扣',
        conversionRate: '转化率',
        couponCode: '优惠码',
        couponName: '名称',
        type: '类型',
        discount: '折扣',
        usage: '使用情况',
        status: '状态',
        totalDiscountGiven: '累计折扣',
        active: '活跃',
        inactive: '停用',
        expired: '已过期',
        percentage: '百分比',
        fixed: '固定金额',
        userPhone: '用户手机',
        originalAmount: '原价',
        discountApplied: '折扣',
        finalAmount: '最终价格',
        redeemedAt: '使用时间',
        noData: '暂无数据',
        export: '导出报表',
        last7Days: '最近7天',
        last30Days: '最近30天',
        last90Days: '最近90天',
        allTime: '全部时间',
    } : {
        title: 'Coupon Analytics',
        overview: 'Overview',
        performance: 'Performance',
        redemptions: 'Redemption History',
        totalCoupons: 'Total Coupons',
        activeCoupons: 'Active Coupons',
        totalRedemptions: 'Total Redemptions',
        totalDiscount: 'Total Discount Given',
        avgDiscount: 'Avg Discount',
        conversionRate: 'Conversion Rate',
        couponCode: 'Coupon Code',
        couponName: 'Name',
        type: 'Type',
        discount: 'Discount',
        usage: 'Usage',
        status: 'Status',
        totalDiscountGiven: 'Total Discount',
        active: 'Active',
        inactive: 'Inactive',
        expired: 'Expired',
        percentage: 'Percentage',
        fixed: 'Fixed',
        userPhone: 'User Phone',
        originalAmount: 'Original',
        discountApplied: 'Discount',
        finalAmount: 'Final',
        redeemedAt: 'Redeemed At',
        noData: 'No data available',
        export: 'Export Report',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        last90Days: 'Last 90 Days',
        allTime: 'All Time',
    };

    useEffect(() => {
        if (currentUser) {
            fetchAnalytics();
        }
    }, [currentUser, selectedPeriod]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Get provider profile
            const { data: profile } = await supabase
                .from('provider_profiles')
                .select('id')
                .eq('user_id', currentUser?.id)
                .single();

            if (!profile) {
                toast.error('Provider profile not found');
                return;
            }

            // Calculate date range
            const now = new Date();
            let startDate: Date | null = null;
            if (selectedPeriod === '7d') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (selectedPeriod === '30d') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else if (selectedPeriod === '90d') {
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            }

            // Fetch coupons
            const { data: couponsData } = await supabase
                .from('provider_coupons')
                .select('*')
                .eq('provider_id', profile.id);

            // Fetch redemptions with date filter
            let redemptionsQuery = supabase
                .from('coupon_redemptions')
                .select(`
                    *,
                    provider_coupons!inner (
                        code,
                        name,
                        provider_id
                    )
                `)
                .eq('provider_coupons.provider_id', profile.id);

            if (startDate) {
                redemptionsQuery = redemptionsQuery.gte('redeemed_at', startDate.toISOString());
            }

            const { data: redemptionsData } = await redemptionsQuery;

            // Calculate stats
            if (couponsData) {
                const now = new Date();
                const activeCoupons = couponsData.filter(c =>
                    c.is_active && new Date(c.valid_until) > now
                ).length;

                const totalRedemptions = redemptionsData?.length || 0;
                const totalDiscountGiven = redemptionsData?.reduce((sum, r) => sum + r.discount_applied, 0) || 0;
                const averageDiscountAmount = totalRedemptions > 0 ? totalDiscountGiven / totalRedemptions : 0;

                // Calculate conversion rate (redemptions / views, simplified to redemptions / coupons)
                const conversionRate = couponsData.length > 0
                    ? (totalRedemptions / (couponsData.reduce((sum, c) => sum + (c.max_uses || 100), 0))) * 100
                    : 0;

                setStats({
                    totalCoupons: couponsData.length,
                    activeCoupons,
                    totalRedemptions,
                    totalDiscountGiven,
                    averageDiscountAmount,
                    conversionRate,
                });

                // Process coupon data with redemption stats
                const couponMap = new Map<string, number>();
                redemptionsData?.forEach(r => {
                    const current = couponMap.get(r.coupon_id) || 0;
                    couponMap.set(r.coupon_id, current + r.discount_applied);
                });

                const processedCoupons: CouponData[] = couponsData.map(c => ({
                    id: c.id,
                    code: c.code,
                    name: c.name,
                    discountType: c.discount_type as 'percentage' | 'fixed',
                    discountValue: c.discount_value,
                    maxUses: c.max_uses,
                    usedCount: c.used_count,
                    validUntil: c.valid_until,
                    isActive: c.is_active,
                    totalDiscountGiven: couponMap.get(c.id) || 0,
                }));

                setCoupons(processedCoupons);
            }

            // Process redemption records
            if (redemptionsData) {
                const processedRedemptions: RedemptionRecord[] = redemptionsData.map(r => ({
                    id: r.id,
                    couponCode: r.provider_coupons.code,
                    couponName: r.provider_coupons.name,
                    userPhone: r.user_phone || 'N/A',
                    originalAmount: r.original_amount,
                    discountApplied: r.discount_applied,
                    finalAmount: r.final_amount,
                    redeemedAt: r.redeemed_at,
                }));

                setRedemptions(processedRedemptions.sort((a, b) =>
                    new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
                ));
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const getCouponStatus = (coupon: CouponData) => {
        const now = new Date();
        const validUntil = new Date(coupon.validUntil);

        if (validUntil < now) return { label: t.expired, variant: 'destructive' as const };
        if (!coupon.isActive) return { label: t.inactive, variant: 'secondary' as const };
        return { label: t.active, variant: 'default' as const };
    };

    const exportToCSV = () => {
        const headers = ['Coupon Code', 'User Phone', 'Original Amount', 'Discount', 'Final Amount', 'Redeemed At'];
        const rows = redemptions.map(r => [
            r.couponCode,
            r.userPhone,
            r.originalAmount.toFixed(2),
            r.discountApplied.toFixed(2),
            r.finalAmount.toFixed(2),
            format(new Date(r.redeemedAt), 'yyyy-MM-dd HH:mm:ss'),
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coupon-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Report exported successfully');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t.title}</h2>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="7d">{t.last7Days}</option>
                        <option value="30d">{t.last30Days}</option>
                        <option value="90d">{t.last90Days}</option>
                        <option value="all">{t.allTime}</option>
                    </select>
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        {t.export}
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{t.totalCoupons}</p>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.totalCoupons}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <p className="text-sm text-muted-foreground">{t.activeCoupons}</p>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.activeCoupons}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <p className="text-sm text-muted-foreground">{t.totalRedemptions}</p>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.totalRedemptions}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-500" />
                            <p className="text-sm text-muted-foreground">{t.totalDiscount}</p>
                        </div>
                        <p className="text-2xl font-bold mt-1">${stats.totalDiscountGiven.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-purple-500" />
                            <p className="text-sm text-muted-foreground">{t.avgDiscount}</p>
                        </div>
                        <p className="text-2xl font-bold mt-1">${stats.averageDiscountAmount.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-rose-500" />
                            <p className="text-sm text-muted-foreground">{t.conversionRate}</p>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.conversionRate.toFixed(1)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Tables */}
            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="performance">{t.performance}</TabsTrigger>
                    <TabsTrigger value="redemptions">{t.redemptions}</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.performance}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {coupons.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">{t.noData}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.couponCode}</TableHead>
                                            <TableHead>{t.couponName}</TableHead>
                                            <TableHead>{t.type}</TableHead>
                                            <TableHead>{t.discount}</TableHead>
                                            <TableHead>{t.usage}</TableHead>
                                            <TableHead>{t.totalDiscountGiven}</TableHead>
                                            <TableHead>{t.status}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.map((coupon) => {
                                            const status = getCouponStatus(coupon);
                                            return (
                                                <TableRow key={coupon.id}>
                                                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                                                    <TableCell>{coupon.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {coupon.discountType === 'percentage' ? t.percentage : t.fixed}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {coupon.discountType === 'percentage'
                                                            ? `${coupon.discountValue}%`
                                                            : `$${coupon.discountValue.toFixed(2)}`
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {coupon.usedCount}/{coupon.maxUses || '∞'}
                                                    </TableCell>
                                                    <TableCell>${coupon.totalDiscountGiven.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={status.variant}>{status.label}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="redemptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.redemptions}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {redemptions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">{t.noData}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.redeemedAt}</TableHead>
                                            <TableHead>{t.couponCode}</TableHead>
                                            <TableHead>{t.userPhone}</TableHead>
                                            <TableHead>{t.originalAmount}</TableHead>
                                            <TableHead>{t.discountApplied}</TableHead>
                                            <TableHead>{t.finalAmount}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {redemptions.map((redemption) => (
                                            <TableRow key={redemption.id}>
                                                <TableCell>
                                                    {format(new Date(redemption.redeemedAt), 'MMM dd, yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell className="font-mono">{redemption.couponCode}</TableCell>
                                                <TableCell>{redemption.userPhone}</TableCell>
                                                <TableCell>${redemption.originalAmount.toFixed(2)}</TableCell>
                                                <TableCell className="text-emerald-600">
                                                    -${redemption.discountApplied.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    ${redemption.finalAmount.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};