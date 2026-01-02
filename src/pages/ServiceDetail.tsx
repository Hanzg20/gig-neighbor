import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Clock, Star, Shield, Heart, Share2, 
  ChevronLeft, ChevronRight, Calendar, Check, MessageCircle,
  Phone, User, Award, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock service data - would come from API in real app
const mockService = {
  id: 1,
  title: "深度保洁 - 全屋清洁消毒",
  provider: "李阿姨",
  avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face",
  rating: 4.9,
  reviewCount: 128,
  distance: "1.2km",
  nextAvailable: "今天 14:00",
  verified: true,
  completedOrders: 356,
  responseTime: "5分钟内",
  repeatRate: "92%",
  description: "专业家政服务10年经验，细心负责。使用环保清洁剂，对宠物和儿童安全友好。服务包含厨房深度清洁、卫生间消毒、地板打蜡等。",
  images: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop",
  ],
  tiers: [
    { 
      name: "基础版", 
      price: 80, 
      description: "单次清洁 2小时",
      features: ["日常清洁", "垃圾清理", "地面清洁", "表面除尘"],
      popular: false
    },
    { 
      name: "标准版", 
      price: 150, 
      description: "深度清洁 4小时",
      features: ["全部基础版服务", "厨房深度清洁", "卫生间消毒", "窗户擦拭", "床品整理"],
      popular: true
    },
    { 
      name: "高级版", 
      price: 280, 
      description: "全屋+消毒 6小时",
      features: ["全部标准版服务", "家电清洁", "全屋消毒", "收纳整理", "空调清洗", "冰箱清洁"],
      popular: false
    },
  ],
  userReviews: [
    {
      id: 1,
      user: "王女士",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      rating: 5,
      date: "2025-12-28",
      content: "李阿姨非常专业，打扫得很干净！下次还会预约。",
      images: ["https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=200&h=150&fit=crop"]
    },
    {
      id: 2,
      user: "张先生",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      rating: 5,
      date: "2025-12-25",
      content: "准时到达，态度很好，清洁效果超出预期！",
      images: []
    },
  ],
  availability: [
    { date: "2026-01-02", slots: ["09:00", "14:00", "16:00"] },
    { date: "2026-01-03", slots: ["09:00", "11:00", "14:00", "16:00"] },
    { date: "2026-01-04", slots: ["09:00", "11:00"] },
    { date: "2026-01-05", slots: ["14:00", "16:00", "18:00"] },
    { date: "2026-01-06", slots: ["09:00", "11:00", "14:00"] },
  ]
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedTier, setSelectedTier] = useState(1); // Default to popular tier
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const service = mockService; // In real app, fetch by id

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % service.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + service.images.length) % service.images.length);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "今天";
    if (date.toDateString() === tomorrow.toDateString()) return "明天";
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    // In real app, this would submit the booking
    console.log("Booking:", { tier: service.tiers[selectedTier], date: selectedDate, time: selectedTime });
    setIsBookingOpen(false);
    // Show success animation/toast
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Image Carousel */}
      <div className="relative h-72 md:h-96 bg-muted">
        <img
          src={service.images[currentImage]}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        
        {/* Navigation Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-card transition-colors"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-accent text-accent' : 'text-foreground'}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-card transition-colors">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-card transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-card transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {service.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImage ? 'w-6 bg-primary' : 'bg-card/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl px-4 -mt-6 relative z-10">
        {/* Main Card */}
        <div className="card-warm p-6 mb-6">
          {/* Provider Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={service.avatar}
                alt={service.provider}
                className="w-16 h-16 rounded-full object-cover border-3 border-card shadow-lg"
              />
              {service.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <Shield className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{service.provider}</h2>
                {service.verified && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    验证邻居
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="font-semibold text-foreground">{service.rating}</span>
                  <span>({service.reviewCount}评价)</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {service.distance}
                </span>
              </div>
            </div>
            <button className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold text-foreground mb-3">{service.title}</h1>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="tag-time">
              <Clock className="w-3.5 h-3.5" />
              最早 {service.nextAvailable}
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {service.completedOrders}单完成
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {service.repeatRate}复购率
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{service.description}</p>
        </div>

        {/* Provider Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-warm p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{service.completedOrders}</p>
            <p className="text-xs text-muted-foreground">已完成订单</p>
          </div>
          <div className="card-warm p-4 text-center">
            <p className="text-2xl font-extrabold text-secondary">{service.responseTime}</p>
            <p className="text-xs text-muted-foreground">平均响应</p>
          </div>
          <div className="card-warm p-4 text-center">
            <p className="text-2xl font-extrabold text-accent">{service.repeatRate}</p>
            <p className="text-xs text-muted-foreground">复购率</p>
          </div>
        </div>

        {/* Tier Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">选择服务套餐</h3>
          <div className="space-y-4">
            {service.tiers.map((tier, index) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(index)}
                className={`w-full p-5 rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                  selectedTier === index
                    ? 'bg-primary/10 border-2 border-primary shadow-lg'
                    : 'bg-card border-2 border-transparent hover:border-muted-foreground/20'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-0 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-bl-xl">
                    最受欢迎
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{tier.name}</h4>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-primary">${tier.price}</p>
                    <p className="text-xs text-muted-foreground">/次</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tier.features.map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <Check className="w-3.5 h-3.5 text-secondary" />
                      {feature}
                    </span>
                  ))}
                </div>
                {selectedTier === index && (
                  <div className="absolute top-5 left-5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">选择预约时间</h3>
          <div className="card-warm p-5">
            {/* Date Selection */}
            <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
              {service.availability.map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedTime(null);
                  }}
                  className={`flex-shrink-0 w-20 py-3 px-4 rounded-xl text-center transition-all ${
                    selectedDate === day.date
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <p className="text-sm font-bold">{formatDate(day.date)}</p>
                  <p className="text-xs opacity-80">{day.slots.length}个时段</p>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="animate-fade-in">
                <p className="text-sm text-muted-foreground mb-3">可用时段</p>
                <div className="flex flex-wrap gap-2">
                  {service.availability
                    .find((d) => d.date === selectedDate)
                    ?.slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          selectedTime === slot
                            ? 'bg-secondary text-secondary-foreground shadow-lg'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">用户评价</h3>
            <button className="text-sm font-semibold text-primary hover:underline">
              查看全部 ({service.userReviews.length}) →
            </button>
          </div>
          <div className="space-y-4">
            {service.userReviews.map((review) => (
              <div key={review.id} className="card-warm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{review.user}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{review.content}</p>
                {review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Review"
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        <div className="container max-w-4xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">咨询</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-5 h-5" />
              <span className="text-xs">电话</span>
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{service.tiers[selectedTier].name}</p>
                <p className="text-2xl font-extrabold text-primary">
                  ${service.tiers[selectedTier].price}
                  <span className="text-sm font-medium text-muted-foreground">/次</span>
                </p>
              </div>
              <Button 
                onClick={() => setIsBookingOpen(true)}
                className="btn-action py-3 px-8 text-base"
                disabled={!selectedDate || !selectedTime}
              >
                <span className="mr-2">🤝</span>
                {selectedDate && selectedTime ? "确认预约" : "Hang Tight"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">确认预约</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <img
                src={service.avatar}
                alt={service.provider}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-foreground">{service.provider}</p>
                <p className="text-sm text-muted-foreground">{service.title}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">服务套餐</span>
                <span className="font-semibold text-foreground">{service.tiers[selectedTier].name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">预约日期</span>
                <span className="font-semibold text-foreground">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">预约时间</span>
                <span className="font-semibold text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">服务费用</span>
                <span className="text-xl font-extrabold text-primary">${service.tiers[selectedTier].price}</span>
              </div>
            </div>

            <Button onClick={handleBook} className="w-full btn-action py-3 text-base">
              <span className="mr-2">🤝</span>
              确认并支付
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              点击确认即表示您同意我们的服务条款
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceDetail;
