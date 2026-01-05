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
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 px-4 py-6">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (category.id === 'more') {
                navigate('/category/service');
              } else {
                navigate(`/category/${category.id}`);
              }
            }}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <motion.div
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110"
              style={{
                backgroundColor: `${category.color}15`, // 15 = ~8% opacity
              }}
              whileHover={{ 
                boxShadow: `0 8px 24px -4px ${category.color}40`,
              }}
            >
              <Icon 
                className="w-7 h-7 md:w-8 md:h-8"
                style={{ color: category.color }}
              />
            </motion.div>
            <div className="text-center">
              <p className="text-xs md:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {category.nameZh}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                {category.subtext}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
