import { Home, PlusCircle, ClipboardList, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    icon: <Home className="w-6 h-6" />,
    activeIcon: <Home className="w-6 h-6 fill-current" />,
    label: "首页",
    path: "/",
  },
  {
    icon: <PlusCircle className="w-6 h-6" />,
    activeIcon: <PlusCircle className="w-6 h-6 fill-current" />,
    label: "发布",
    path: "/post",
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    activeIcon: <ClipboardList className="w-6 h-6 fill-current" />,
    label: "订单",
    path: "/orders",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    activeIcon: <MessageCircle className="w-6 h-6 fill-current" />,
    label: "消息",
    path: "/messages",
  },
  {
    icon: <User className="w-6 h-6" />,
    activeIcon: <User className="w-6 h-6 fill-current" />,
    label: "我的",
    path: "/profile",
  },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on detail pages
  if (location.pathname.includes("/service/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isPost = item.path === "/post";

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200 ${
                isPost 
                  ? "relative -mt-4" 
                  : ""
              }`}
            >
              {isPost ? (
                <div className="w-14 h-14 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
                  <PlusCircle className="w-7 h-7 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <div className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {isActive ? item.activeIcon : item.icon}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </>
              )}
              {isPost && (
                <span className="text-xs font-medium text-primary mt-1">
                  {item.label}
                </span>
              )}
              {/* Notification badge for messages */}
              {item.path === "/messages" && (
                <span className="absolute top-2 right-1/4 w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-accent-foreground flex items-center justify-center">
                  2
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
