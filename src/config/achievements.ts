import { Achievement } from '@/types/gamification';

/**
 * 成就系统配置
 * 定义所有可解锁的成就
 */
export const ACHIEVEMENTS: Achievement[] = [
  // ==================== 社交互动 ====================
  {
    id: 'first_post',
    name: '初来乍到',
    nameEn: 'First Post',
    description: '发布第一条动态',
    category: 'social',
    rarity: 'common',
    icon: '✍️',
    requirement: {
      type: 'count',
      target: 1,
      metric: 'posts'
    },
    rewards: {
      exp: 50,
      title: '新人'
    }
  },
  {
    id: 'posts_10',
    name: '活跃分享者',
    nameEn: 'Active Sharer',
    description: '累计发布 10 条动态',
    category: 'social',
    rarity: 'common',
    icon: '📝',
    requirement: {
      type: 'count',
      target: 10,
      metric: 'posts'
    },
    rewards: {
      exp: 200
    }
  },
  {
    id: 'posts_50',
    name: '内容达人',
    nameEn: 'Content Master',
    description: '累计发布 50 条动态',
    category: 'social',
    rarity: 'rare',
    icon: '🌟',
    requirement: {
      type: 'count',
      target: 50,
      metric: 'posts'
    },
    rewards: {
      exp: 1000,
      title: '内容达人'
    }
  },
  {
    id: 'likes_100',
    name: '点赞之星',
    nameEn: 'Like Star',
    description: '累计获得 100 个赞',
    category: 'social',
    rarity: 'rare',
    icon: '❤️',
    requirement: {
      type: 'count',
      target: 100,
      metric: 'likes_received'
    },
    rewards: {
      exp: 500
    }
  },
  {
    id: 'likes_500',
    name: '人气王',
    nameEn: 'Popularity King',
    description: '累计获得 500 个赞',
    category: 'social',
    rarity: 'epic',
    icon: '👑',
    requirement: {
      type: 'count',
      target: 500,
      metric: 'likes_received'
    },
    rewards: {
      exp: 2500,
      title: '人气王'
    }
  },

  // ==================== 社区贡献 ====================
  {
    id: 'helper_10',
    name: '热心邻居',
    nameEn: 'Helpful Neighbor',
    description: '帮助 10 位邻居',
    category: 'community',
    rarity: 'common',
    icon: '🤝',
    requirement: {
      type: 'count',
      target: 10,
      metric: 'helpers_count'
    },
    rewards: {
      exp: 300
    }
  },
  {
    id: 'helper_50',
    name: '社区天使',
    nameEn: 'Community Angel',
    description: '帮助 50 位邻居',
    category: 'community',
    rarity: 'epic',
    icon: '😇',
    requirement: {
      type: 'count',
      target: 50,
      metric: 'helpers_count'
    },
    rewards: {
      exp: 1500,
      title: '社区天使'
    }
  },
  {
    id: 'comments_100',
    name: '积极发言',
    nameEn: 'Active Commenter',
    description: '累计评论 100 次',
    category: 'community',
    rarity: 'rare',
    icon: '💬',
    requirement: {
      type: 'count',
      target: 100,
      metric: 'comments_count'
    },
    rewards: {
      exp: 600
    }
  },

  // ==================== 交易活动 ====================
  {
    id: 'first_deal',
    name: '首单达成',
    nameEn: 'First Deal',
    description: '完成第一笔交易',
    category: 'trading',
    rarity: 'common',
    icon: '🤝',
    requirement: {
      type: 'count',
      target: 1,
      metric: 'deals_completed'
    },
    rewards: {
      exp: 100
    }
  },
  {
    id: 'deals_10',
    name: '交易能手',
    nameEn: 'Deal Expert',
    description: '完成 10 笔交易',
    category: 'trading',
    rarity: 'rare',
    icon: '💼',
    requirement: {
      type: 'count',
      target: 10,
      metric: 'deals_completed'
    },
    rewards: {
      exp: 800
    }
  },
  {
    id: 'deals_50',
    name: '交易大师',
    nameEn: 'Deal Master',
    description: '完成 50 笔交易',
    category: 'trading',
    rarity: 'epic',
    icon: '🏆',
    requirement: {
      type: 'count',
      target: 50,
      metric: 'deals_completed'
    },
    rewards: {
      exp: 4000,
      title: '交易大师'
    }
  },

  // ==================== 连续签到 ====================
  {
    id: 'checkin_7',
    name: '坚持一周',
    nameEn: 'Week Warrior',
    description: '连续签到 7 天',
    category: 'special',
    rarity: 'common',
    icon: '📅',
    requirement: {
      type: 'streak',
      target: 7,
      metric: 'checkin_streak'
    },
    rewards: {
      exp: 300
    }
  },
  {
    id: 'checkin_30',
    name: '月度坚持',
    nameEn: 'Monthly Hero',
    description: '连续签到 30 天',
    category: 'special',
    rarity: 'rare',
    icon: '🗓️',
    requirement: {
      type: 'streak',
      target: 30,
      metric: 'checkin_streak'
    },
    rewards: {
      exp: 1500,
      title: '坚持达人'
    }
  },
  {
    id: 'checkin_100',
    name: '百日坚持',
    nameEn: 'Century Achiever',
    description: '连续签到 100 天',
    category: 'special',
    rarity: 'legendary',
    icon: '💯',
    requirement: {
      type: 'streak',
      target: 100,
      metric: 'checkin_streak'
    },
    rewards: {
      exp: 10000,
      title: '传奇邻居'
    }
  },

  // ==================== 特殊成就 ====================
  {
    id: 'early_bird',
    name: '早起鸟儿',
    nameEn: 'Early Bird',
    description: '连续 7 天早上 6-8 点发帖',
    category: 'special',
    rarity: 'rare',
    icon: '🐦',
    requirement: {
      type: 'special',
      target: 7,
      metric: 'early_posts'
    },
    rewards: {
      exp: 800
    }
  },
  {
    id: 'night_owl',
    name: '夜猫子',
    nameEn: 'Night Owl',
    description: '连续 7 天深夜 22-24 点发帖',
    category: 'special',
    rarity: 'rare',
    icon: '🦉',
    requirement: {
      type: 'special',
      target: 7,
      metric: 'night_posts'
    },
    rewards: {
      exp: 800
    }
  },
  {
    id: 'community_founder',
    name: '社区元老',
    nameEn: 'Community Founder',
    description: '加入社区超过 365 天',
    category: 'special',
    rarity: 'legendary',
    icon: '🎖️',
    requirement: {
      type: 'special',
      target: 365,
      metric: 'days_since_joined'
    },
    rewards: {
      exp: 5000,
      title: '社区元老'
    }
  }
];

