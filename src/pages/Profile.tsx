import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Settings, Heart, MapPin, Package, Store, Shield,
    ChevronRight, LogOut, Bell, CreditCard, Star, Layout
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { Button } from "@/components/ui/button";

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuthStore();
    const { listings } = useListingStore();
    const [activeTab, setActiveTab] = useState<'buyer' | 'provider'>('buyer');

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const isProvider = currentUser.roles?.includes('PROVIDER');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = {
        buyer: [
            { icon: Heart, label: 'My Favorites', path: '/favorites', badge: null },
            { icon: Package, label: 'My Orders', path: '/orders', badge: null },
            { icon: Layout, label: 'My Posts', path: '/my-listings', badge: null },
            { icon: MapPin, label: 'Addresses', path: '/addresses', badge: null },
            { icon: CreditCard, label: 'JinBean Wallet', path: '/wallet', badge: currentUser.beansBalance },
            { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
        ],
        provider: [
            { icon: Store, label: 'Dashboard', path: '/provider/dashboard', badge: null },
            { icon: Layout, label: 'Manage Listings', path: '/my-listings', badge: null },
            { icon: Package, label: 'Sales Orders', path: '/provider/orders', badge: 2 },
            { icon: Star, label: 'Reviews', path: '/provider/reviews', badge: null },
            { icon: CreditCard, label: 'Revenue Report', path: '/provider/dashboard', badge: null },
        ]
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container max-w-2xl py-8 px-4">
                {/* User Card */}
                <div className="card-warm p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-card shadow-lg"
                            />
                            {currentUser.isVerifiedProvider && (
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                                    <Shield className="w-4 h-4 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold mb-1">{currentUser.name}</h2>
                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                            {isProvider && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                                    <Store className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-bold text-primary">服务商</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                            <Settings className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Beans Balance */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🫘</span>
                            </div>
                            <div>
                                <p className="text-xs text-amber-700/70 font-medium">金豆余额</p>
                                <p className="text-2xl font-extrabold text-amber-800">{currentUser.beansBalance}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-amber-300 text-amber-700 hover:bg-amber-100"
                        >
                            充值
                        </Button>
                    </div>
                </div>

                {/* Role Toggle (if user is provider) */}
                {isProvider && (
                    <div className="flex gap-2 mb-6 p-1 bg-muted rounded-full">
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`flex-1 py-2.5 px-4 rounded-full font-semibold text-sm transition-all ${activeTab === 'buyer'
                                ? 'bg-card shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            买家中心
                        </button>
                        <button
                            onClick={() => setActiveTab('provider')}
                            className={`flex-1 py-2.5 px-4 rounded-full font-semibold text-sm transition-all ${activeTab === 'provider'
                                ? 'bg-card shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Store className="w-4 h-4 inline mr-2" />
                            服务商中心
                        </button>
                    </div>
                )}

                {/* Menu List */}
                <div className="space-y-2 mb-6">
                    {menuItems[activeTab].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="w-full card-warm p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="flex-1 text-left font-semibold">{item.label}</span>
                                {item.badge !== null && item.badge > 0 && (
                                    <span className="px-2.5 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        );
                    })}
                </div>

                {/* Switch to Provider (if not provider) */}
                {!isProvider && (
                    <div className="card-warm p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <Store className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">成为服务商</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    发布你的专业技能，开启副业收入
                                </p>
                                <Button
                                    onClick={() => navigate('/become-provider')}
                                    className="btn-action w-full"
                                >
                                    立即申请认证
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full card-warm p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-red-600 group"
                >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-semibold">退出登录</span>
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
