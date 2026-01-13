import { create } from 'zustand';
import { ListingMaster, ListingItem, ListingType } from '@/types/domain';

interface ListingState {
    listings: ListingMaster[];
    listingItems: ListingItem[];
    isLoading: boolean;
    error: string | null;
    setListings: (listings: ListingMaster[]) => void;
    setListingItems: (items: ListingItem[]) => void;
    addListing: (listing: ListingMaster, items: ListingItem[]) => void;
    fetchListings: () => Promise<void>;
    searchListings: (options: { query?: string, isSemantic?: boolean, nodeId?: string, categoryId?: string, type?: ListingType }) => Promise<void>;
}

import { repositoryFactory } from '@/services/repositories/factory';

export const useListingStore = create<ListingState>((set) => ({
    listings: [],
    listingItems: [],
    isLoading: false,
    error: null,
    setListings: (listings) => set({ listings }),
    setListingItems: (listingItems) => set({ listingItems }),
    addListing: (listing, items) => set((state) => ({
        listings: [listing, ...state.listings],
        listingItems: [...items, ...state.listingItems]
    })),
    fetchListings: async () => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getListingRepository();
            const listings = await repo.getAll();
            set({ listings, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },
    searchListings: async (options) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getListingRepository();
            const listings = await repo.search(options);
            set({ listings, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },
}));

// Translation Helpers (Meituan Essence: Efficient & Direct)
export const getTranslation = (obj: any, fieldBase: string, lang: 'En' | 'Zh' = 'En') => {
    if (!obj) return '';
    const prioritized = lang === 'En' ? [`${fieldBase}En`, `${fieldBase}Zh`] : [`${fieldBase}Zh`, `${fieldBase}En`];
    return obj[prioritized[0]] || obj[prioritized[1]] || obj[fieldBase] || '';
};

export const formatMoney = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: currency,
    }).format(amount / 100);
};
