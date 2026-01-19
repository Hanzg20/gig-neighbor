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
import { LitePost } from "./Community/LitePost";

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
    map: language === 'zh' ? '地图' : 'Map',
    community: language === 'zh' ? '渥说' : 'JustTalk',
    orders: language === 'zh' ? '订单' : 'Orders',
    myPosts: language === 'zh' ? '我的发布' : 'My Posts',
    chat: language === 'zh' ? '消息' : 'Chat',
    post: language === 'zh' ? '渥说一下' : 'JustTalk',
    postSomething: language === 'zh' ? '发布需求' : 'Post Something',
    myProfile: language === 'zh' ? '我的主页' : 'My Profile',
    wait: language === 'zh' ? '稍候...' : 'Wait...',
    me: language === 'zh' ? '我' : 'Me',
    join: language === 'zh' ? '登录' : 'Join',
    neighborly: language === 'zh' ? '让生活更轻松' : 'Make Life Easier',
    becomeProvider: language === 'zh' ? '能人入驻' : 'Become a Pro',
    proHub: language === 'zh' ? '达人中心' : 'Pro Hub',
    brandName: language === 'zh' ? '渥帮' : 'JUSTWEDO',
  };

  const isProvider = currentUser?.roles?.includes('PROVIDER');

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="JUSTWEDO" className="w-10 h-10 rounded-2xl object-cover shadow-warm" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter text-gradient">{t.brandName}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1 text-center sm:text-left">{t.neighborly}</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
            {t.discover}
          </Link>
          <Link to="/discover" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {t.map}
          </Link>
          <Link to="/community" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {t.community}
          </Link>
          <Link to="/orders" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {t.orders}
          </Link>
          <Link to={isProvider ? "/provider/dashboard" : "/become-provider"} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            {isProvider ? t.proHub : t.becomeProvider}
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

          <div className="hidden sm:block">
            <LitePost
              trigger={
                <Button size="sm" className="btn-action shadow-warm px-5">
                  <PlusCircle className="w-4 h-4 mr-2" /> {t.post}
                </Button>
              }
            />
          </div>

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
            <Link to="/discover" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.map}
            </Link>
            <Link to="/community" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {t.community}
            </Link>
            <Link to={isProvider ? "/provider/dashboard" : "/become-provider"} className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              {isProvider ? t.proHub : t.becomeProvider}
            </Link>
            <LitePost
              trigger={
                <button className="px-5 py-3 flex items-center gap-3 rounded-2xl text-sm font-bold text-primary bg-primary/10">
                  <PlusCircle className="w-4 h-4" />
                  {t.post}
                </button>
              }
            />
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
