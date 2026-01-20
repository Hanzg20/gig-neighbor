import { create } from 'zustand';
import {
    CommunityPost,
    CommunityComment,
    CommunityPostType,
    CreateCommunityPostInput,
    CreateCommentInput,
    ConsensusVoteType,
    Consensus
} from '@/types/community';
import { communityPostRepository } from '@/services/repositories/supabase/CommunityPostRepository';

interface CommunityPostState {
    // Feed
    posts: CommunityPost[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    pageSize: number;

    // Current post detail
    currentPost: CommunityPost | null;
    currentPostComments: CommunityComment[];
    isLoadingDetail: boolean;

    // Actions
    fetchFeed: (options?: { nodeId?: string; postType?: CommunityPostType; query?: string; scope?: 'nearby' | 'city'; refresh?: boolean }) => Promise<void>;
    loadMore: (options?: { nodeId?: string; postType?: CommunityPostType; query?: string; scope?: 'nearby' | 'city' }) => Promise<void>;
    fetchPostDetail: (id: string) => Promise<void>;

    createPost: (authorId: string, input: CreateCommunityPostInput) => Promise<CommunityPost>;
    updatePost: (id: string, input: Partial<CreateCommunityPostInput>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    markAsResolved: (id: string) => Promise<void>;

    likePost: (postId: string, userId: string) => Promise<void>;
    unlikePost: (postId: string, userId: string) => Promise<void>;

    addComment: (authorId: string, input: CreateCommentInput) => Promise<CommunityComment>;
    deleteComment: (commentId: string) => Promise<void>;
    likeComment: (commentId: string, userId: string) => Promise<void>;
    unlikeComment: (commentId: string, userId: string) => Promise<void>;

    // Post-to-Service conversion
    convertToService: (postId: string, listingId: string) => Promise<void>;

    // 真言投票
    voteOnFact: (postId: string, userId: string, voteType: ConsensusVoteType) => Promise<void>;
    removeVote: (postId: string, userId: string) => Promise<void>;

    // 收藏
    savePost: (postId: string, userId: string) => Promise<void>;
    unsavePost: (postId: string, userId: string) => Promise<void>;

    reset: () => void;
}

export const useCommunityPostStore = create<CommunityPostState>((set, get) => ({
    posts: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
    pageSize: 20,
    currentPost: null,
    currentPostComments: [],
    isLoadingDetail: false,

    fetchFeed: async (options = {}) => {
        const { refresh = true } = options;
        set({ isLoading: true, error: null });
        try {
            const { pageSize } = get();
            const posts = await communityPostRepository.getFeed({
                nodeId: options.nodeId,
                postType: options.postType,
                query: options.query,
                limit: pageSize,
                offset: 0
            });
            set({
                posts,
                isLoading: false,
                page: 1,
                hasMore: posts.length >= pageSize
            });
        } catch (error: any) {
            console.error('Failed to fetch community feed:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    loadMore: async (options = {}) => {
        const { isLoading, hasMore, page, pageSize, posts: currentPosts } = get();

        // 防止重复加载
        if (isLoading || !hasMore) return;

        set({ isLoading: true });
        try {
            const nextPage = page + 1;
            const offset = page * pageSize;

            const newPosts = await communityPostRepository.getFeed({
                nodeId: options.nodeId,
                postType: options.postType,
                query: options.query,
                limit: pageSize,
                offset
            });

            set({
                posts: [...currentPosts, ...newPosts],
                isLoading: false,
                page: nextPage,
                hasMore: newPosts.length >= pageSize
            });
        } catch (error: any) {
            console.error('Failed to load more posts:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchPostDetail: async (id: string) => {
        set({ isLoadingDetail: true });
        try {
            const [post, comments] = await Promise.all([
                communityPostRepository.getById(id),
                communityPostRepository.getComments(id)
            ]);

            if (post) {
                // Increment view count (fire and forget)
                communityPostRepository.incrementViewCount(id);
            }

            set({
                currentPost: post,
                currentPostComments: comments,
                isLoadingDetail: false
            });
        } catch (error: any) {
            console.error('Failed to fetch post detail:', error);
            set({ isLoadingDetail: false });
        }
    },

    createPost: async (authorId: string, input: CreateCommunityPostInput) => {
        const newPost = await communityPostRepository.create(authorId, input);
        set(state => ({ posts: [newPost, ...state.posts] }));
        return newPost;
    },

    updatePost: async (id: string, input: Partial<CreateCommunityPostInput>) => {
        const updated = await communityPostRepository.update(id, input);
        set(state => ({
            posts: state.posts.map(p => p.id === id ? updated : p),
            currentPost: state.currentPost?.id === id ? updated : state.currentPost
        }));
    },

    deletePost: async (id: string) => {
        await communityPostRepository.delete(id);
        set(state => ({
            posts: state.posts.filter(p => p.id !== id),
            currentPost: state.currentPost?.id === id ? null : state.currentPost
        }));
    },

    markAsResolved: async (id: string) => {
        await communityPostRepository.update(id, { isResolved: true, status: 'RESOLVED' });
        set(state => ({
            posts: state.posts.map(p => p.id === id ? { ...p, isResolved: true, status: 'RESOLVED' as const } : p),
            currentPost: state.currentPost?.id === id
                ? { ...state.currentPost, isResolved: true, status: 'RESOLVED' as const }
                : state.currentPost
        }));
    },

    likePost: async (postId: string, userId: string) => {
        await communityPostRepository.likePost(postId, userId);
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? { ...p, likeCount: p.likeCount + 1, isLikedByMe: true }
                    : p
            ),
            currentPost: state.currentPost?.id === postId
                ? { ...state.currentPost, likeCount: state.currentPost.likeCount + 1, isLikedByMe: true }
                : state.currentPost
        }));
    },

    unlikePost: async (postId: string, userId: string) => {
        await communityPostRepository.unlikePost(postId, userId);
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? { ...p, likeCount: Math.max(0, p.likeCount - 1), isLikedByMe: false }
                    : p
            ),
            currentPost: state.currentPost?.id === postId
                ? { ...state.currentPost, likeCount: Math.max(0, state.currentPost.likeCount - 1), isLikedByMe: false }
                : state.currentPost
        }));
    },

