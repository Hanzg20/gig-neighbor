import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Settings, Heart, MapPin, Package, Store, Shield,
    ChevronRight, LogOut, Bell, CreditCard, Star, Layout,
    UserCircle, ShieldCheck, HelpCircle, Languages, Trash2,
    Briefcase, Milestone
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuthStore();
    const { language } = useConfigStore();
    const [activeTab, setActiveTab] = useState<'buyer' | 'provider'>('buyer');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    const isProvider = currentUser.roles?.includes('PROVIDER');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const t = {
        buyerCenter: language === 'zh' ? '买家中心' : 'Buyer Hub',
        providerCenter: language === 'zh' ? '服务商中心' : 'Provider Hub',
        verifiedHelper: language === 'zh' ? '认证服务商' : 'Verified Helper',
        walletTitle: language === 'zh' ? '金豆余额' : 'JinBean Balance',
        recharge: language === 'zh' ? '充值' : 'Top up',
        becomeProviderTitle: language === 'zh' ? '成为服务商' : 'Become a Helper',
        becomeProviderDesc: language === 'zh' ? '发布你的专业技能，开启副业收入' : 'Share your skills and earn extra income in your community.',
        applyNow: language === 'zh' ? '立即申请认证' : 'Apply Now',
        logout: language === 'zh' ? '退出登录' : 'Sign Out',

        // Sections
        secTransactions: language === 'zh' ? '我的交易' : 'Transactions',
        secAccount: language === 'zh' ? '个人信息' : 'Account',
        secSystem: language === 'zh' ? '系统设置' : 'System',

        // Items
        favorites: language === 'zh' ? '我的收藏' : 'My Favorites',
        orders: language === 'zh' ? '我的订单' : 'My Orders',
        myPosts: language === 'zh' ? '我的发布' : 'My Posts',
        addresses: language === 'zh' ? '收货地址' : 'Address Book',
        wallet: language === 'zh' ? '金豆钱包' : 'JinBean Wallet',
        notifications: language === 'zh' ? '消息通知' : 'Notifications',

        dashboard: language === 'zh' ? '工作台' : 'Dashboard',
        manageListings: language === 'zh' ? '管理服务' : 'Manage Services',
        salesOrders: language === 'zh' ? '销售订单' : 'Sales Orders',
        reviews: language === 'zh' ? '评价管理' : 'Reviews',
        revenue: language === 'zh' ? '收入报表' : 'Revenue Report',

        personalInfo: language === 'zh' ? '基本资料' : 'Personal Profile',
        verification: language === 'zh' ? '身份认证' : 'Identity Verification',
        helpSupport: language === 'zh' ? '帮助与反馈' : 'Help & Support',
        language: language === 'zh' ? '语言设置' : 'Language',
        security: language === 'zh' ? '安全与隐私' : 'Security & Privacy',
    };

    const buyerMenu = [
        {
            section: t.secTransactions, items: [
                { icon: Heart, label: t.favorites, path: '/favorites' },
                { icon: Package, label: t.orders, path: '/orders' },
                { icon: Layout, label: t.myPosts, path: '/my-listings' },
                { icon: CreditCard, label: t.wallet, path: '/wallet', badge: currentUser.beansBalance },
            ]
        },
        {
            section: t.secAccount, items: [
                { icon: UserCircle, label: t.personalInfo, path: '/settings/profile' },
                { icon: MapPin, label: t.addresses, path: '/addresses' },
                { icon: ShieldCheck, label: t.verification, path: '/verification' },
            ]
        },
        {
            section: t.secSystem, items: [
                { icon: Bell, label: t.notifications, path: '/notifications', badge: 3 },
                { icon: Languages, label: t.language, path: '/settings/language' },
                { icon: HelpCircle, label: t.helpSupport, path: '/help' },
            ]
        }
    ];

    const providerMenu = [
        {
            section: t.secTransactions, items: [
                { icon: Milestone, label: t.dashboard, path: '/provider/dashboard' },
                { icon: Briefcase, label: t.manageListings, path: '/my-listings' },
                { icon: Package, label: t.salesOrders, path: '/provider/orders', badge: 2 },
                { icon: Star, label: t.reviews, path: '/provider/reviews' },
                { icon: CreditCard, label: t.revenue, path: '/provider/dashboard' },
            ]
        },
        {
            section: t.secAccount, items: [
                { icon: UserCircle, label: t.personalInfo, path: '/settings/profile' },
                { icon: ShieldCheck, label: t.verification, path: '/verification' },
            ]
        },
        {
            section: t.secSystem, items: [
                { icon: Bell, label: t.notifications, path: '/notifications' },
                { icon: Languages, label: t.language, path: '/settings/language' },
                { icon: HelpCircle, label: t.helpSupport, path: '/help' },
            ]
        }
    ];

    const currentMenu = activeTab === 'buyer' ? buyerMenu : providerMenu;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <div className="container max-w-2xl py-6 px-4">
                {/* User Card - Premium Glassmorphism */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/10 p-6 mb-6 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full -ml-12 -mb-12 blur-2xl" />

                    <div className="relative flex items-center gap-5">
                        <div className="relative">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xl"
                            />
                            {currentUser.isVerifiedProvider && (
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                    <Shield className="w-4 h-4 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-black tracking-tight">{currentUser.name}</h2>
                                {isProvider && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md border border-primary/20">
                                        PRO
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium mb-2">{currentUser.email}</p>
                            <div className="flex gap-2">
                                <div className="px-2.5 py-1 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/10 flex items-center gap-1.5 shadow-sm">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-bold">4.9</span>
                                </div>
                                <div className="px-2.5 py-1 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/10 flex items-center gap-1.5 shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-xs font-bold">{t.verifiedHelper}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/settings/profile')}
                            className="w-10 h-10 rounded-xl bg-background/50 backdrop-blur-md border border-primary/5 hover:bg-background flex items-center justify-center transition-all hover:shadow-md"
                        >
                            <Settings className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Beans Balance - Integrated into card */}
                    <div className="mt-6 pt-6 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shadow-inner">
                                <span className="text-2xl">🫘</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">{t.walletTitle}</p>
                                <p className="text-2xl font-black text-amber-800 tabular-nums">{currentUser.beansBalance}</p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 px-5 bg-amber-100 hover:bg-amber-200 text-amber-800 border-none rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                            onClick={() => navigate('/wallet')}
                        >
                            {t.recharge}
                        </Button>
                    </div>
                </div>

                {/* Role Toggle - Modern Pill */}
                {isProvider && (
                    <div className="flex p-1.5 bg-muted/50 backdrop-blur-sm border border-muted-foreground/5 rounded-2xl mb-8 shadow-inner">
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'buyer'
                                ? 'bg-background shadow-lg text-primary scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            {t.buyerCenter}
                        </button>
                        <button
                            onClick={() => setActiveTab('provider')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'provider'
                                ? 'bg-background shadow-lg text-primary scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                                }`}
                        >
                            <Store className="w-4 h-4" />
                            {t.providerCenter}
                        </button>
                    </div>
                )}

                {/* Grouped Menu List */}
                <div className="space-y-8 mb-8">
                    {currentMenu.map((group, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="px-2 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                {group.section}
                            </h3>
                            <div className="bg-card/50 rounded-3xl border border-muted-foreground/5 overflow-hidden shadow-sm">
                                {group.items.map((item, itemIdx) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-primary/5 transition-all group border-b border-muted-foreground/5 last:border-none`}
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-sm">
                                                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="flex-1 text-left font-bold text-sm">{item.label}</span>
                                            <div className="flex items-center gap-2">
                                                {item.badge !== undefined && item.badge !== null && (
                                                    <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-black rounded-full min-w-[1.5rem] text-center shadow-sm">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Switch to Provider Promo (if not provider) */}
                {!isProvider && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden group p-6 mb-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-primary/10 border border-primary/20 rounded-3xl shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:rotate-12 transition-transform">
                                <Store className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg mb-1">{t.becomeProviderTitle}</h3>
                                <p className="text-xs text-muted-foreground font-medium mb-4 leading-relaxed">
                                    {t.becomeProviderDesc}
                                </p>
                                <Button
                                    onClick={() => navigate('/become-provider')}
                                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {t.applyNow}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Logout - Integrated into style */}
                <button
                    onClick={handleLogout}
                    className="w-full px-6 py-4 flex items-center gap-4 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-2xl transition-all group text-red-600 hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-black text-sm">{t.logout}</span>
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
