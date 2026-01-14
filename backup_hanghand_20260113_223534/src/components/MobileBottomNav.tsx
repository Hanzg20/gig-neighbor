import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, MessageCircle, ShoppingCart, User, MapPin } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useConfigStore } from "@/stores/configStore";
import { motion } from "framer-motion";

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const language = useConfigStore(state => state.language);
    const location = useLocation();
    const { currentUser } = useAuthStore();
    const { getTotalItems } = useCartStore();

    const cartItemCount = currentUser ? getTotalItems() : 0;

    const navItems = [
        { icon: Home, label: language === 'zh' ? '首页' : 'Home', path: '/', badge: null },
        { icon: MapPin, label: language === 'zh' ? '地图' : 'Map', path: '/discover', badge: null },
        { icon: Compass, label: language === 'zh' ? '社区' : 'Social', path: '/community', badge: null },
        { icon: MessageCircle, label: language === 'zh' ? '消息' : 'Chat', path: '/chat', badge: 0 },
        { icon: User, label: language === 'zh' ? '我' : 'Me', path: '/profile', badge: null },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // Hide bottom nav for scan purchases and payment success page
    const shouldHideNav = location.pathname.startsWith('/scan/') ||
        location.pathname === '/payment-success';

    if (shouldHideNav) {
        return null;
    }

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-sticky-bar safe-area-bottom"
        >
            <div className="grid grid-cols-5 h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <motion.button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            whileTap={{ scale: 0.9 }}
                            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${active
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <motion.div
                                animate={{ scale: active ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Icon className="w-6 h-6" />
                                {item.badge !== null && item.badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                                    >
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </motion.span>
                                )}
                            </motion.div>

                            <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>

                            {active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default MobileBottomNav;
