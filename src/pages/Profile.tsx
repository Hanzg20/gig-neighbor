import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings, MapPin, Package, Store, Shield,
    ChevronRight, LogOut, Bell, CreditCard, Layout,
    UserCircle, ShieldCheck, HelpCircle, Languages,
    Briefcase, Milestone, PlusCircle, UserCircle2, Star
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { Button } from "@/components/ui/button";

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuthStore();
    const { language } = useConfigStore();

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
        personalCenter: language === 'zh' ? '个人中心' : 'Personal Center',
        viewSocialProfile: language === 'zh' ? '查看社交主页' : 'My Public Profile',
        walletTitle: language === 'zh' ? '金豆余额' : 'JinBean Balance',
        topUp: language === 'zh' ? '充值' : 'Top up',
        logout: language === 'zh' ? '退出登录' : 'Sign Out',

        // Sections
        secTrade: language === 'zh' ? '买家管理' : 'Shopping',
        secAccount: language === 'zh' ? '帐号设置' : 'Account',
        secSystem: language === 'zh' ? '系统' : 'System',

        // Items
        orders: language === 'zh' ? '我的订单' : 'My Orders',
        listings: language === 'zh' ? '我的发布' : 'My Posts',
        wallet: language === 'zh' ? '金豆中心' : 'Wallet',
        address: language === 'zh' ? '收货地址' : 'Addresses',
        profile: language === 'zh' ? '基本资料' : 'Personal Info',
        verification: language === 'zh' ? '实名认证' : 'Verification',
        language: language === 'zh' ? '语言设置' : 'Language',
        help: language === 'zh' ? '帮助中心' : 'Help Center'
    };

    const menuGroups = [
        {
            title: t.secTrade,
            items: [
                { icon: Package, label: t.orders, path: '/orders' },
                { icon: Layout, label: t.listings, path: '/my-listings' },
                { icon: CreditCard, label: t.wallet, path: '/wallet', badge: currentUser.beansBalance },
                { icon: MapPin, label: t.address, path: '/addresses' },
            ]
        },
        {
            title: t.secAccount,
            items: [
                { icon: UserCircle, label: t.profile, path: '/settings/profile' },
                { icon: ShieldCheck, label: t.verification, path: '/verification' },
                { icon: Bell, label: language === 'zh' ? '消息通知' : 'Notifications', path: '/notifications' },
            ]
        },
        {
            title: t.secSystem,
            items: [
                { icon: Languages, label: t.language, path: '/settings/language' },
                { icon: HelpCircle, label: t.help, path: '/help' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24">
            <Header />

            <div className="max-w-2xl mx-auto pt-6 px-4 space-y-6">
                {/* User Info Header - Traditional Style */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={currentUser.avatar}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                alt=""
                            />
                            {isProvider && (
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white">
                                    <Shield className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-black">{currentUser.name}</h2>
                            <p className="text-xs text-muted-foreground font-medium mb-1">ID: {currentUser.id.slice(0, 8)}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-0 text-primary font-bold text-xs flex gap-1 items-center hover:bg-transparent"
                                onClick={() => navigate(`/user/${currentUser.id}`)}
                            >
                                <UserCircle2 className="w-3 h-3" />
                                {t.viewSocialProfile}
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards (Quick Actions) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-[28px] text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer" onClick={() => navigate('/wallet')}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.walletTitle}</p>
                        <p className="text-2xl font-black mt-1 leading-none">{currentUser.beansBalance}</p>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{t.topUp}</span>
                            <CreditCard className="w-4 h-4 opacity-50" />
                        </div>
                    </div>
                    {isProvider ? (
                        <div className="bg-white p-5 rounded-[28px] border border-black/5 shadow-sm active:scale-95 transition-all cursor-pointer flex flex-col justify-between" onClick={() => navigate('/provider/dashboard')}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workplace</p>
                                <p className="text-base font-black text-foreground mt-1">{language === 'zh' ? '工作台' : 'Pro Hub'}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary">View Stats</span>
                                <Milestone className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-5 rounded-[28px] border border-black/5 shadow-sm active:scale-95 transition-all cursor-pointer flex flex-col justify-between" onClick={() => navigate('/become-provider')}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Become a Pro</p>
                                <p className="text-base font-black text-foreground mt-1">{language === 'zh' ? '去认证' : 'Verify Now'}</p>
                            </div>
                            <div className="flex items-center justify-between text-amber-600">
                                <span className="text-[10px] font-bold">Earn Beans</span>
                                <Star className="w-4 h-4" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu Groups */}
                <div className="space-y-6">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                {group.title}
                            </h3>
                            <div className="bg-white rounded-[28px] overflow-hidden border border-black/5 shadow-sm">
                                {group.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={() => navigate(item.path)}
                                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-black/5 transition-colors border-b last:border-none border-black/[0.03] group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="flex-1 text-left font-bold text-sm">{item.label}</span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/20" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    className="w-full h-14 rounded-[28px] bg-red-50 text-red-500 font-black flex gap-3 hover:bg-red-100/70 shadow-sm"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />
                    {t.logout}
                </Button>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
