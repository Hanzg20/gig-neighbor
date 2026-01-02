import ServiceCard from "./ServiceCard";

const mockServices = [
  {
    id: 1,
    title: "深度保洁 - 全屋清洁消毒",
    provider: "李阿姨",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 128,
    distance: "1.2km",
    nextAvailable: "今天 14:00",
    verified: true,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 80, description: "单次清洁 2小时" },
      { name: "标准版", price: 150, description: "深度清洁 4小时" },
      { name: "高级版", price: 280, description: "全屋+消毒 6小时" },
    ],
  },
  {
    id: 2,
    title: "专业搬家 - 细心打包极速配送",
    provider: "王师傅",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviews: 89,
    distance: "2.5km",
    nextAvailable: "明天 09:00",
    verified: true,
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 120, description: "仅出车" },
      { name: "标准版", price: 220, description: "出车+1人搬运" },
      { name: "高级版", price: 380, description: "打包+拆装+运输" },
    ],
  },
  {
    id: 3,
    title: "跑腿代购 - 随叫随到帮你忙",
    provider: "小张",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
    rating: 5.0,
    reviews: 56,
    distance: "0.8km",
    nextAvailable: "现在可约",
    urgent: true,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 15, description: "3公里内" },
      { name: "标准版", price: 25, description: "5公里+排队" },
      { name: "高级版", price: 40, description: "不限距离+加急" },
    ],
  },
  {
    id: 4,
    title: "水管维修 - 快速上门不漏水",
    provider: "陈工",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4.7,
    reviews: 203,
    distance: "3.1km",
    nextAvailable: "今天 16:00",
    verified: true,
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 60, description: "上门检测" },
      { name: "标准版", price: 120, description: "小修+材料" },
      { name: "高级版", price: 250, description: "大修+换件" },
    ],
  },
  {
    id: 5,
    title: "美甲美睫 - 精致生活从指尖开始",
    provider: "Coco",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 167,
    distance: "1.8km",
    nextAvailable: "明天 11:00",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 35, description: "纯色美甲" },
      { name: "标准版", price: 65, description: "款式美甲" },
      { name: "高级版", price: 99, description: "美甲+美睫" },
    ],
  },
  {
    id: 6,
    title: "宠物照看 - 把毛孩子交给我",
    provider: "Emma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5.0,
    reviews: 42,
    distance: "0.5km",
    nextAvailable: "随时可约",
    verified: true,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    tiers: [
      { name: "基础版", price: 25, description: "遛狗30分钟" },
      { name: "标准版", price: 50, description: "上门喂养+陪玩" },
      { name: "高级版", price: 100, description: "全天照看" },
    ],
  },
];

const ServiceGrid = () => {
  return (
    <section className="py-8 container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">附近热门服务</h2>
          <p className="text-muted-foreground text-sm mt-1">基于您的位置推荐</p>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">
          查看全部 →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockServices.map((service, index) => (
          <div 
            key={service.id}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ServiceCard {...service} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceGrid;
