import { Bell, User, Menu, PlusCircle, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useCommunity } from "@/context/CommunityContext";
import { BeanBalance } from "./beans/BeanBalance";
import { useMessageStore } from "@/stores/messageStore";

const Header = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { currentUser, isLoading } = useAuthStore();
  const { activeNodeId } = useCommunity();
  const { totalUnreadCount, loadUnreadCount } = useMessageStore();

  // Load unread count on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadUnreadCount(currentUser.id);
    }
  }, [currentUser?.id, loadUnreadCount]);

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-warm">
            <span className="text-xl font-black text-white">H</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-foreground tracking-tighter">HangHand</h1>
            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest -mt-1 text-center sm:text-left">Neighborly</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
            Discover
          </Link>
          <Link to="/community" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Community
          </Link>
          <Link to="/orders" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Orders
          </Link>
          <Link to="/my-listings" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            My Posts
          </Link>
          <Link to="/chat" className="relative text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="w-5 h-5 inline mr-1" />
            Chat
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-3 w-4 h-4 bg-accent rounded-full text-[10px] font-black text-accent-foreground flex items-center justify-center">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/post-gig" className="hidden sm:block">
            <Button size="sm" className="btn-action shadow-warm px-5">
              <PlusCircle className="w-4 h-4 mr-2" /> Post
            </Button>
          </Link>

          <Link to="/chat" className="relative w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-[10px] font-black text-accent-foreground flex items-center justify-center border-2 border-card">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
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
              {isLoading ? 'Wait...' : currentUser ? 'Me' : 'Join'}
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
              Discover
            </Link>
            <Link to="/community" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              Community
            </Link>
            <Link to="/post-gig" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              Post Something
            </Link>
            <Link to="/my-listings" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              My Posts
            </Link>
            <Link to="/profile" className="px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground">
              My Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
