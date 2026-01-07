import { supabase } from '@/lib/supabase';
import { Review, ReviewReaction, ReviewReply } from '@/types/domain';
import { IReviewRepository } from '../interfaces';

export class SupabaseReviewRepository implements IReviewRepository {
    private mapFromDb(row: any): Review {
        return {
            id: row.id,
            listingId: row.listing_id,
            orderId: row.order_id,
            buyerId: row.buyer_id,
            providerId: row.provider_id,
            buyerName: row.user_profiles?.name || 'Neighbor',
            buyerAvatar: row.user_profiles?.avatar,
            rating: Number(row.rating),
            ratingDimensions: row.rating_dimensions || {},
            content: row.content,
            media: row.media || [],
            isNeighborStory: row.is_neighbor_story,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            replies: row.review_replies?.map((r: any) => ({
                id: r.id,
                reviewId: r.review_id,
                providerId: r.provider_id,
                content: r.content,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            })) || [],
            reactions: row.review_reactions?.map((rc: any) => ({
                id: rc.id,
                reviewId: rc.review_id,
                userId: rc.user_id,
                type: rc.reaction_type as any
            })) || []
        };
    }

    async getByListing(listingId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user_profiles!buyer_id (name, avatar),
                review_replies (*),
                review_reactions (*)
            `)
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async submitReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'buyerName' | 'buyerAvatar'>): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                order_id: review.orderId,
                listing_id: review.listingId,
                buyer_id: review.buyerId,
                provider_id: review.providerId,
                rating: review.rating,
                rating_dimensions: review.ratingDimensions,
                content: review.content,
                media: review.media,
                is_neighbor_story: review.isNeighborStory
            })
            .select(`
                *,
                user_profiles!buyer_id (name, avatar)
            `)
            .single();

        if (error) throw error;
        return this.mapFromDb(data);
    }

    async addReaction(reviewId: string, userId: string, type: ReviewReaction['type']): Promise<ReviewReaction> {
        const { data, error } = await supabase
            .from('review_reactions')
            .insert({
                review_id: reviewId,
                user_id: userId,
                reaction_type: type
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            reviewId: data.review_id,
            userId: data.user_id,
            type: data.reaction_type as any
        };
    }

    async removeReaction(reviewId: string, userId: string, type: ReviewReaction['type']): Promise<void> {
        const { error } = await supabase
            .from('review_reactions')
            .delete()
            .eq('review_id', reviewId)
            .eq('user_id', userId)
            .eq('reaction_type', type);

        if (error) throw error;
    }

    async submitReply(reviewId: string, providerId: string, content: string): Promise<ReviewReply> {
        const { data, error } = await supabase
            .from('review_replies')
            .insert({
                review_id: reviewId,
                provider_id: providerId,
                content: content
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            reviewId: data.review_id,
            providerId: data.provider_id,
            content: data.content,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }
}
