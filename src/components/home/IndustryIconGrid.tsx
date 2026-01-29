import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useConfigStore } from "@/stores/configStore";
import {
  Home,
  Crown,
  Sparkles,
  Utensils,
  Plane,
  ChevronRight
} from "lucide-react";

/**
 * 5大业务域入口 - 紧凑横向布局
 * 基于 seed_data.sql 的 INDUSTRY 分类
 */
interface Industry {
  id: string;
  icon: React.ElementType;
  zhName: string;
  enName: string;
  color: string;
  bgColor: string;
}

const industries: Industry[] = [
  {
    id: "1010000",
    icon: Home,
    zhName: "居家·生活",
    enName: "Home & Life",
    color: "#10b981", // emerald-500
    bgColor: "#10b98115", // 15 = ~8% opacity
  },
  {
    id: "1020000",
    icon: Crown,
    zhName: "专业·美业",
    enName: "Pro & Beauty",
    color: "#dc2626", // red-600
    bgColor: "#dc262615",
  },
  {
    id: "1030000",
    icon: Sparkles,
    zhName: "育儿·教育",
    enName: "Kids & Wellness",
    color: "#8b5cf6", // violet-500
    bgColor: "#8b5cf615",
  },
  {
    id: "1040000",
    icon: Utensils,
    zhName: "美食·市集",
    enName: "Food & Market",
    color: "#f59e0b", // amber-500
    bgColor: "#f59e0b15",
  },
  {
    id: "1050000",
    icon: Plane,
    zhName: "出行·时令",
    enName: "Travel & Outdoor",
    color: "#3b82f6", // blue-500
    bgColor: "#3b82f615",
  },
];

export function IndustryIconGrid() {
  const navigate = useNavigate();
  const { language } = useConfigStore();

  return (
    <div className="grid grid-cols-5 gap-2 md:gap-4 px-2 md:px-4 py-3 md:py-4">
      {industries.map((industry, index) => {
        const Icon = industry.icon;
        const displayName = language === 'zh' ? industry.zhName : industry.enName;

        return (
          <motion.button
            key={industry.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/category/${industry.id}`)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
          >
            {/* Icon Container - More compact for mobile */}
            <motion.div
              className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-105 relative"
              style={{
                backgroundColor: industry.bgColor,
                border: `1px solid ${industry.color}15`
              }}
            >
              <Icon
                className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8"
                style={{ color: industry.color }}
              />
            </motion.div>

            {/* Label - Smaller text */}
            <div className="text-center w-full px-0.5">
              <p className="text-[9px] sm:text-xs font-black text-muted-foreground/80 group-hover:text-primary transition-colors leading-[1.1] break-words">
                {displayName.split('·')[0]}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
