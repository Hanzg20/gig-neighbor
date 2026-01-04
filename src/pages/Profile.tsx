import { useState } from "react";
import { 
  ChevronRight, 
  Heart, 
  MapPin, 
  Star, 
  Wallet, 
  FileText, 
  Shield, 
  Settings,
  BadgeCheck,
  Store,
  Clock,
  TrendingUp
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

type ViewMode = "buyer" | "provider";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
  path?: string;
}

const Profile = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("buyer");

  const user = {
    name: "小李",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    phone: "138****8888",
    isVerified: true,
    verifyLevel: 1, // L1: 实名认证
    earnings: 235,
    orders: 12,
    rating: 4.9,
  };

  const buyerMenus: MenuItem[] = [
    { icon: <Clock className="w-5 h-5" />, label: "我的订单", sublabel: "查看全部订单" },
    { icon: <Heart className="w-5 h-5" />, label: "收藏服务", sublabel: "12个收藏" },
    { icon: <MapPin className="w-5 h-5" />, label: "地址管理", sublabel: "3个地址" },
    { icon: <Star className="w-5 h-5" />, label: "我的评价", sublabel: "6条评价" },
  ];

  const providerMenus: MenuItem[] = [
    { icon: <FileText className="w-5 h-5" />, label: "我的发布", sublabel: "3个服务", badge: "1待审核" },
    { icon: <Clock className="w-5 h-5" />, label: "订单管理", sublabel: "2个进行中" },
    { icon: <Wallet className="w-5 h-5" />, label: "收益提现", sublabel: `$${user.earnings}可提现` },
    { icon: <TrendingUp className="w-5 h-5" />, label: "数据统计", sublabel: "本月12单" },
  ];

  const commonMenus: MenuItem[] = [
    { icon: <Shield className="w-5 h-5" />, label: "实名认证", sublabel: user.verifyLevel === 0 ? "未认证" : user.verifyLevel === 1 ? "L1 已实名" : "L2 资质认证" },
    { icon: <Settings className="w-5 h-5" />, label: "设置", sublabel: "账号与隐私" },
  ];

  const currentMenus = viewMode === "buyer" ? buyerMenus : providerMenus;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-hero pt-12 pb-8 px-4">
        <div className="container">
          {/* View Mode Switch */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-sm rounded-xl">
              <button
                onClick={() => setViewMode("buyer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "buyer"
                    ? "bg-white text-primary"
                    : "text-white/80"
                }`}
              >
                买家模式
              </button>
              <button
                onClick={() => setViewMode("provider")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "provider"
                    ? "bg-white text-primary"
                    : "text-white/80"
                }`}
              >
                服务者模式
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                  L{user.verifyLevel} 认证
                </span>
              </div>
              <p className="text-white/80 text-sm">{user.phone}</p>
              {viewMode === "provider" && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span className="text-white font-medium">{user.rating}</span>
                  </div>
                  <span className="text-white/60">|</span>
                  <span className="text-white/80 text-sm">{user.orders}单完成</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container -mt-4">
        {/* Quick Stats for Provider */}
        {viewMode === "provider" && (
          <div className="card-warm p-4 mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">${user.earnings}</p>
                <p className="text-xs text-muted-foreground">可提现</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-2xl font-bold text-foreground">{user.orders}</p>
                <p className="text-xs text-muted-foreground">本月订单</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{user.rating}</p>
                <p className="text-xs text-muted-foreground">服务评分</p>
              </div>
            </div>
          </div>
        )}

        {/* Become Provider Banner for Buyer */}
        {viewMode === "buyer" && user.verifyLevel < 2 && (
          <div className="card-warm p-4 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">成为服务者</p>
              <p className="text-sm text-muted-foreground">分享技能，赚取收入</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Menu List */}
        <div className="card-warm divide-y divide-border">
          {currentMenus.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="text-primary">{item.icon}</div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                {item.sublabel && (
                  <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                )}
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Common Settings */}
        <div className="card-warm divide-y divide-border mt-4">
          {commonMenus.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="text-muted-foreground">{item.icon}</div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                {item.sublabel && (
                  <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* KYC Progress */}
        {user.verifyLevel < 2 && (
          <div className="card-warm p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-foreground">认证进度</p>
              <span className="text-sm text-primary">{user.verifyLevel === 1 ? "1/2" : "0/2"} 完成</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.verifyLevel >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {user.verifyLevel >= 1 ? "✓" : "1"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">L1 基础实名</p>
                  <p className="text-xs text-muted-foreground">手机号 + 身份验证</p>
                </div>
                {user.verifyLevel >= 1 && (
                  <span className="text-xs text-primary font-medium">已完成</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.verifyLevel >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {user.verifyLevel >= 2 ? "✓" : "2"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">L2 资质认证</p>
                  <p className="text-xs text-muted-foreground">营业执照 / 专业证书</p>
                </div>
                <button className="text-xs text-primary font-medium">去认证 →</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
