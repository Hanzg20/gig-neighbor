import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp, DollarSign, Package, Star, Clock,
    Users, Calendar, ArrowUpRight, ChevronRight,
    QrCode, Power, MessageSquare, AlertCircle,
    LayoutDashboard, PlusCircle, CheckCircle2,
    Search, Bell
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { useListingStore } from "@/stores/listingStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { orders } = useOrderStore();
    const { listingItems, listings } = useListingStore();
    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const isProvider = currentUser.roles?.includes('PROVIDER');

    if (!isProvider) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">需要服务商权限</h2>
                    <Button onClick={() => navigate('/become-provider')} className="btn-action">
                        申请成为服务商
                    </Button>
                </div>
            </div>
        );
    }

    // Filter logic
    const providerId = currentUser.providerProfileId;
    const myOrders = orders.filter(o => true); // Mock: all for now
    const pendingOrders = myOrders.filter(o => o.status === 'PENDING_CONFIRMATION').slice(0, 3);
    const topItems = listingItems.slice(0, 4); // Top 4 for quick stock toggle

    // Calculate stats
    const totalRevenue = myOrders.reduce((sum, o) =>
        o.status === 'COMPLETED' ? sum + o.pricing.total.amount : sum, 0
    );
    const activeOrdersCount = myOrders.filter(o =>
        ['PENDING_CONFIRMATION', 'IN_PROGRESS'].includes(o.status)
    ).length;

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <Header />

            {/* Heads-Up Header (Sticky-like sub-header) */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container max-w-7xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 pr-6 border-r">
                            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                工作台
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isAcceptingOrders ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-bold">{isAcceptingOrders ? '营业中' : '休息中'}</span>
                            <Switch
                                checked={isAcceptingOrders}
                                onCheckedChange={setIsAcceptingOrders}
                                className="scale-75"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-2xl shadow-warm flex items-center gap-2"
                            onClick={() => alert("QR Scanner Opening...")}
                        >
                            <QrCode className="w-5 h-5" />
                            <span>扫码核销</span>
                        </Button>
                        <button className="w-10 h-10 rounded-2xl bg-muted hover:bg-muted/80 flex items-center justify-center relative transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left/Main Column: Action Stream */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Action Required Stream */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    待办事项 ({activeOrdersCount})
                                </h2>
                                <button onClick={() => navigate('/provider/orders')} className="text-xs font-bold text-primary hover:underline">查看全部</button>
                            </div>

                            <div className="space-y-3">
                                {pendingOrders.length > 0 ? (
                                    pendingOrders.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white p-4 rounded-3xl border border-border/50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm">{order.snapshot?.masterTitle || '订单'}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                        <span className="font-bold text-foreground">${order.pricing.total.amount / 100}</span>
                                                        <span>•</span>
                                                        <span>{order.snapshot?.providerName || '买家'}</span>
                                                        <span>•</span>
                                                        <span>刚刚</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="rounded-xl font-bold border-green-200 text-green-700 hover:bg-green-50">接受</Button>
                                                <Button size="sm" variant="ghost" className="rounded-xl font-bold text-muted-foreground">拒绝</Button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="bg-white/50 border-2 border-dashed rounded-3xl p-8 text-center text-muted-foreground">
                                        全部处理完了，太棒了！ ✨
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 2. Business Pulse (Revenue Chart) */}
                        <section className="bg-white p-6 rounded-[32px] border border-border/50 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-black text-lg">营收概览</h3>
                                    <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-tight">本周主要经营指标</p>
                                </div>
                                <div className="flex gap-2 bg-muted p-1 rounded-xl">
                                    <button className="px-4 py-1.5 text-xs font-black bg-white rounded-lg shadow-sm">周</button>
                                    <button className="px-4 py-1.5 text-xs font-black text-muted-foreground">月</button>
                                </div>
                            </div>

                            {/* Simplified Bars */}
                            <div className="h-64 flex items-end justify-between gap-4 px-2">
                                {[35, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="relative w-full group">
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] py-1 px-2 rounded-lg font-black">$42.0</div>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                className={`w-full rounded-t-xl transition-all ${h > 70 ? 'bg-primary' : 'bg-primary/30'}`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t">
                                <div className="text-center border-r">
                                    <p className="text-2xl font-black text-foreground">¥{(totalRevenue / 100).toFixed(0)}</p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">昨日收入</p>
                                </div>
                                <div className="text-center border-r">
                                    <p className="text-2xl font-black text-foreground">284</p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">浏览量</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-green-600">+12%</p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">成交转化</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Business Pulpit */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* 1. Quick Inventory Toggle */}
                        <section className="bg-white p-6 rounded-[32px] border border-border/50 shadow-sm">
                            <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-500" />
                                快捷库存库
                            </h3>
                            <div className="space-y-4">
                                {topItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-2xl transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden">
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">{(item.nameEn || item.nameZh)?.[0]}</div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold truncate max-w-[120px]">{item.nameEn || item.nameZh || '商品规格'}</p>
                                                <p className="text-[10px] font-black text-primary">${item.pricing.price.amount / 100}</p>
                                            </div>
                                        </div>
                                        <Switch className="scale-75" checked={true} />
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full rounded-2xl text-xs font-bold text-primary hover:bg-primary/5 mt-2"
                                    onClick={() => navigate(`/provider/${currentUser.providerProfileId}?tab=inventory`)}
                                >
                                    进入完整库存管理 →
                                </Button>
                            </div>
                        </section>

                        {/* 2. Management Shortcuts Grid */}
                        <section className="bg-[#1A1C1E] p-6 rounded-[32px] shadow-xl text-white">
                            <h3 className="font-black text-sm uppercase tracking-widest text-white/50 mb-6">管理驾驶舱</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate('/my-listings')}
                                    className="p-4 rounded-[24px] bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black tracking-tight">我的发布</span>
                                </button>
                                <button
                                    onClick={() => navigate('/provider/orders')}
                                    className="p-4 rounded-[24px] bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black tracking-tight">订单流水</span>
                                </button>
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="p-4 rounded-[24px] bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black tracking-tight">私信咨询</span>
                                </button>
                                <button
                                    onClick={() => navigate('/post-gig')}
                                    className="p-4 rounded-[24px] bg-primary/20 border border-primary/30 hover:bg-primary/30 transition-all flex flex-col gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white group-hover:rotate-90 transition-transform">
                                        <PlusCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black tracking-tight">新增服务</span>
                                </button>
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProviderDashboard;