    addComment: async (authorId: string, input: CreateCommentInput) => {
        const newComment = await communityPostRepository.createComment(authorId, input);
        set(state => ({
            currentPostComments: [...state.currentPostComments, newComment],
            // Update comment count in post
            posts: state.posts.map(p =>
                p.id === input.postId
                    ? { ...p, commentCount: p.commentCount + 1 }
                    : p
            ),
            currentPost: state.currentPost?.id === input.postId
                ? { ...state.currentPost, commentCount: state.currentPost.commentCount + 1 }
                : state.currentPost
        }));
        return newComment;
    },

    deleteComment: async (commentId: string) => {
        const comment = get().currentPostComments.find(c => c.id === commentId);
        if (!comment) return;

        await communityPostRepository.deleteComment(commentId);
        set(state => ({
            currentPostComments: state.currentPostComments.filter(c => c.id !== commentId),
            // Update comment count in post
            posts: state.posts.map(p =>
                p.id === comment.postId
                    ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
                    : p
            ),
            currentPost: state.currentPost?.id === comment.postId
                ? { ...state.currentPost, commentCount: Math.max(0, state.currentPost.commentCount - 1) }
                : state.currentPost
        }));
    },

    likeComment: async (commentId: string, userId: string) => {
        // Optimistic update
        set(state => ({
            currentPostComments: state.currentPostComments.map(c =>
                c.id === commentId
                    ? { ...c, likeCount: c.likeCount + 1, isLikedByMe: true }
                    : c
            )
        }));

        try {
            await communityPostRepository.likeComment(commentId, userId);
        } catch (error) {
            // Rollback on error
            set(state => ({
                currentPostComments: state.currentPostComments.map(c =>
                    c.id === commentId
                        ? { ...c, likeCount: Math.max(0, c.likeCount - 1), isLikedByMe: false }
                        : c
                )
            }));
            throw error;
        }
    },

    unlikeComment: async (commentId: string, userId: string) => {
        // Optimistic update
        set(state => ({
            currentPostComments: state.currentPostComments.map(c =>
                c.id === commentId
                    ? { ...c, likeCount: Math.max(0, c.likeCount - 1), isLikedByMe: false }
                    : c
            )
        }));

        try {
            await communityPostRepository.unlikeComment(commentId, userId);
        } catch (error) {
            // Rollback on error
            set(state => ({
                currentPostComments: state.currentPostComments.map(c =>
                    c.id === commentId
                        ? { ...c, likeCount: c.likeCount + 1, isLikedByMe: true }
                        : c
                )
            }));
            throw error;
        }
    },

