import { useState, useEffect } from 'react';
import { Hash, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface TagData {
  tag: string;
  count: number;
  trending?: boolean;
}

interface TrendingTagsProps {
  onTagClick?: (tag: string) => void;
  maxTags?: number;
  className?: string;
}

export const TrendingTags = ({
  onTagClick,
  maxTags = 12,
  className = ''
}: TrendingTagsProps) => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据 - 实际应从 API 获取
  useEffect(() => {
    setTimeout(() => {
      setTags([
        { tag: '二手交易', count: 234, trending: true },
        { tag: '免费赠送', count: 189, trending: true },
        { tag: '求购', count: 156 },
        { tag: '家具', count: 143 },
        { tag: '电子产品', count: 128 },
        { tag: '搬家甩卖', count: 112, trending: true },
        { tag: '社区活动', count: 98 },
        { tag: '互帮互助', count: 87 },
        { tag: '宠物', count: 76 },
        { tag: '美食', count: 65 },
        { tag: '图书', count: 54 },
        { tag: '运动健身', count: 43 },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base">热门标签</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-muted animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-base">热门标签</h3>
      </div>

      {/* 标签云 */}
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, maxTags).map((tagData, index) => (
          <motion.button
            key={tagData.tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleTagClick(tagData.tag)}
            className="group relative"
          >
            <Badge
              variant="outline"
              className={`
                px-3 py-1.5 text-sm font-semibold cursor-pointer
                transition-all duration-200
                hover:bg-primary hover:text-primary-foreground hover:border-primary
                ${tagData.trending ? 'border-orange-500 text-orange-600' : ''}
              `}
            >
              <Hash className="w-3 h-3 inline mr-1" />
              {tagData.tag}
              <span className="ml-1.5 text-xs opacity-70">{tagData.count}</span>
              {tagData.trending && (
                <Flame className="w-3 h-3 inline ml-1 text-orange-500 animate-pulse" />
              )}
            </Badge>

            {/* Hover 提示 */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              查看 {tagData.count} 条内容
            </div>
          </motion.button>
        ))}
      </div>

      {/* 底部提示 */}
      <p className="text-xs text-muted-foreground">
        点击标签查看相关内容
      </p>
    </div>
  );
};