/**
 * 等级配置
 */
export const LEVEL_CONFIG = [
  { level: 1, title: '新手邻居', expRequired: 0, color: '#94a3b8', icon: '🌱', perks: [] },
  { level: 2, title: '活跃邻居', expRequired: 100, color: '#22c55e', icon: '🌿', perks: ['发帖无审核'] },
  { level: 3, title: '热心邻居', expRequired: 300, color: '#3b82f6', icon: '🌳', perks: ['发帖无审核', '置顶权限x1'] },
  { level: 4, title: '资深邻居', expRequired: 600, color: '#8b5cf6', icon: '🌲', perks: ['发帖无审核', '置顶权限x2'] },
  { level: 5, title: '明星邻居', expRequired: 1000, color: '#f59e0b', icon: '⭐', perks: ['发帖无审核', '置顶权限x3', '专属徽章'] },
  { level: 6, title: '传奇邻居', expRequired: 2000, color: '#ef4444', icon: '👑', perks: ['发帖无审核', '置顶权限x5', '专属徽章', '排行榜高亮'] },
  { level: 7, title: '社区领袖', expRequired: 5000, color: '#a855f7', icon: '💎', perks: ['所有权限', '社区管理'] }
];

/**
 * 根据经验值计算等级
 */
export const calculateLevel = (exp: number): UserLevel => {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_CONFIG[i].expRequired) {
      const nextLevel = LEVEL_CONFIG[i + 1];
      return {
        level: LEVEL_CONFIG[i].level,
        title: LEVEL_CONFIG[i].title,
        expRequired: nextLevel ? nextLevel.expRequired : LEVEL_CONFIG[i].expRequired,
        expCurrent: exp,
        color: LEVEL_CONFIG[i].color,
        icon: LEVEL_CONFIG[i].icon,
        perks: LEVEL_CONFIG[i].perks
      };
    }
  }
  return {
    level: 1,
    title: LEVEL_CONFIG[0].title,
    expRequired: LEVEL_CONFIG[1].expRequired,
    expCurrent: exp,
    color: LEVEL_CONFIG[0].color,
    icon: LEVEL_CONFIG[0].icon,
    perks: LEVEL_CONFIG[0].perks
  };
};
