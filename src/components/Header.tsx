import { Bell, User, Menu, PlusCircle, MessageCircle, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useCommunity } from "@/context/CommunityContext";
import { BeanBalance } from "./beans/BeanBalance";
import { useMessageStore } from "@/stores/messageStore";
import { useConfigStore } from "@/stores/configStore";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { currentUser, isLoading } = useAuthStore();
  const { activeNodeId } = useCommunity();
  const { totalUnreadCount, loadUnreadCount } = useMessageStore();
  const { language, setLanguage } = useConfigStore();

  // Load unread count on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadUnreadCount(currentUser.id);
    }
  }, [currentUser?.id, loadUnreadCount]);

  // Localized text dictionary
  const t = {
    discover: language === 'zh' ? '发现' : 'Discover',
    community: language === 'zh' ? '社区' : 'Community',
    orders: language === 'zh' ? '订单' : 'Orders',
    myPosts: language === 'zh' ? '我的发布' : 'My Posts',
    chat: language === 'zh' ? '消息' : 'Chat',
    post: language === 'zh' ? '发布' : 'Post',
    postSomething: language === 'zh' ? '发布需求' : 'Post Something',
    myProfile: language === 'zh' ? '我的主页' : 'My Profile',
    wait: language === 'zh' ? '稍候...' : 'Wait...',
    me: language === 'zh' ? '我' : 'Me',
    join: language === 'zh' ? '登录' : 'Join',
    neighborly: language === 'zh' ? '友爱邻里' : 'Neighborly',
    becomeProvider: language === 'zh' ? '成为达人' : 'Become Provider',
    brandName: language === 'zh' ? '恒帮' : 'HangHand',
  };

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HangHand" className="w-10 h-10 rounded-2xl object-cover shadow-warm" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter text-gradient">{t.brandName}</h1>
            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest -mt-1 text-center sm:text-left">{t.neighborly}</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
            {t.discover}
          </Link>
          <Link to="/community" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {t.community}
          </Link>
          <Link to="/orders" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {t.orders}
          </Link>
          <Link to="/become-provider" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {t.becomeProvider}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('zh')}>
                中文 {language === 'zh' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/post-gig" className="hidden sm:block">
            <Button size="sm" className="btn-action shadow-warm px-5">
              <PlusCircle className="w-4 h-4 mr-2" /> {t.post}
            </Button>
          </Link>

          {currentUser && (
            <div className="hidden sm:block">
              <BeanBalance showLabel={true} size="md" />
            </div>
          )}

          <button
            onClick={() => navigate(currentUser ? '/profile' : '/login')}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : currentUser ? (
              <img src={currentUser.avatar} className="w-7 h-7 rounded-full object-cover border border-card" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="hidden sm:block text-sm font-bold text-foreground">
              {isLoading ? t.wait : currentUser ? t.me : t.join}
            </span>
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
        <div className="md:hidden border-t border-border/20 bg-card/95 backdrop-blur-xl animate-scale-in">
          <nav className="container py-4 flex flex-col gap-2">
            <Link to="/" className="px-5 py-3 rounded-2xl text-sm font-bold text-foreground bg-primary/10 text-primary">
              {t.discover}
            </Link>
            <Link to="/community" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.community}
            </Link>
            <Link to="/become-provider" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.becomeProvider}
            </Link>
            <Link to="/post-gig" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.postSomething}
            </Link>
            <Link to="/my-listings" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.myPosts}
            </Link>
            <Link to="/profile" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.myProfile}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
