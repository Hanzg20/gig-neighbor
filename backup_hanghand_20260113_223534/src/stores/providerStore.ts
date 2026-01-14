import { create } from 'zustand';
import { ProviderProfile } from '@/types/domain';

interface ProviderState {
    providers: ProviderProfile[];
    setProviders: (providers: ProviderProfile[]) => void;
    getProviderById: (id: string) => ProviderProfile | undefined;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
    providers: [],
    setProviders: (providers) => set({ providers }),
    getProviderById: (id) => get().providers.find(p => p.id === id),
}));
