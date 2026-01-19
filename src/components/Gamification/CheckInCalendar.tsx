import { useState } from 'react';
import { CheckInStreak } from '@/types/gamification';
import { Calendar, Flame, Gift, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CheckInCalendarProps {
  streak: CheckInStreak;
  onCheckIn: () => Promise<void>;
  className?: string;
}

export const CheckInCalendar = ({ streak, onCheckIn, className = '' }: CheckInCalendarProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const today = new Date().toDateString();
  const hasCheckedToday = streak.lastCheckIn
    ? new Date(streak.lastCheckIn).toDateString() === today
    : false;

  // 获取最近7天的日期
  const getLast7Days = () => {
    const days: { date: Date; checked: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        checked: streak.checkInDates?.includes(dateString) || false
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // 签到奖励计算
  const getReward = (streakCount: number) => {
    if (streakCount >= 30) return { exp: 100, bonus: '月度坚持奖励' };
    if (streakCount >= 7) return { exp: 50, bonus: '周坚持奖励' };
    return { exp: 10 + streakCount * 2, bonus: null };
  };

  const handleCheckIn = async () => {
    if (hasCheckedToday || isChecking) return;

    setIsChecking(true);
    try {
      await onCheckIn();
      const reward = getReward(streak.currentStreak + 1);

      setShowReward(true);
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">签到成功！🎉</span>
          <span className="text-sm">+{reward.exp} EXP</span>
          {reward.bonus && <span className="text-xs text-primary">{reward.bonus}!</span>}
        </div>
      );

      setTimeout(() => setShowReward(false), 3000);
    } catch (error) {
      toast.error('签到失败，请重试');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">每日签到</h3>
            <p className="text-xs text-muted-foreground">坚持签到，领取奖励</p>
          </div>
        </div>

        {/* 连续签到天数 */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end mb-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">
              {streak.currentStreak}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">连续天数</div>
        </div>
      </div>

      {/* 签到日历（最近7天） */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day, index) => {
            const isToday = day.date.toDateString() === today;
            return (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-muted-foreground mb-2">
                  {day.date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                </div>
                <motion.div
                  animate={day.checked ? { scale: [1, 1.2, 1] } : {}}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${day.checked
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {day.checked ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">
                      {day.date.getDate()}
                    </span>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 签到按钮 */}
      <Button
        onClick={handleCheckIn}
        disabled={hasCheckedToday || isChecking}
        className="w-full h-12 text-base font-bold relative overflow-hidden"
      >
        {isChecking ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>签到中...</span>
          </div>
        ) : hasCheckedToday ? (
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>今日已签到</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span>立即签到</span>
          </div>
        )}

        {/* 光泽效果 */}
        {!hasCheckedToday && !isChecking && (
          <motion.div
            animate={{
              x: ['-200%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        )}
      </Button>

      {/* 奖励动画 */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>
              <h4 className="text-xl font-bold mb-2">签到成功！</h4>
              <p className="text-3xl font-bold text-primary mb-1">
                +{getReward(streak.currentStreak + 1).exp} EXP
              </p>
              <p className="text-sm text-muted-foreground">
                已连续签到 {streak.currentStreak + 1} 天
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">
            {streak.currentStreak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">当前连续</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {streak.longestStreak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">最长连续</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {streak.totalDays}
          </div>
          <div className="text-xs text-muted-foreground mt-1">累计天数</div>
        </div>
      </div>

      {/* 里程碑提示 */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          {streak.currentStreak < 7
            ? `再坚持 ${7 - streak.currentStreak} 天解锁「坚持一周」成就`
            : streak.currentStreak < 30
            ? `再坚持 ${30 - streak.currentStreak} 天解锁「月度坚持」成就`
            : '你已经是签到大师了！🎉'}
        </p>
      </div>
    </div>
  );
};
