import { useState, useEffect } from 'react';
import { Hash, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useCommunityPostStore } from '@/stores/communityPostStore';

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
  const { trendingTags, fetchTrendingTags } = useCommunityPostStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchTrendingTags(maxTags);
      setIsLoading(false);
    };
    load();
  }, [fetchTrendingTags, maxTags]);

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
        {trendingTags.slice(0, maxTags).map((tagData, index) => (
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
