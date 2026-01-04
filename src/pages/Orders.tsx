import { useState } from "react";
import { Clock, CheckCircle, Star, MessageCircle, QrCode, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type OrderStatus = "pending" | "accepted" | "in_progress" | "completed" | "reviewing";
type ViewMode = "buyer" | "provider";

interface Order {
  id: string;
  title: string;
  provider: string;
  providerAvatar: string;
  price: number;
  status: OrderStatus;
  date: string;
  image: string;
  progress?: number;
}

const mockOrders: Order[] = [
  {
    id: "1",
    title: "深度保洁 - 全屋清洁",
    provider: "李阿姨",
    providerAvatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face",
    price: 150,
    status: "in_progress",
    date: "今天 14:00",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=150&fit=crop",
    progress: 60,
  },
  {
    id: "2",
    title: "家常菜套餐 - 3人份",
    provider: "王大厨",
    providerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    price: 35,
    status: "reviewing",
    date: "昨天 12:30",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop",
  },
  {
    id: "3",
    title: "代取快递",
    provider: "小张",
    providerAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
    price: 5,
    status: "completed",
    date: "3天前",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200&h=150&fit=crop",
  },
];

const statusConfig = {
  pending: { label: "待支付", color: "text-accent", bg: "bg-accent/10" },
  accepted: { label: "已接单", color: "text-blue-600", bg: "bg-blue-50" },
  in_progress: { label: "进行中", color: "text-primary", bg: "bg-primary/10" },
  completed: { label: "已完成", color: "text-muted-foreground", bg: "bg-muted" },
  reviewing: { label: "待评价", color: "text-secondary", bg: "bg-secondary/10" },
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("buyer");

  const tabs = [
    { id: "all" as const, label: "全部" },
    { id: "pending" as const, label: "待处理" },
    { id: "in_progress" as const, label: "进行中" },
    { id: "completed" as const, label: "已完成" },
  ];

  const filteredOrders = mockOrders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return order.status === "pending" || order.status === "reviewing";
    if (activeTab === "in_progress") return order.status === "in_progress" || order.status === "accepted";
    return order.status === "completed";
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">订单中心</h1>
            {/* View Mode Switch */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setViewMode("buyer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "buyer"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                买家
              </button>
              <button
                onClick={() => setViewMode("provider")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "provider"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                服务者
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Order List */}
      <div className="container py-4 space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="card-warm p-4">
            <div className="flex gap-4">
              {/* Image */}
              <img
                src={order.image}
                alt={order.title}
                className="w-20 h-20 rounded-xl object-cover"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-foreground truncate">{order.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].bg} ${statusConfig[order.status].color}`}>
                    {statusConfig[order.status].label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={order.providerAvatar}
                    alt={order.provider}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">{order.provider}</span>
                  <span className="text-xs text-muted-foreground">· {order.date}</span>
                </div>

                {/* Progress Bar for in_progress */}
                {order.status === "in_progress" && order.progress && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">服务进度</span>
                      <span className="text-primary font-medium">{order.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">${order.price}</span>
                  <div className="flex gap-2">
                    {order.status === "in_progress" && (
                      <>
                        <button className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                          <QrCode className="w-4 h-4 text-primary" />
                        </button>
                      </>
                    )}
                    {order.status === "reviewing" && (
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
                        <Star className="w-4 h-4" />
                        去评价
                      </button>
                    )}
                    {order.status === "completed" && (
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-sm">
                        再来一单
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">暂无订单</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;
