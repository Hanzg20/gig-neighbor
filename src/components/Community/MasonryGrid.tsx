import Masonry from 'react-masonry-css';
import { CommunityPost } from '@/types/community';
import { CommunityCardV2 } from './CommunityCardV2';
import { motion } from 'framer-motion';
import './masonry-grid.css';

interface MasonryGridProps {
  posts: CommunityPost[];
  isLoading?: boolean;
}

export const MasonryGrid = ({ posts, isLoading }: MasonryGridProps) => {
  // 响应式列数配置
  const breakpointColumns = {
    default: 3,   // 桌面: 3列 (>1024px)
    1024: 2,      // 平板: 2列 (768-1024px)
    768: 2,       // 移动: 2列 (<768px)
  };

  // 加载骨架屏
  if (isLoading) {
    return (
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {[...Array(9)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </Masonry>
    );
  }

  // 空状态
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <span className="text-4xl">📸</span>
        </div>
        <h3 className="text-xl font-bold mb-2">暂无内容</h3>
        <p className="text-muted-foreground text-sm">
          成为第一个分享的邻居吧!
        </p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CommunityCardV2 post={post} />
        </motion.div>
      ))}
    </Masonry>
  );
};

// 骨架屏卡片
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
    {/* 图片骨架 */}
    <div className="w-full bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse"
         style={{ height: `${Math.random() * 150 + 200}px` }}
    />

    {/* 内容骨架 */}
    <div className="p-4 space-y-3">
      {/* 标题骨架 */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>

      {/* 底部栏骨架 */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-16" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-3 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);
