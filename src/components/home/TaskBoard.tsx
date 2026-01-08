import { motion } from "framer-motion";
import { Lock, MapPin, Clock, Coins, ChevronRight, AlertCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";

/**
 * Task Board Component
 * 附近任务看板 - 展示买家发布的需求
 *
 * 权限逻辑：
 * - 所有用户可以看到任务列表
 * - 仅已认证的 Provider 可以提交报价
 * - 未认证用户点击接单时显示引导弹窗
 */

interface Task {
  id: string;
  title: string;
  reward: {
    beans: number;
    cash: number; // CAD cents
  };
  poster: {
    name: string;
    verified: boolean;
  };
  distance: string;
  deadline: string;
  urgent?: boolean;
}

// Mock data - TODO: 从 Supabase 加载
const mockTasks: Task[] = [
  {
    id: "1",
    title: "需要有人帮忙铲雪 - 车道 + 人行道",
    reward: { beans: 50, cash: 2500 }, // $25.00
    poster: { name: "Mrs. Chen", verified: true },
    distance: "0.8km",
    deadline: "Today 6pm",
    urgent: true,
  },
  {
    id: "2",
    title: "搬家帮手 - 搬运家具上二楼",
    reward: { beans: 100, cash: 6000 }, // $60.00
    poster: { name: "David L.", verified: true },
    distance: "1.2km",
    deadline: "Tomorrow 2pm",
  },
  {
    id: "3",
    title: "寻找会修理割草机的邻居",
    reward: { beans: 30, cash: 3500 }, // $35.00
    poster: { name: "Emma R.", verified: false },
    distance: "2.1km",
    deadline: "This weekend",
  },
  {
    id: "4",
    title: "接送孩子 - 放学到家 (Lees Station 到 Riverside)",
    reward: { beans: 20, cash: 1500 }, // $15.00
    poster: { name: "Tom W.", verified: true },
    distance: "0.5km",
    deadline: "Every weekday 3:30pm",
  },
];

export function TaskBoard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { language } = useConfigStore();

  // TODO: 从 user_profiles 读取 kyc_status 和 role
  const isVerifiedProvider = false; // Placeholder

  const handleTaskClick = (taskId: string) => {
    if (isVerifiedProvider) {
      navigate(`/task/${taskId}`);
    } else {
      // TODO: 显示认证引导弹窗
      alert("Become a verified provider to accept tasks. Click OK to learn more.");
      navigate("/become-provider");
    }
  };

  const t = {
    title: language === 'zh' ? '附近任务' : 'Nearby Tasks',
    subtitle: language === 'zh' ? '帮助邻居，赚取奖励' : 'Help a neighbor and earn rewards',
    viewAll: language === 'zh' ? '查看全部' : 'View All',
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            💰 {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => navigate("/tasks")}
          className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
        >
          <span className="hidden sm:inline">{t.viewAll}</span>
          <span className="sm:hidden">{language === 'zh' ? '全部' : 'All'}</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {mockTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isVerifiedProvider={isVerifiedProvider}
            onClick={() => handleTaskClick(task.id)}
            delay={index * 0.1}
          />
        ))}
      </div>
    </section>
  );
}

interface TaskCardProps {
  task: Task;
  isVerifiedProvider: boolean;
  onClick: () => void;
  delay: number;
}

function TaskCard({ task, isVerifiedProvider, onClick, delay }: TaskCardProps) {
  const { language } = useConfigStore();

  const t = {
    urgent: language === 'zh' ? '紧急' : 'Urgent',
    reward: language === 'zh' ? '奖励' : 'Reward',
    beans: language === 'zh' ? '豆币' : 'Beans',
    verified: language === 'zh' ? '认证邻居' : 'Verified Neighbor',
    newUser: language === 'zh' ? '新用户' : 'New to HangHand',
    submitQuote: language === 'zh' ? '提交报价' : 'Submit Quote',
    verifyToAccept: language === 'zh' ? '认证后接单' : 'Verify to Accept',
    providersOnly: language === 'zh' ? '仅限认证服务商' : 'Verified Providers Only',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className="relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-amber-500/30 hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full -mr-20 -mt-20 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-colors duration-500" />

      {/* Urgent Glow Effect */}
      {task.urgent && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-5">
        {/* Title + Urgent Badge */}
        <div className="flex items-start gap-2 mb-3">
          <h3 className="font-bold text-base sm:text-lg line-clamp-2 flex-1 group-hover:text-primary transition-colors leading-tight">
            {task.title}
          </h3>
          {task.urgent && (
            <div className="flex-shrink-0 bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              {t.urgent}
            </div>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="font-medium">{task.distance}</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="font-medium">{task.deadline}</span>
          </div>
        </div>

        {/* Poster Info */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {task.poster.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {task.poster.name}
            </p>
            {task.poster.verified ? (
              <span className="text-[10px] sm:text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                ✓ {t.verified}
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground">{t.newUser}</span>
            )}
          </div>
        </div>

        {/* Reward + CTA */}
        <div className="flex items-center justify-between gap-3">
          {/* Reward */}
          <div className="flex-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              {t.reward}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <span className="text-sm sm:text-base font-black text-foreground">{task.reward.beans}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden sm:inline">{t.beans}</span>
              </div>
              <span className="text-muted-foreground font-bold">+</span>
              <span className="text-lg sm:text-xl font-black text-primary">
                ${(task.reward.cash / 100).toFixed(0)}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          {isVerifiedProvider ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="hidden sm:inline">{t.submitQuote}</span>
              <span className="sm:hidden">{language === 'zh' ? '报价' : 'Quote'}</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          ) : (
            <button className="flex-shrink-0 bg-muted/50 text-muted-foreground px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 border border-border cursor-not-allowed">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{t.verifyToAccept}</span>
              <span className="sm:hidden">{language === 'zh' ? '认证' : 'Verify'}</span>
            </button>
          )}
        </div>

        {/* Verification Required Badge (Top Right) */}
        {!isVerifiedProvider && (
          <div className="absolute top-3 right-3 bg-green-50 text-green-700 border border-green-200/50 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">{t.providersOnly}</span>
            <span className="sm:inline md:hidden">{language === 'zh' ? '认证' : 'Verified'}</span>
          </div>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}
