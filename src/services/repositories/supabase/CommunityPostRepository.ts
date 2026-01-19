import { supabase } from '@/lib/supabase';
import {
    CommunityPost,
    CommunityComment,
    CommunityPostType,
    CreateCommunityPostInput,
    UpdateCommunityPostInput,
    CreateCommentInput
} from '@/types/community';

/**
 * Supabase Repository for Community Posts
 */
export class SupabaseCommunityPostRepository {

    // ==========================================
    // POSTS
    // ==========================================

    private mapPostFromDb(row: any): CommunityPost {
        return {
            id: row.id,
            authorId: row.author_id,
            postType: row.post_type as CommunityPostType,
            title: row.title,
            content: row.content,
            images: row.images || [],
            mediaUrl: row.media_url,
            priceHint: row.price_hint,
            priceNegotiable: row.price_negotiable,
            locationText: row.location_text,
            nodeId: row.node_id,
            tags: row.tags || [],
            likeCount: row.like_count || 0,
            commentCount: row.comment_count || 0,
            viewCount: row.view_count || 0,
            status: row.status,
            isPinned: row.is_pinned,
            isResolved: row.is_resolved,
            author: row.author ? {
                id: row.author.id,
                name: row.author.name,
                avatar: row.author.avatar
            } : undefined,
            isLikedByMe: row.is_liked_by_me || false,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    private mapPostToDb(input: CreateCommunityPostInput | UpdateCommunityPostInput): any {
        const dbRow: any = {};

        if ('postType' in input && input.postType) dbRow.post_type = input.postType;
        if (input.title !== undefined) dbRow.title = input.title;
        if ('content' in input && input.content) dbRow.content = input.content;
        if (input.images !== undefined) dbRow.images = input.images;
        if (input.mediaUrl !== undefined) dbRow.media_url = input.mediaUrl;
        if (input.priceHint !== undefined) dbRow.price_hint = input.priceHint;
        if (input.priceNegotiable !== undefined) dbRow.price_negotiable = input.priceNegotiable;
        if (input.locationText !== undefined) dbRow.location_text = input.locationText;
        if ('nodeId' in input && input.nodeId) dbRow.node_id = input.nodeId;
        if (input.tags !== undefined) dbRow.tags = input.tags;
        if ('status' in input && input.status) dbRow.status = input.status;
        if ('isResolved' in input && input.isResolved !== undefined) dbRow.is_resolved = input.isResolved;

        return dbRow;
    }

    async getFeed(options: {
        nodeId?: string;
        postType?: CommunityPostType;
        query?: string;
        scope?: 'nearby' | 'city';
        limit?: number;
        offset?: number;
    } = {}): Promise<CommunityPost[]> {
        let query = supabase
            .from('community_posts')
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .in('status', ['ACTIVE', 'RESOLVED'])
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (options.nodeId) query = query.eq('node_id', options.nodeId);

        // Handle "Nearby" vs "City" scope via radius filtering (simplified for now)
        if (options.scope === 'nearby' && options.nodeId) {
            // Future: Implement PostGIS st_dwithin check here
            // For now, it stays at the node_id level as a strict 'nearby' definition
            query = query.eq('node_id', options.nodeId);
        }

        if (options.postType && options.postType !== 'LATEST') {
            query = query.eq('post_type', options.postType);
        }

        if (options.query) {
            query = query.or(`title.ilike.%${options.query}%,content.ilike.%${options.query}%`);
        }
        if (options.limit) query = query.limit(options.limit);
        if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(row => this.mapPostFromDb(row));
    }

    async getById(id: string): Promise<CommunityPost | null> {
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapPostFromDb(data);
    }

    async getByAuthor(authorId: string): Promise<CommunityPost[]> {
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .eq('author_id', authorId)
            .neq('status', 'DELETED')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.mapPostFromDb(row));
    }

    async create(authorId: string, input: CreateCommunityPostInput): Promise<CommunityPost> {
        const dbRow = this.mapPostToDb(input);
        dbRow.author_id = authorId;

        const { data, error } = await supabase
            .from('community_posts')
            .insert(dbRow)
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .single();

        if (error) throw error;
        return this.mapPostFromDb(data);
    }

    async update(id: string, input: UpdateCommunityPostInput): Promise<CommunityPost> {
        const dbRow = this.mapPostToDb(input);

        const { data, error } = await supabase
            .from('community_posts')
            .update(dbRow)
            .eq('id', id)
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .single();

        if (error) throw error;
        return this.mapPostFromDb(data);
    }

    async delete(id: string): Promise<void> {
        // Soft delete by setting status to DELETED
        const { error } = await supabase
            .from('community_posts')
            .update({ status: 'DELETED' })
            .eq('id', id);

        if (error) throw error;
    }

    async hardDelete(id: string): Promise<void> {
        const { error } = await supabase
            .from('community_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async incrementViewCount(id: string): Promise<void> {
        const { error } = await supabase.rpc('increment_post_view_count', { post_id: id });
        if (error) {
            // Fallback if RPC doesn't exist
            console.warn('View count increment failed:', error);
        }
    }

    // ==========================================
    // LIKES
    // ==========================================

    async likePost(postId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('community_post_likes')
            .insert({ post_id: postId, user_id: userId });

        if (error && !error.message.includes('duplicate')) throw error;
    }

    async unlikePost(postId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('community_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async isLikedByUser(postId: string, userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        return !!data && !error;
    }

    async getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
        if (postIds.length === 0) return new Set();

        const { data, error } = await supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('user_id', userId)
            .in('post_id', postIds);

        if (error) return new Set();
        return new Set((data || []).map(row => row.post_id));
    }

    // ==========================================
    // COMMENTS
    // ==========================================

    private mapCommentFromDb(row: any): CommunityComment {
        return {
            id: row.id,
            postId: row.post_id,
            authorId: row.author_id,
            content: row.content,
            parentCommentId: row.parent_comment_id,
            likeCount: row.like_count || 0,
            author: row.author ? {
                id: row.author.id,
                name: row.author.name,
                avatar: row.author.avatar
            } : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async getComments(postId: string): Promise<CommunityComment[]> {
        const { data, error } = await supabase
            .from('community_comments')
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []).map(row => this.mapCommentFromDb(row));
    }

    async createComment(authorId: string, input: CreateCommentInput): Promise<CommunityComment> {
        const { data, error } = await supabase
            .from('community_comments')
            .insert({
                post_id: input.postId,
                author_id: authorId,
                content: input.content,
                parent_comment_id: input.parentCommentId
            })
            .select(`
                *,
                author:user_profiles!author_id (id, name, avatar)
            `)
            .single();

        if (error) throw error;
        return this.mapCommentFromDb(data);
    }

    async deleteComment(id: string): Promise<void> {
        const { error } = await supabase
            .from('community_comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ==========================================
    // POST-TO-SERVICE CONVERSION
    // ==========================================

    async convertToListing(postId: string, listingId: string): Promise<void> {
        const { error } = await supabase
            .from('community_post_conversions')
            .insert({
                post_id: postId,
                listing_id: listingId
            });

        if (error) throw error;

        // Mark post as resolved
        await this.update(postId, { status: 'RESOLVED', isResolved: true });
    }

    async getConvertedListingId(postId: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('community_post_conversions')
            .select('listing_id')
            .eq('post_id', postId)
            .single();

        if (error) return null;
        return data?.listing_id;
    }
}

// Export singleton instance
export const communityPostRepository = new SupabaseCommunityPostRepository();
