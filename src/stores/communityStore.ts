import { create } from 'zustand';
import { ListingMaster, Review, ListingType } from '@/types/domain';
import { repositoryFactory } from '@/services/repositories/factory';

interface CommunityState {
    stories: Review[];
    communityListings: ListingMaster[];
    isLoading: boolean;
    error: string | null;

    fetchStories: (limit?: number) => Promise<void>;
    fetchCommunityFeed: (options: { type?: ListingType; nodeId?: string }) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
    stories: [],
    communityListings: [],
    isLoading: false,
    error: null,

    fetchStories: async (limit = 10) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getReviewRepository();
            const stories = await repo.getNeighborStories(limit);
            set({ stories, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch neighbor stories:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchCommunityFeed: async (options) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getListingRepository();
            // Community feed consists of TASKS and GOODS primarily
            const listings = await repo.search({
                type: options.type,
                nodeId: options.nodeId,
            });

            // Filter community types if no specific type is requested
            const COMMUNITY_TYPES: ListingType[] = ['TASK', 'GOODS', 'EVENT', 'FREE_GIVEAWAY', 'WANTED'];
            const communityListings = options.type
                ? listings
                : listings.filter(l => COMMUNITY_TYPES.includes(l.type));

            set({ communityListings, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch community feed:', error);
            set({ error: error.message, isLoading: false });
        }
    }
}));
