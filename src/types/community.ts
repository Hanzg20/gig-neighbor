/**
 * Community Posts Domain Types
 * Dedicated types for the community forum feature
 *
 * JustTalk 真言系统：
 * - 所有分类(MOMENT/ACTION/HELP/NOTICE)都可选择普通模式或真言模式
 * - 真言模式需要填写额外的结构化字段(时间/地点/类型)
 * - 真言帖支持社区共识投票
 */

// ============================================
// 帖子分类 (所有分类都支持普通/真言两种模式)
// ============================================
export type CommunityPostType =
    | 'MOMENT'       // 🏘️ 邻里 - 日常分享、生活瞬间 (Neighbors)
    | 'ACTION'       // 🤝 参加 - 活动召集、组队参与 (Events)
    | 'HELP'         // 🆘 求助 - 求助需求、寻人寻物 (Help)
    | 'NOTICE'       // 📢 公告 - 社区通知、重要信息 (Notices)
    | 'LATEST';      // 最新 (Virtual type for UI filtering)

export type CommunityPostStatus = 'ACTIVE' | 'RESOLVED' | 'ARCHIVED' | 'DELETED';

// ============================================
// 真言(Fact)相关类型
// ============================================

/** 真言事件类型 */
export type FactType =
    | 'SERVICE_EXPERIENCE'   // 🛠️ 服务体验 - 家政、维修、餐饮等
    | 'PROPERTY_ISSUE'       // 🏠 物业问题 - 小区管理、设施问题
    | 'PRICE_CHANGE'         // 💰 价格变动 - 租金、服务价格等
    | 'SAFETY_ALERT'         // ⚠️ 安全提醒 - 安全隐患、治安问题
    | 'RECOMMENDATION'       // ⭐ 真心推荐 - 好店好服务
    | 'NEIGHBORHOOD_INFO'    // 📍 社区信息 - 本地动态
    | 'OTHER';               // 其他

/** 真言涉及对象类型 */
export type FactSubjectType = 'business' | 'service' | 'person' | 'property' | 'other';

/** 真言涉及对象 */
export interface FactSubject {
    type: FactSubjectType;
    name: string;
    identifier?: string;     // 关联的商家/服务ID (可选)
}

/** 真言额外数据 */
export interface FactData {
    occurredAt: string;      // 发生时间 (ISO日期或"2026-01"月份格式)
    location: string;        // 发生地点
    factType: FactType;      // 事件类型
    subject?: FactSubject;   // 涉及对象 (可选)
    evidence?: string[];     // 证据图片URLs (最多3张)
}

/** 共识投票类型 */
export type ConsensusVoteType = 'agree' | 'partial' | 'disagree' | 'uncertain';

/** 共识等级 */
export type ConsensusLevel =
    | 'HIGH'           // agree >= 70%, votes >= 10
    | 'MEDIUM'         // agree >= 50%, votes >= 5
    | 'LOW'            // agree < 50% || votes < 5
    | 'CONTROVERSIAL'  // disagree >= 30%
    | 'PENDING';       // votes < 3

/** 社区共识数据 */
export interface Consensus {
    agree: number;           // 与我经历一致
    partial: number;         // 部分一致
    disagree: number;        // 与我经历不一致
    uncertain: number;       // 不确定/没经历过
    totalVotes: number;      // 总投票数
    level: ConsensusLevel;   // 共识等级
}

/** 计算共识等级 */
export function calculateConsensusLevel(consensus: Omit<Consensus, 'level'>): ConsensusLevel {
    const { agree, partial, disagree, totalVotes } = consensus;

    if (totalVotes < 3) return 'PENDING';

    const agreeRate = agree / totalVotes;
    const disagreeRate = disagree / totalVotes;

    if (disagreeRate >= 0.30) return 'CONTROVERSIAL';
    if (agreeRate >= 0.70 && totalVotes >= 10) return 'HIGH';
    if (agreeRate >= 0.50 && totalVotes >= 5) return 'MEDIUM';
    return 'LOW';
}

/** 共识等级提示文案 */
export const CONSENSUS_LEVEL_HINTS: Record<ConsensusLevel, { zh: string; en: string }> = {
    HIGH: { zh: '高度一致，可信度较高', en: 'Highly consistent, trustworthy' },
    MEDIUM: { zh: '多数一致，可参考', en: 'Mostly consistent, worth considering' },
    LOW: { zh: '样本较少，谨慎参考', en: 'Limited samples, use with caution' },
    CONTROVERSIAL: { zh: '存在争议，建议多方了解', en: 'Controversial, seek more opinions' },
    PENDING: { zh: '等待更多邻居验证', en: 'Awaiting more verifications' },
};

// ============================================
// 用户贡献度与等级
// ============================================

/** 用户等级 */
export interface UserLevel {
    level: number;           // 1-5
    name: string;            // 等级名称
    icon: string;            // 等级图标
    minScore: number;        // 最低分数要求
}

/** 用户等级配置 */
export const USER_LEVELS: UserLevel[] = [
    { level: 1, name: '新邻居', icon: '🌱', minScore: 0 },
    { level: 2, name: '活跃邻居', icon: '🌿', minScore: 100 },
    { level: 3, name: '热心邻居', icon: '🌳', minScore: 500 },
    { level: 4, name: '社区达人', icon: '⭐', minScore: 2000 },
    { level: 5, name: '真言先锋', icon: '👑', minScore: 5000 },
];

