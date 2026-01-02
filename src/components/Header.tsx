import { Bell, User, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
            <span className="text-xl">🤝</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gradient">HangHand</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">恒帮</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
            发现
          </a>
          <a href="#" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            社区广场
          </a>
          <a href="#" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            我的订单
          </a>
          <a href="#" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            成为服务者
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-accent-foreground flex items-center justify-center">
              3
            </span>
          </button>
          
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted hover:bg-muted/80 transition-colors">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">登录</span>
          </button>

          <button 
            className="md:hidden w-10 h-10 rounded-2xl bg-muted flex items-center justify-center"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-border/50 bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            <a href="#" className="px-4 py-3 rounded-2xl text-sm font-semibold text-foreground bg-muted">
              发现
            </a>
            <a href="#" className="px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              社区广场
            </a>
            <a href="#" className="px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              我的订单
            </a>
            <a href="#" className="px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              成为服务者
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
