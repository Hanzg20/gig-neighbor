import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, User, PlusSquare, Store, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/stores/configStore";

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const language = useConfigStore(state => state.language);

    // Hide on specific pages
    if (
        location.pathname.startsWith("/scan") ||
        location.pathname.startsWith("/service/") ||
        location.pathname === "/checkout" ||
        location.pathname === "/payment-success" ||
        location.pathname.startsWith("/chat/")
    ) {
        return null;
    }

    const navItems = [
        {
            icon: Home,
            label: language === 'zh' ? '首页' : 'Home',
            path: "/",
        },
        {
            icon: MessageSquareQuote, // Changed from Store to MessageSquareQuote for JustTalk
            label: language === 'zh' ? '真言' : 'JustTalk',
            path: "/community",
        },
        {
            icon: PlusSquare,
            label: language === 'zh' ? '发布' : 'Post',
            path: "/publish", // Changed to central publish page
        },
        {
            icon: MessageSquare,
            label: language === 'zh' ? '消息' : 'Messages',
            path: "/chat", // Confirmed route
        },
        {
            icon: User,
            label: language === 'zh' ? '我' : 'Me',
            path: "/profile", // Confirmed route
        },
    ];


    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-14">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="flex-1 flex flex-col items-center justify-center h-full space-y-0.5 active:bg-gray-50 transition-colors"
                        >
                            <item.icon
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "w-6 h-6 transition-colors duration-200",
                                    isActive ? "text-primary" : "text-gray-400"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-medium transition-colors duration-200",
                                    isActive ? "text-primary" : "text-gray-400"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