    convertToService: async (postId: string, listingId: string) => {
        await communityPostRepository.convertToListing(postId, listingId);
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? { ...p, isResolved: true, status: 'RESOLVED' as const }
                    : p
            )
        }));
    },

    // 真言投票
    voteOnFact: async (postId: string, userId: string, voteType: ConsensusVoteType) => {
        // 获取当前投票状态
        const { currentPost, posts } = get();
        const post = currentPost?.id === postId ? currentPost : posts.find(p => p.id === postId);
        const previousVote = post?.myVote;

        // 乐观更新
        const updateConsensus = (consensus: Consensus | undefined, oldVote: ConsensusVoteType | undefined, newVote: ConsensusVoteType): Consensus => {
            const updated: Consensus = consensus ? { ...consensus } : {
                agree: 0,
                partial: 0,
                disagree: 0,
                uncertain: 0,
                totalVotes: 0,
                level: 'PENDING'
            };

            // 移除旧投票
            if (oldVote) {
                updated[oldVote] = Math.max(0, updated[oldVote] - 1);
            } else {
                updated.totalVotes++;
            }

            // 添加新投票
            updated[newVote]++;

            return updated;
        };

        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        myVote: voteType,
                        consensus: updateConsensus(p.consensus, previousVote, voteType)
                    }
                    : p
            ),
            currentPost: state.currentPost?.id === postId
                ? {
                    ...state.currentPost,
                    myVote: voteType,
                    consensus: updateConsensus(state.currentPost.consensus, previousVote, voteType)
                }
                : state.currentPost
        }));

        try {
            await communityPostRepository.voteOnFact(postId, userId, voteType);
        } catch (error) {
            // 回滚
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId
                        ? { ...p, myVote: previousVote, consensus: post?.consensus }
                        : p
                ),
                currentPost: state.currentPost?.id === postId
                    ? { ...state.currentPost, myVote: previousVote, consensus: post?.consensus }
                    : state.currentPost
            }));
            throw error;
        }
    },

    removeVote: async (postId: string, userId: string) => {
        const { currentPost, posts } = get();
        const post = currentPost?.id === postId ? currentPost : posts.find(p => p.id === postId);
        const previousVote = post?.myVote;

        if (!previousVote) return;

        // 乐观更新
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        myVote: undefined,
                        consensus: p.consensus ? {
                            ...p.consensus,
                            [previousVote]: Math.max(0, p.consensus[previousVote] - 1),
                            totalVotes: Math.max(0, p.consensus.totalVotes - 1)
                        } : undefined
                    }
                    : p
            ),
            currentPost: state.currentPost?.id === postId && state.currentPost.consensus
                ? {
                    ...state.currentPost,
                    myVote: undefined,
                    consensus: {
                        ...state.currentPost.consensus,
                        [previousVote]: Math.max(0, state.currentPost.consensus[previousVote] - 1),
                        totalVotes: Math.max(0, state.currentPost.consensus.totalVotes - 1)
                    }
                }
                : state.currentPost
        }));

        try {
            await communityPostRepository.removeVote(postId, userId);
        } catch (error) {
            // 回滚
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId
                        ? { ...p, myVote: previousVote, consensus: post?.consensus }
                        : p
                ),
                currentPost: state.currentPost?.id === postId
                    ? { ...state.currentPost, myVote: previousVote, consensus: post?.consensus }
                    : state.currentPost
            }));
            throw error;
        }
    },

    // 收藏
    savePost: async (postId: string, userId: string) => {
        // 乐观更新
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? { ...p, isSavedByMe: true, saveCount: (p.saveCount || 0) + 1 }
                    : p
            ),
            currentPost: state.currentPost?.id === postId
                ? { ...state.currentPost, isSavedByMe: true, saveCount: (state.currentPost.saveCount || 0) + 1 }
                : state.currentPost
        }));

        try {
            await communityPostRepository.savePost(postId, userId);
        } catch (error) {
            // 回滚
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId
                        ? { ...p, isSavedByMe: false, saveCount: Math.max(0, (p.saveCount || 1) - 1) }
                        : p
                ),
                currentPost: state.currentPost?.id === postId
                    ? { ...state.currentPost, isSavedByMe: false, saveCount: Math.max(0, (state.currentPost.saveCount || 1) - 1) }
                    : state.currentPost
            }));
            throw error;
        }
    },

    unsavePost: async (postId: string, userId: string) => {
        // 乐观更新
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? { ...p, isSavedByMe: false, saveCount: Math.max(0, (p.saveCount || 1) - 1) }
                    : p
            ),
            currentPost: state.currentPost?.id === postId
                ? { ...state.currentPost, isSavedByMe: false, saveCount: Math.max(0, (state.currentPost.saveCount || 1) - 1) }
                : state.currentPost
        }));

        try {
            await communityPostRepository.unsavePost(postId, userId);
        } catch (error) {
            // 回滚
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId
                        ? { ...p, isSavedByMe: true, saveCount: (p.saveCount || 0) + 1 }
                        : p
                ),
                currentPost: state.currentPost?.id === postId
                    ? { ...state.currentPost, isSavedByMe: true, saveCount: (state.currentPost.saveCount || 0) + 1 }
                    : state.currentPost
            }));
            throw error;
        }
    },

    reset: () => {
        set({
            posts: [],
            isLoading: false,
            error: null,
            currentPost: null,
            currentPostComments: [],
            isLoadingDetail: false
        });
    }
}));
