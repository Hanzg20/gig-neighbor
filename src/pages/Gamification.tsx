import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserLevelCard } from '@/components/Gamification/UserLevelCard';
import { AchievementCard } from '@/components/Gamification/AchievementCard';
import { Leaderboard } from '@/components/Gamification/Leaderboard';
import { CheckInCalendar } from '@/components/Gamification/CheckInCalendar';
import { ACHIEVEMENTS, calculateLevel } from '@/config/achievements';
import { Trophy, Award, Calendar, TrendingUp } from 'lucide-react';

const Gamification = () => {
  // 模拟用户数据
  const [userExp] = useState(2500);
  const [checkInStreak] = useState({
    currentStreak: 12,
    longestStreak: 25,
    totalDays: 45,
    lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    checkInDates: [
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ]
  });

  const userLevel = calculateLevel(userExp);

  // 模拟成就进度
  const achievementsWithProgress = ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    progress: achievement.requirement.target * 0.6, // 模拟60%进度
    unlocked: Math.random() > 0.5, // 随机解锁状态
    unlockedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined
  }));

  const handleCheckIn = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Check-in successful');
        resolve();
      }, 1000);
    });
  };

  // 分类成就
  const achievementsByCategory = {
    social: achievementsWithProgress.filter((a) => a.category === 'social'),
    community: achievementsWithProgress.filter((a) => a.category === 'community'),
    trading: achievementsWithProgress.filter((a) => a.category === 'trading'),
    special: achievementsWithProgress.filter((a) => a.category === 'special')
  };

  const categoryLabels = {
    social: '社交互动',
    community: '社区贡献',
    trading: '交易活动',
    special: '特殊成就'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-7xl py-8 px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">成就中心</h1>
          <p className="text-muted-foreground">
            完成任务，解锁成就，提升等级，成为社区明星
          </p>
        </div>

        {/* 顶部卡片 - 等级和签到 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 用户等级卡片 */}
          <div className="lg:col-span-2">
            <UserLevelCard userLevel={userLevel} />
          </div>

          {/* 签到日历 */}
          <div className="relative">
            <CheckInCalendar streak={checkInStreak} onCheckIn={handleCheckIn} />
          </div>
        </div>

        {/* 主内容区 - Tabs */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">成就系统</span>
              <span className="sm:hidden">成就</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">排行榜</span>
              <span className="sm:hidden">排行</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">签到记录</span>
              <span className="sm:hidden">签到</span>
            </TabsTrigger>
          </TabsList>

          {/* 成就系统 */}
          <TabsContent value="achievements" className="space-y-6">
            {/* 成就统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <div className="text-3xl font-bold text-primary">
                  {achievementsWithProgress.filter((a) => a.unlocked).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">已解锁</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <div className="text-3xl font-bold text-muted-foreground">
                  {achievementsWithProgress.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">总成就</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {achievementsWithProgress.filter((a) => a.rarity === 'legendary' && a.unlocked).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">传说成就</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <div className="text-3xl font-bold text-purple-500">
                  {achievementsWithProgress.filter((a) => a.rarity === 'epic' && a.unlocked).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">史诗成就</div>
              </div>
            </div>

            {/* 成就分类展示 */}
            {Object.entries(achievementsByCategory).map(([category, achievements]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onClick={() => console.log('View achievement:', achievement.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 排行榜 */}
          <TabsContent value="leaderboard">
            <Leaderboard period="weekly" />
          </TabsContent>

          {/* 签到记录 */}
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CheckInCalendar streak={checkInStreak} onCheckIn={handleCheckIn} />

              {/* 签到奖励说明 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  签到奖励说明
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">每日签到</div>
                      <div className="text-xs text-muted-foreground">
                        基础奖励：10-30 EXP，连续天数越多奖励越高
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                      7
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">周坚持奖励</div>
                      <div className="text-xs text-muted-foreground">
                        连续签到 7 天：+50 EXP 奖励 + 解锁成就
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                      30
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">月度坚持奖励</div>
                      <div className="text-xs text-muted-foreground">
                        连续签到 30 天：+100 EXP 奖励 + 专属称号
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shrink-0">
                      💯
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">百日传奇</div>
                      <div className="text-xs text-muted-foreground">
                        连续签到 100 天：传说成就 + 10000 EXP
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 提示：断签后连续天数会重置，但累计天数不变
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Gamification;
