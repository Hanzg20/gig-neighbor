import { HeartHandshake, Crown, Sparkles, Utensils, PlaneTakeoff, ArrowRight, Users, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * 5大业务域入口卡片 - 基于seed_data.sql的INDUSTRY分类
 * 设计灵感: 韩国당근마켓的温暖社区感 + 美团的高效信息密度
 */
interface BusinessDomain {
  id: string;
  icon: React.ReactNode;
  emoji: string;
  label: string;
  labelEn: string;
  description: string;
  stats: { count: number; label: string };
  highlight?: string;
  gradient: string;
  iconBg: string;
  link: string;
}

const businessDomains: BusinessDomain[] = [
  {
    id: "1010000",
    icon: <HeartHandshake className="w-7 h-7" />,
    emoji: "🏠",
    label: "居家生活",
    labelEn: "Home & Life",
    description: "保洁·维修·搬家·跑腿",
    stats: { count: 128, label: "位邻居在服务" },
    highlight: "最近预约",
    gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    iconBg: "bg-emerald-500",
    link: "/category/1010000",
  },
  {
    id: "1020000",
    icon: <Crown className="w-7 h-7" />,
    emoji: "👑",
    label: "专业美业",
    labelEn: "Pro & Beauty",
    description: "持证电工·水工·美容",
    stats: { count: 45, label: "位认证专家" },
    highlight: "资质认证",
    gradient: "from-rose-500/20 via-rose-400/10 to-transparent",
    iconBg: "bg-rose-500",
    link: "/category/1020000",
  },
  {
    id: "1030000",
    icon: <Sparkles className="w-7 h-7" />,
    emoji: "✨",
    label: "育儿教育",
    labelEn: "Kids & Wellness",
    description: "宠物托管·家教·健身",
    stats: { count: 86, label: "个家庭在用" },
    gradient: "from-violet-500/20 via-violet-400/10 to-transparent",
    iconBg: "bg-violet-500",
    link: "/category/1030000",
  },
  {
    id: "1040000",
    icon: <Utensils className="w-7 h-7" />,
    emoji: "🍜",
    label: "美食市集",
    labelEn: "Food & Market",
    description: "私房菜·二手·工具租借",
    stats: { count: 234, label: "件好物上新" },
    highlight: "今日热卖",
    gradient: "from-amber-500/20 via-amber-400/10 to-transparent",
    iconBg: "bg-amber-500",
    link: "/category/1040000",
  },
  {
    id: "1050000",
    icon: <PlaneTakeoff className="w-7 h-7" />,
    emoji: "❄️",
    label: "出行时令",
    labelEn: "Travel & Outdoor",
    description: "铲雪·割草·机场接送",
    stats: { count: 52, label: "位邻居可帮忙" },
    highlight: "冬季热门",
    gradient: "from-sky-500/20 via-sky-400/10 to-transparent",
    iconBg: "bg-sky-500",
    link: "/category/1050000",
  },
];

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

const HeroSection = () => {
  return (
    <section className="py-4 px-4">
      {/* 温暖问候语 - 韩国당근마켓风格 */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👋</span>
          <h2 className="text-xl font-bold text-foreground">
            Hi, Neighbor!
          </h2>
        </div>
        <p className="text-muted-foreground text-sm ml-9">
          What can your community help you with today?
        </p>
      </motion.div>

      {/* 5大业务入口网格 - 2+3布局 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {/* 第一行: 2个大卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {businessDomains.slice(0, 2).map((domain) => (
            <BusinessCard key={domain.id} domain={domain} size="large" />
          ))}
        </div>
        
        {/* 第二行: 3个小卡片 */}
        <div className="grid grid-cols-3 gap-3">
          {businessDomains.slice(2, 5).map((domain) => (
            <BusinessCard key={domain.id} domain={domain} size="small" />
          ))}
        </div>
      </motion.div>

      {/* 社区活跃指标 - 增加温度感 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 flex items-center justify-center gap-6 text-sm"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Users className="w-4 h-4" />
          <span><strong className="text-foreground">328</strong> neighbors online</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Star className="w-4 h-4 text-amber-500" />
          <span><strong className="text-foreground">4.9</strong> avg rating</span>
        </div>
      </motion.div>
    </section>
  );
};

/**
 * 业务入口卡片组件
 * 大卡片: 显示完整信息 + 统计数据
 * 小卡片: 紧凑展示核心信息
 */
interface BusinessCardProps {
  domain: BusinessDomain;
  size: "large" | "small";
}

const BusinessCard = ({ domain, size }: BusinessCardProps) => {
  const isLarge = size === "large";
  
  return (
    <motion.div variants={cardVariants}>
      <Link
        to={domain.link}
        className={`
          relative block overflow-hidden rounded-2xl border border-border/50
          bg-card hover:border-primary/30 transition-all duration-300
          hover:shadow-lg hover:-translate-y-0.5 group
          ${isLarge ? "p-4" : "p-3"}
        `}
      >
        {/* 渐变背景装饰 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-60`} />
        
        {/* 高亮标签 */}
        {domain.highlight && isLarge && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            {domain.highlight}
          </div>
        )}

        <div className="relative z-10">
          {/* 图标 + 标题 */}
          <div className={`flex items-start gap-3 ${isLarge ? "mb-3" : "mb-2"}`}>
            <div className={`
              ${domain.iconBg} text-white rounded-xl flex items-center justify-center
              shadow-lg group-hover:scale-110 transition-transform duration-300
              ${isLarge ? "w-12 h-12" : "w-10 h-10"}
            `}>
              {domain.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={isLarge ? "text-lg" : "text-base"}>{domain.emoji}</span>
                <h3 className={`font-bold text-foreground truncate ${isLarge ? "text-base" : "text-sm"}`}>
                  {domain.label}
                </h3>
              </div>
              {isLarge && (
                <p className="text-xs text-muted-foreground mt-0.5">{domain.labelEn}</p>
              )}
            </div>
          </div>

          {/* 描述 */}
          <p className={`text-muted-foreground mb-2 line-clamp-1 ${isLarge ? "text-sm" : "text-xs"}`}>
            {domain.description}
          </p>

          {/* 统计数据 - 仅大卡片显示 */}
          {isLarge && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-bold text-primary">{domain.stats.count}</span>
                <span className="text-muted-foreground text-xs">{domain.stats.label}</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:text-white" />
              </div>
            </div>
          )}

          {/* 小卡片底部箭头 */}
          {!isLarge && (
            <div className="flex justify-end">
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default HeroSection;
