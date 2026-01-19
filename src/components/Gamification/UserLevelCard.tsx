import { UserLevel } from '@/types/gamification';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserLevelCardProps {
  userLevel: UserLevel;
  className?: string;
}

export const UserLevelCard = ({ userLevel, className = '' }: UserLevelCardProps) => {
  const progressPercent = userLevel.expRequired > 0
    ? ((userLevel.expCurrent - (userLevel.level > 1 ? userLevel.expRequired : 0)) /
       (userLevel.expRequired - (userLevel.level > 1 ? userLevel.expRequired : 0))) * 100
    : 0;

  const expToNextLevel = userLevel.expRequired - userLevel.expCurrent;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${className}`} style={{ borderColor: userLevel.color }}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 等级图标 */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-md"
            style={{ backgroundColor: userLevel.color + '20' }}
          >
            <span>{userLevel.icon}</span>
          </div>

          {/* 等级信息 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-xl" style={{ color: userLevel.color }}>
                Lv.{userLevel.level}
              </h3>
              <Badge variant="outline" style={{ borderColor: userLevel.color, color: userLevel.color }}>
                {userLevel.title}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {expToNextLevel > 0 ? `还需 ${expToNextLevel} 经验升级` : '已达满级'}
            </p>
          </div>
        </div>

        {/* 经验值 */}
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: userLevel.color }}>
            {userLevel.expCurrent.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">总经验</div>
        </div>
      </div>

      {/* 进度条 */}
      {expToNextLevel > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">升级进度</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ backgroundColor: userLevel.color }}
            >
              {/* 闪光效果 */}
              <motion.div
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* 特权列表 */}
      {userLevel.perks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Award className="w-4 h-4" style={{ color: userLevel.color }} />
            <span>等级特权</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {userLevel.perks.map((perk, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2"
              >
                <Zap className="w-3 h-3" style={{ color: userLevel.color }} />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 提示 */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        <span>发帖、互动和完成任务都能获得经验值</span>
      </div>
    </div>
  );
};
