import { HeartHandshake, Crown, Sparkles, Utensils, PlaneTakeoff, ArrowRight, Users, Star, Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * 5大业务域入口卡片 - 前卫流行风格平铺设计
 * 灵感: 小红书/韩国카카오的现代卡片 + 渐变微光效果
 */
interface BusinessDomain {
  id: string;
  icon: React.ReactNode;
  emoji: string;
  label: string;
  labelEn: string;
  description: string;
  stats: { count: number; label: string };
  hotTags: string[];
  gradient: string;
  glowColor: string;
  iconBg: string;
  link: string;
  trending?: boolean;
}

const businessDomains: BusinessDomain[] = [
  {
    id: "1010000",
    icon: <HeartHandshake className="w-6 h-6" />,
    emoji: "🏠",
    label: "居家生活",
    labelEn: "Home & Life",
    description: "保洁·维修·搬家·跑腿",
    stats: { count: 128, label: "邻居在服务" },
    hotTags: ["深度保洁", "家电维修"],
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    link: "/category/1010000",
    trending: true,
  },
  {
    id: "1020000",
    icon: <Crown className="w-6 h-6" />,
    emoji: "💅",
    label: "专业美业",
    labelEn: "Pro & Beauty",
    description: "持证电工·水工·美甲美睫",
    stats: { count: 45, label: "认证专家" },
    hotTags: ["持证电工", "美甲到家"],
    gradient: "from-rose-400 via-pink-400 to-fuchsia-400",
    glowColor: "rgba(244, 63, 94, 0.4)",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
    link: "/category/1020000",
  },
  {
    id: "1030000",
    icon: <Sparkles className="w-6 h-6" />,
    emoji: "👶",
    label: "亲子教育",
    labelEn: "Kids & Wellness",
    description: "家教辅导·宠物托管·健身私教",
    stats: { count: 86, label: "家庭在用" },
    hotTags: ["钢琴陪练", "宠物寄养"],
    gradient: "from-violet-400 via-purple-400 to-indigo-400",
    glowColor: "rgba(139, 92, 246, 0.4)",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
    link: "/category/1030000",
  },
  {
    id: "1040000",
    icon: <Utensils className="w-6 h-6" />,
    emoji: "🍜",
    label: "美食市集",
    labelEn: "Food & Market",
    description: "私房菜·二手好物·工具租借",
    stats: { count: 234, label: "件好物上新" },
    hotTags: ["妈妈私房菜", "二手家具"],
    gradient: "from-amber-400 via-orange-400 to-red-400",
    glowColor: "rgba(251, 146, 60, 0.4)",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    link: "/category/1040000",
    trending: true,
  },
  {
    id: "1050000",
    icon: <PlaneTakeoff className="w-6 h-6" />,
    emoji: "❄️",
    label: "出行时令",
    labelEn: "Travel & Outdoor",
    description: "铲雪·割草·机场接送·代驾",
    stats: { count: 52, label: "邻居可帮忙" },
    hotTags: ["铲雪服务", "机场接机"],
    gradient: "from-sky-400 via-blue-400 to-indigo-400",
    glowColor: "rgba(56, 189, 248, 0.4)",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-500",
    link: "/category/1050000",
  },
];

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 }
  }
};

const HeroSection = () => {
  return (
    <section className="py-5 px-4">
      {/* 温暖问候语 + 社区活跃指标 */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h2 className="text-xl font-bold text-foreground">
              Hi, 邻居!
            </h2>
          </div>
          {/* 社区在线指标 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              <strong>328</strong> 邻居在线
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm ml-9">
          今天社区能帮你什么忙？
        </p>
      </motion.div>

      {/* 5大业务入口 - 前卫平铺风格 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-3"
      >
        {businessDomains.map((domain) => (
          <BusinessCard key={domain.id} domain={domain} />
        ))}
      </motion.div>

      {/* 底部社区数据横条 */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex items-center justify-center gap-8 py-3 px-4 rounded-2xl bg-muted/50 border border-border/50"
      >
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            今日 <strong className="text-foreground">1,256</strong> 笔交易
          </span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-muted-foreground">
            平均评分 <strong className="text-foreground">4.9</strong>
          </span>
        </div>
      </motion.div>
    </section>
  );
};

/**
 * 前卫风格业务入口卡片
 * 特点: 渐变微光 + 丰富内容 + 热门标签
 */
interface BusinessCardProps {
  domain: BusinessDomain;
}

const BusinessCard = ({ domain }: BusinessCardProps) => {
  return (
    <motion.div variants={cardVariants}>
      <Link
        to={domain.link}
        className="relative block overflow-hidden rounded-2xl border border-border/40 bg-card group"
        style={{
          boxShadow: `0 4px 24px -4px ${domain.glowColor}`,
        }}
      >
        {/* 渐变微光背景 */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${domain.gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500`} 
        />
        
        {/* 右侧装饰光晕 */}
        <div 
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, ${domain.glowColor} 0%, transparent 70%)` }}
        />

        <div className="relative z-10 p-4 flex items-center gap-4">
          {/* 图标 */}
          <div className={`
            ${domain.iconBg} text-white w-14 h-14 rounded-2xl flex items-center justify-center
            shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
          `}>
            {domain.icon}
          </div>

          {/* 内容区 */}
          <div className="flex-1 min-w-0">
            {/* 标题行 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{domain.emoji}</span>
              <h3 className="font-bold text-foreground text-base">
                {domain.label}
              </h3>
              <span className="text-xs text-muted-foreground">{domain.labelEn}</span>
              {domain.trending && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                  <Flame className="w-3 h-3" />
                  热门
                </span>
              )}
            </div>

            {/* 描述 */}
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {domain.description}
            </p>

            {/* 热门标签 + 统计 */}
            <div className="flex items-center gap-2 flex-wrap">
              {domain.hotTags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground border border-border/50"
                >
                  {tag}
                </span>
              ))}
              <span className="flex items-center gap-1 text-xs text-primary font-medium ml-auto">
                <Zap className="w-3.5 h-3.5" />
                {domain.stats.count} {domain.stats.label}
              </span>
            </div>
          </div>

          {/* 箭头 */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
            <ArrowRight className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HeroSection;
