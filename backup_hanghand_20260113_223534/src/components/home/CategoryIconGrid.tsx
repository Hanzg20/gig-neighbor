import { useNavigate } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { getIcon } from "@/lib/iconMapper";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Category Icon Grid Component
 * Displays 8 main service categories in a grid layout
 * Based on seed_data.sql categories
 */
export function CategoryIconGrid() {
  const navigate = useNavigate();
  const { refCodes } = useConfigStore();

  // Define the 8 main categories to display (matching the design)
  const categoryIds = [
    '1010100', // 家政 - Cleaning
    '1010400', // 维修 - Handyman
    '1010500', // 搬家 - Moving
    '1010600', // 跑腿 - Errands
    '1020600', // 美业 - Beauty
    '1030500', // 育儿 - Childcare
    '1030100', // 宠物 - Pet Care
  ];

  // Subtext mapping (Chinese descriptions)
  const subtextMap: Record<string, string> = {
    '1010100': '保洁清洗',
    '1010400': '水电管道',
    '1010500': '打包运输',
    '1010600': 'BeanHelper',
    '1020600': '美甲美发',
    '1030500': '看护陪伴',
    '1030100': '遛狗照看',
  };

  // Color mapping
  const colorMap: Record<string, string> = {
    '1010100': '#10b981', // emerald
    '1010400': '#3b82f6', // blue
    '1010500': '#f59e0b', // amber
    '1010600': '#8b5cf6', // purple
    '1020600': '#ec4899', // pink
    '1030500': '#06b6d4', // cyan
    '1030100': '#f97316', // orange
  };

  // Get categories from refCodes
  const mainCategories = categoryIds
    .map(id => refCodes.find(code => code.codeId === id))
    .filter(Boolean) as typeof refCodes;

  // Map to display format
  const categories = mainCategories.map(code => {
    const extraData = code.extraData || {};
    const iconName = extraData.icon || 'Sparkles';
    const Icon = getIcon(iconName);
    
    return {
      id: code.codeId,
      nameZh: code.zhName,
      nameEn: code.enName,
      icon: Icon,
      subtext: subtextMap[code.codeId] || code.zhName,
      color: colorMap[code.codeId] || '#10b981',
    };
  });

  // Add "更多" (More) category
  categories.push({
    id: 'more',
    nameZh: '更多',
    nameEn: 'More',
    icon: MoreHorizontal,
    subtext: '全部服务',
    color: '#6b7280',
  });

  return (
    <div className="relative px-4 py-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 rounded-3xl" />
      
      <div className="relative grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-5">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (category.id === 'more') {
                  navigate('/category/service');
                } else {
                  navigate(`/category/${category.id}`);
                }
              }}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              {/* Icon container with gradient background */}
              <motion.div
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}08 100%)`,
                }}
                whileHover={{ 
                  boxShadow: `0 12px 28px -8px ${category.color}50`,
                  background: `linear-gradient(135deg, ${category.color}30 0%, ${category.color}15 100%)`,
                }}
              >
                {/* Glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${category.color}25 0%, transparent 70%)`,
                  }}
                />
                
                {/* Shimmer effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ 
                    x: '100%',
                    transition: { duration: 0.6, ease: "easeInOut" }
                  }}
                  style={{
                    background: `linear-gradient(90deg, transparent, ${category.color}15, transparent)`,
                  }}
                />
                
                {/* Icon with animation */}
                <motion.div
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  <Icon 
                    className="w-7 h-7 md:w-8 md:h-8 relative z-10"
                    style={{ color: category.color }}
                    strokeWidth={2}
                  />
                </motion.div>
              </motion.div>
              
              {/* Labels */}
              <div className="text-center space-y-0.5">
                <motion.p 
                  className="text-xs md:text-sm font-bold text-foreground leading-tight"
                  whileHover={{ color: category.color }}
                  transition={{ duration: 0.2 }}
                >
                  {category.nameZh}
                </motion.p>
                <p className="text-[10px] md:text-xs text-muted-foreground/80 font-medium">
                  {category.subtext}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
