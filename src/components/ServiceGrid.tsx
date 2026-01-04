import { useState } from "react";
import ServiceCard from "./ServiceCard";
import TabFilter from "./TabFilter";

const mockServices = [
  {
    id: 1,
    title: "阿姨家常菜 - 红烧肉套餐",
    provider: "王阿姨",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 128,
    distance: "500m",
    nextAvailable: "今天 12:00",
    providerType: "verified" as const,
    sameBuilding: true,
    category: "food" as const,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    tiers: [
      { name: "单人份", price: 12, description: "主菜+米饭", unit: "份" },
      { name: "双人份", price: 20, description: "2主菜+米饭", unit: "份" },
      { name: "家庭装", price: 35, description: "3主菜+汤+米饭", unit: "份" },
    ],
  },
  {
    id: 2,
    title: "深度保洁 - 全屋清洁消毒",
    provider: "洁净家政",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviews: 89,
    distance: "2km",
    nextAvailable: "今天 14:00",
    providerType: "merchant" as const,
    sameBuilding: false,
    category: "service" as const,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 35, description: "2小时标准清洁", unit: "小时" },
      { name: "标准版", price: 60, description: "4小时深度清洁", unit: "次" },
      { name: "高级版", price: 100, description: "6小时+消毒", unit: "次" },
    ],
  },
  {
    id: 3,
    title: "代取快递 - 随叫随到",
    provider: "小张",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
    rating: 5.0,
    reviews: 56,
    distance: "300m",
    nextAvailable: "10分钟内",
    providerType: "neighbor" as const,
    sameBuilding: true,
    urgent: true,
    category: "task" as const,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop",
    tiers: [
      { name: "小件", price: 2, description: "信件/小包裹", unit: "次" },
      { name: "中件", price: 5, description: "普通快递", unit: "次" },
      { name: "大件", price: 10, description: "大件/重物", unit: "次" },
    ],
  },
  {
    id: 4,
    title: "水管维修 - 快速上门",
    provider: "陈工",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4.7,
    reviews: 203,
    distance: "3km",
    nextAvailable: "今天 16:00",
    providerType: "verified" as const,
    category: "service" as const,
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    tiers: [
      { name: "检测", price: 20, description: "上门检测", unit: "次" },
      { name: "小修", price: 50, description: "简单维修", unit: "次" },
      { name: "大修", price: 120, description: "复杂维修+换件", unit: "次" },
    ],
  },
  {
    id: 5,
    title: "私房甜点 - 手工蛋糕",
    provider: "Coco烘焙",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 167,
    distance: "1.5km",
    nextAvailable: "明天 10:00",
    providerType: "verified" as const,
    category: "food" as const,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    tiers: [
      { name: "6寸", price: 25, description: "6寸蛋糕", unit: "个" },
      { name: "8寸", price: 40, description: "8寸蛋糕", unit: "个" },
      { name: "10寸", price: 60, description: "10寸+定制", unit: "个" },
    ],
  },
  {
    id: 6,
    title: "代扔垃圾 - 每日服务",
    provider: "Emma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5.0,
    reviews: 42,
    distance: "同楼层",
    nextAvailable: "每天 8:00",
    providerType: "neighbor" as const,
    sameBuilding: true,
    category: "task" as const,
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    tiers: [
      { name: "单次", price: 1, description: "单次代扔", unit: "次" },
      { name: "周卡", price: 5, description: "每天一次", unit: "周" },
      { name: "月卡", price: 15, description: "每天一次", unit: "月" },
    ],
  },
];

const ServiceGrid = () => {
  const [activeTab, setActiveTab] = useState("nearby");

  const filteredServices = mockServices.filter((service) => {
    if (activeTab === "nearby") return true;
    if (activeTab === "food") return service.category === "food";
    if (activeTab === "service") return service.category === "service";
    if (activeTab === "task") return service.category === "task";
    return true;
  });

  return (
    <>
      <TabFilter activeTab={activeTab} onTabChange={setActiveTab} />
      
      <section className="py-6 container pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              {activeTab === "nearby" && "同小区热门"}
              {activeTab === "food" && "邻里美食"}
              {activeTab === "service" && "上门服务"}
              {activeTab === "task" && "跑腿任务"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "nearby" && "Kanata Lakes 社区"}
              {activeTab === "food" && "私房菜·烘焙·盒饭"}
              {activeTab === "service" && "保洁·维修·搬家"}
              {activeTab === "task" && "代取·代买·帮忙"}
            </p>
          </div>
          <button className="text-sm font-semibold text-primary hover:underline">
            查看全部 →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <div 
              key={service.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ServiceCard {...service} />
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">暂无相关服务</p>
          </div>
        )}
      </section>
    </>
  );
};

export default ServiceGrid;
