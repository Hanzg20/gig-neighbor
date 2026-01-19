/**
 * Community Posts Domain Types
 * Dedicated types for the community forum feature
 */

export type CommunityPostType =
    | 'MOMENT'       // 邻里动态 (Neighbors)
    | 'ACTION'       // 活动/交易 (Events/Trade/Swap)
    | 'HELP'         // 互助/求助 (Problems/Help)
    | 'NOTICE'       // 官方公告 (Official Notices)
    | 'LATEST';     // 最新 (Virtual type for UI)

export type CommunityPostStatus = 'ACTIVE' | 'RESOLVED' | 'ARCHIVED' | 'DELETED';

export interface CommunityPost {
    id: string;
    authorId: string;

    // Content
    postType: CommunityPostType;
    title?: string;
    content: string;
    images: string[];
    mediaUrl?: string; // Dedicated field for YouTube/Spotify/Bilibili/XHS links

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

    // Status
    status: CommunityPostStatus;
    isPinned: boolean;
    isResolved: boolean;

    // Author info (joined from user_profiles)
    author?: {
        id: string;
        name: string;
        avatar?: string;
    };

    // User interaction state (for current user)
    isLikedByMe?: boolean;

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
    };

    // Nested replies (for tree structure)
    replies?: CommunityComment[];

    isLikedByMe?: boolean;

    createdAt: string;
    updatedAt: string;
}

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
}

export interface CreateCommentInput {
    postId: string;
    content: string;
    parentCommentId?: string;
}
