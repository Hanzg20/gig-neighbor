import { motion } from "framer-motion";
import { Users, Star } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

/**
 * Welcome Greeting Component
 * 温暖问候区 - "Hi, Neighbor!" 社区欢迎语
 * 设计灵感：당근마켓的个性化问候
 */
export function WelcomeGreeting() {
  const { currentUser } = useAuthStore();

  // 获取当前时段问候语
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // 个性化问候
  const userName = currentUser?.name || "Neighbor";
  const greeting = getTimeBasedGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="px-4 py-6 mb-4"
    >
      <div className="flex items-start justify-between">
        {/* Left: Greeting */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              👋
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              {greeting}, {userName}!
            </h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            What can your community help you with today?
          </p>
        </div>

        {/* Right: Community Stats (desktop only) */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">328</strong> neighbors online
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">4.9</strong> avg rating
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