/** 根据分数获取用户等级 */
export function getUserLevel(score: number): UserLevel {
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
        if (score >= USER_LEVELS[i].minScore) {
            return USER_LEVELS[i];
        }
    }
    return USER_LEVELS[0];
}

/** 用户贡献度数据 */
export interface UserContribution {
    userId: string;
    score: number;           // 总贡献分数
    level: number;           // 当前等级

    // 统计数据
    totalPosts: number;
    factPosts: number;       // 真言帖数量
    totalComments: number;
    likesReceived: number;
    factVotesReceived: number;
    avgAgreeRate: number;    // 平均认可率 (0-1)
    votesGiven: number;      // 参与投票次数

    updatedAt: string;
}

// ============================================
// 帖子主体类型
// ============================================

export interface CommunityPost {
    id: string;
    authorId: string;

    // Content
    postType: CommunityPostType;
    title?: string;
    content: string;
    images: string[];
    mediaUrl?: string; // Dedicated field for YouTube/Spotify/Bilibili/XHS links

    // ========== 真言(Fact)相关字段 ==========
    isFact: boolean;         // 是否为真言帖
    factData?: FactData;     // 真言额外数据 (仅 isFact=true 时有值)
    consensus?: Consensus;   // 社区共识 (仅 isFact=true 时有值)
    myVote?: ConsensusVoteType; // 当前用户的投票 (仅 isFact=true 时有值)

    // Pricing (optional)
    priceHint?: number; // in cents
    priceNegotiable: boolean;

    // Location
    locationText?: string;
    nodeId?: string;

    // Tags
    tags: string[];

    // Social Metrics
    likeCount: number;
    commentCount: number;
    viewCount: number;
    saveCount?: number;      // 收藏数

    // Status
    status: CommunityPostStatus;
    isPinned: boolean;
    isResolved: boolean;

    // Author info (joined from user_profiles)
    author?: {
        id: string;
        name: string;
        avatar?: string;
        level?: number;      // 用户等级 (1-5)
        levelIcon?: string;  // 等级图标
    };

    // User interaction state (for current user)
    isLikedByMe?: boolean;
    isSavedByMe?: boolean;   // 是否已收藏

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface CommunityComment {
    id: string;
    postId: string;
    authorId: string;

    content: string;
    parentCommentId?: string;

    likeCount: number;

    // Author info (joined)
    author?: {
        id: string;
        name: string;
        avatar?: string;
        level?: number;
        levelIcon?: string;
    };

    // Nested replies (for tree structure)
    replies?: CommunityComment[];

    isLikedByMe?: boolean;

    createdAt: string;
    updatedAt: string;
}

// ============================================
// Input 类型 (创建/更新)
// ============================================

export interface CreateCommunityPostInput {
    postType: CommunityPostType;
    title?: string;
    content: string;
    images?: string[];
    mediaUrl?: string;
    priceHint?: number;
    priceNegotiable?: boolean;
    locationText?: string;
    nodeId?: string;
    tags?: string[];

    // 真言相关
    isFact?: boolean;
    factData?: FactData;
}

export interface UpdateCommunityPostInput {
    title?: string;
    content?: string;
    images?: string[];
    mediaUrl?: string;
    priceHint?: number;
    priceNegotiable?: boolean;
    locationText?: string;
    tags?: string[];
    status?: CommunityPostStatus;
    isResolved?: boolean;

    // 真言相关 (真言帖可更新事实数据)
    factData?: FactData;
}

export interface CreateCommentInput {
    postId: string;
    content: string;
    parentCommentId?: string;

    // 补充事实评论 (仅用于真言帖)
    isFactComment?: boolean;
    factAddition?: {
        occurredAt?: string;   // 我的经历时间
        content: string;       // 补充内容
    };
}

// ============================================
// 真言投票相关
// ============================================

export interface FactVoteInput {
    postId: string;
    voteType: ConsensusVoteType;
}

export interface FactVoteRecord {
    id: string;
    postId: string;
    userId: string;
    voteType: ConsensusVoteType;
    createdAt: string;
}

// ============================================
// 真言事件类型配置
// ============================================

export const FACT_TYPE_CONFIG: Record<FactType, { zh: string; en: string; icon: string }> = {
    SERVICE_EXPERIENCE: { zh: '服务体验', en: 'Service Experience', icon: '🛠️' },
    PROPERTY_ISSUE: { zh: '物业问题', en: 'Property Issue', icon: '🏠' },
    PRICE_CHANGE: { zh: '价格变动', en: 'Price Change', icon: '💰' },
    SAFETY_ALERT: { zh: '安全提醒', en: 'Safety Alert', icon: '⚠️' },
    RECOMMENDATION: { zh: '真心推荐', en: 'Recommendation', icon: '⭐' },
    NEIGHBORHOOD_INFO: { zh: '社区信息', en: 'Neighborhood Info', icon: '📍' },
    OTHER: { zh: '其他', en: 'Other', icon: '📝' },
};
