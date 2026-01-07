import { motion } from "framer-motion";
import { Lock, MapPin, Clock, Coins, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

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

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-foreground">
            💰 附近任务
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Help a neighbor and earn rewards
          </p>
        </div>
        <button
          onClick={() => navigate("/tasks")}
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className="card-warm p-5 cursor-pointer hover:shadow-elevated transition-all duration-300 group relative overflow-hidden"
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-16 -mt-16" />

      {/* Content */}
      <div className="relative z-10">
        {/* Title + Urgent Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-foreground text-lg line-clamp-2 flex-1 group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          {task.urgent && (
            <span className="tag-urgent flex-shrink-0">
              <Clock className="w-3 h-3" />
              Urgent
            </span>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{task.distance}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{task.deadline}</span>
          </div>
        </div>

        {/* Poster Info */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
            {task.poster.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {task.poster.name}
            </p>
            {task.poster.verified ? (
              <span className="text-xs text-emerald-600 font-medium">✓ Verified Neighbor</span>
            ) : (
              <span className="text-xs text-muted-foreground">New to HangHand</span>
            )}
          </div>
        </div>

        {/* Reward + CTA */}
        <div className="flex items-center justify-between">
          {/* Reward */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Reward</p>
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-black text-foreground">{task.reward.beans}</span>
                <span className="text-xs text-muted-foreground font-medium">Beans</span>
              </div>
              <span className="text-muted-foreground">+</span>
              <span className="text-lg font-black text-primary">
                ${(task.reward.cash / 100).toFixed(0)}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          {isVerifiedProvider ? (
            <button className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform">
              Submit Quote
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="btn-secondary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 opacity-60">
              <Lock className="w-3.5 h-3.5" />
              Verify to Accept
            </button>
          )}
        </div>

        {/* Verification Required Badge (overlay) */}
        {!isVerifiedProvider && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] bg-muted/80 backdrop-blur-sm text-muted-foreground px-2 py-1 rounded-lg font-medium border border-border/30">
              ✅ Verified Providers Only
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
