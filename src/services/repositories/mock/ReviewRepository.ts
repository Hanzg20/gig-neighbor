import { IReviewRepository } from '../interfaces';
import { Review, ReviewReaction, ReviewReply } from '@/types/domain';

/**
 * Mock implementation of IReviewRepository
 * Used for development when VITE_USE_MOCK_DATA=true
 */
export class MockReviewRepository implements IReviewRepository {
    private reviews: Review[] = [
        {
            id: 'r1',
            orderId: 'o1',
            listingId: '40c3d4e5-6f7a-5b8c-9d0e-1f2a3b4c5d6e', // Cleaning
            buyerId: 'u1',
            providerId: 'p1',
            buyerName: 'Han Z.',
            buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Han',
            rating: 5,
            ratingDimensions: { Quality: 5, Communication: 4, Value: 5 },
            content: "Wang did an incredible job cleaning my house after the renovation. Very professional and friendly!",
            media: ['https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=400'],
            isNeighborStory: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            reactions: [
                { id: 'rc1', reviewId: 'r1', userId: 'u2', type: 'HELPFUL' }
            ],
            replies: [
                { id: 'rep1', reviewId: 'r1', providerId: 'p1', content: "Thank you Han! Happy to help anytime.", createdAt: new Date().toISOString() }
            ]
        }
    ];

    async getByListing(listingId: string): Promise<Review[]> {
        return this.reviews.filter(r => r.listingId === listingId);
    }

    async submitReview(review: Omit<Review, "id" | "createdAt" | "updatedAt" | "replies" | "reactions" | "buyerName" | "buyerAvatar">): Promise<Review> {
        const newReview: Review = {
            ...review,
            id: `r${this.reviews.length + 1}`,
            buyerName: 'Demo User',
            buyerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.buyerId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            replies: [],
            reactions: []
        };
        this.reviews.push(newReview);
        return newReview;
    }

    async addReaction(reviewId: string, userId: string, type: ReviewReaction["type"]): Promise<ReviewReaction> {
        const review = this.reviews.find(r => r.id === reviewId);
        const reaction: ReviewReaction = {
            id: `rc${Math.random()}`,
            reviewId,
            userId,
            type
        };
        if (review) {
            if (!review.reactions) review.reactions = [];
            review.reactions.push(reaction);
        }
        return reaction;
    }

    async removeReaction(reviewId: string, userId: string, type: ReviewReaction["type"]): Promise<void> {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review && review.reactions) {
            review.reactions = review.reactions.filter(r => !(r.userId === userId && r.type === type));
        }
    }

    async submitReply(reviewId: string, providerId: string, content: string): Promise<ReviewReply> {
        const reply: ReviewReply = {
            id: `rep${Math.random()}`,
            reviewId,
            providerId,
            content,
            createdAt: new Date().toISOString()
        };
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            if (!review.replies) review.replies = [];
            review.replies.push(reply);
        }
        return reply;
    }
}
