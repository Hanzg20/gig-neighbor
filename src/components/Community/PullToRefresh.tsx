import { motion } from 'framer-motion';
import { Loader2, ArrowDown, Check } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  shouldRefresh: boolean;
  progress: number;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  shouldRefresh,
  progress,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translateY(${Math.min(pullDistance, 80)}px)`,
        transition: isRefreshing ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-5 py-3 flex items-center gap-3 border border-border/50">
        {/* 图标 */}
        <div className="relative w-6 h-6">
          {isRefreshing ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : shouldRefresh ? (
            <Check className="w-6 h-6 text-green-500" />
          ) : (
            <motion.div
              animate={{ rotate: progress * 360 }}
              transition={{ duration: 0 }}
            >
              <ArrowDown className="w-6 h-6 text-muted-foreground" />
            </motion.div>
          )}
        </div>

        {/* 文字 */}
        <div className="text-sm font-medium">
          {isRefreshing ? (
            <span className="text-primary">刷新中...</span>
          ) : shouldRefresh ? (
            <span className="text-green-500">松开刷新</span>
          ) : (
            <span className="text-muted-foreground">下拉刷新</span>
          )}
        </div>

        {/* 进度条 */}
        {!isRefreshing && (
          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
