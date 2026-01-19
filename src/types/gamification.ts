/**
 * 游戏化系统类型定义
 * 包括成就、徽章、等级、排行榜等
 */

export type AchievementCategory =
  | 'social'      // 社交互动
  | 'content'     // 内容创作
  | 'community'   // 社区贡献
  | 'trading'     // 交易活动
  | 'special';    // 特殊成就

export type AchievementRarity =
  | 'common'      // 普通
  | 'rare'        // 稀有
  | 'epic'        // 史诗
  | 'legendary';  // 传说

export interface Achievement {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;  // emoji or icon name

  // 解锁条件
  requirement: {
    type: 'count' | 'streak' | 'special';
    target: number;
    metric: string; // 'posts', 'likes', 'comments', 'days', etc.
  };

  // 奖励
  rewards: {
    exp: number;
    title?: string;
  };

  // 进度追踪
  progress?: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface UserLevel {
  level: number;
  title: string;
  titleEn?: string;
  expRequired: number;
  expCurrent: number;
  color: string;
  icon: string;
  perks: string[]; // 等级特权
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  level: number;
  achievements: number;
  badge?: string;
  trend?: 'up' | 'down' | 'stable'; // 排名趋势
}

export interface CheckInStreak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastCheckIn?: string;
  checkInDates: string[];
}

export interface UserGameStats {
  // 基础数据
  userId: string;
  level: number;
  exp: number;

  // 成就
  achievements: string[]; // achievement IDs
  achievementCount: number;

  // 签到
  checkIn: CheckInStreak;

  // 社交数据
  postsCount: number;
  likesReceived: number;
  likesGiven: number;
  commentsCount: number;

  // 交易数据
  dealsCompleted: number;
  helpersCount: number;

  // 时间戳
  joinedAt: string;
  updatedAt: string;
}
