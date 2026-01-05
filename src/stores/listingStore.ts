import { create } from 'zustand';
import { ListingMaster, ListingItem } from '@/types/domain';

interface ListingState {
    listings: ListingMaster[];
    listingItems: ListingItem[];
    setListings: (listings: ListingMaster[]) => void;
    setListingItems: (items: ListingItem[]) => void;
    addListing: (listing: ListingMaster, items: ListingItem[]) => void;
}

export const useListingStore = create<ListingState>((set) => ({
    listings: [],
    listingItems: [],
    setListings: (listings) => set({ listings }),
    setListingItems: (listingItems) => set({ listingItems }),
    addListing: (listing, items) => set((state) => ({
        listings: [listing, ...state.listings],
        listingItems: [...items, ...state.listingItems]
    })),
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
