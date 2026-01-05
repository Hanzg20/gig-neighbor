import { useNavigate } from "react-router-dom";
import {
    TrendingUp, DollarSign, Package, Star, Clock,
    Users, Calendar, ArrowUpRight, ChevronRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { useListingStore } from "@/stores/listingStore";
import { Button } from "@/components/ui/button";

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { orders } = useOrderStore();
    const { listings } = useListingStore();

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

    // Get provider's orders (as seller)
    const myOrders = orders.filter(o => {
        // In production: o.providerId === currentProviderProfile.id
        return true; // For mock, show all
    });

    // Calculate stats
    const totalRevenue = myOrders.reduce((sum, o) =>
        o.status === 'COMPLETED' ? sum + o.pricing.total.amount : sum, 0
    );
    const pendingRevenue = myOrders.reduce((sum, o) =>
        ['PENDING_CONFIRMATION', 'IN_PROGRESS'].includes(o.status) ? sum + o.pricing.total.amount : sum, 0
    );
    const completedOrders = myOrders.filter(o => o.status === 'COMPLETED').length;
    const activeOrders = myOrders.filter(o =>
        ['PENDING_CONFIRMATION', 'IN_PROGRESS'].includes(o.status)
    ).length;

    // Mock weekly revenue data
    const weeklyRevenue = [
        { day: '周一', amount: 15000 },
        { day: '周二', amount: 22000 },
        { day: '周三', amount: 18000 },
        { day: '周四', amount: 28000 },
        { day: '周五', amount: 35000 },
        { day: '周六', amount: 42000 },
        { day: '周日', amount: 38000 },
    ];

    const maxRevenue = Math.max(...weeklyRevenue.map(d => d.amount));

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container max-w-7xl py-8 px-4">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold mb-2">服务商工作台</h1>
                    <p className="text-muted-foreground">
                        欢迎回来，{currentUser.name} 👋
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card-warm p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-green-700">总收益</span>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-green-900 mb-1">
                            ¥{(totalRevenue / 100).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>+12.5% 较上周</span>
                        </div>
                    </div>

                    <div className="card-warm p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">待结算</span>
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold mb-1">
                            ¥{(pendingRevenue / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{activeOrders} 个进行中订单</p>
                    </div>

                    <div className="card-warm p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">完成订单</span>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold mb-1">{completedOrders}</p>
                        <p className="text-xs text-muted-foreground">本月共 {myOrders.length} 单</p>
                    </div>

                    <div className="card-warm p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">服务评分</span>
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold mb-1">4.9</p>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 card-warm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">本周收入趋势</h3>
                            <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                本周
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {weeklyRevenue.map((data, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground w-8">{data.day}</span>
                                    <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                                            style={{ width: `${(data.amount / maxRevenue) * 100}%` }}
                                        >
                                            <span className="text-xs font-bold text-primary-foreground">
                                                ¥{(data.amount / 100).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-extrabold">¥{(weeklyRevenue.reduce((s, d) => s + d.amount, 0) / 100).toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">本周总计</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold">¥{(weeklyRevenue.reduce((s, d) => s + d.amount, 0) / weeklyRevenue.length / 100).toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">日均收入</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-green-600">+15%</p>
                                    <p className="text-xs text-muted-foreground mt-1">环比增长</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="card-warm p-6">
                            <h3 className="font-bold text-lg mb-4">快捷操作</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/my-listings')}
                                    className="w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">我的发布</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </button>

                                <button
                                    onClick={() => navigate('/provider/orders')}
                                    className="w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                        <div className="text-left">
                                            <p className="font-semibold">订单管理</p>
                                            <p className="text-xs text-muted-foreground">{activeOrders} 个待处理</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </button>

                                <button
                                    onClick={() => navigate('/post-gig')}
                                    className="w-full p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Package className="w-5 h-5" />
                                    <span className="font-semibold">发布新服务</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card-warm p-6">
                            <h3 className="font-bold text-lg mb-4">最新动态</h3>
                            <div className="space-y-3">
                                <div className="flex gap-3 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">新订单</p>
                                        <p className="text-xs text-muted-foreground">2分钟前</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">收到新评价</p>
                                        <p className="text-xs text-muted-foreground">1小时前</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">服务浏览量 +23</p>
                                        <p className="text-xs text-muted-foreground">3小时前</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProviderDashboard;
