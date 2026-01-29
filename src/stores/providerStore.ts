import { create } from 'zustand';
import { ProviderProfile } from '@/types/domain';

interface ProviderState {
    providers: ProviderProfile[];
    setProviders: (providers: ProviderProfile[]) => void;
    getProviderById: (id: string) => ProviderProfile | undefined;
    fetchProviderProfile: (id: string) => Promise<ProviderProfile | null>;
    updateProviderProfile: (id: string, data: Partial<ProviderProfile>) => Promise<void>;
    upgradeToProvider: (userId: string, data: { identity: 'NEIGHBOR' | 'MERCHANT', nameZh: string, nameEn?: string, location: any }) => Promise<void>;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
    providers: [],
    setProviders: (providers) => set({ providers }),
    getProviderById: (id) => get().providers.find(p => p.id === id),

    fetchProviderProfile: async (id) => {
        const { repositoryFactory } = await import('@/services/repositories/factory');
        const repo = repositoryFactory.getProviderRepository();
        const profile = await repo.getById(id);
        if (profile) {
            set(state => ({
                providers: [...state.providers.filter(p => p.id !== id), profile]
            }));
        }
        return profile;
    },

    updateProviderProfile: async (id, data) => {
        const { repositoryFactory } = await import('@/services/repositories/factory');
        const repo = repositoryFactory.getProviderRepository();
        const updated = await repo.update(id, data);
        set(state => ({
            providers: state.providers.map(p => p.id === id ? updated : p)
        }));

        // Update user profile if the current user is this provider
        const { useAuthStore } = await import('@/stores/authStore');
        const authStore = useAuthStore.getState();
        if (authStore.currentUser?.providerProfileId === id) {
            // We don't have a specific way to refresh user profile from here easily without re-fetching
            // but we can assume the UI reflects the providerStore state
        }
    },

    upgradeToProvider: async (userId, data) => {
        const { repositoryFactory } = await import('@/services/repositories/factory');
        const { supabase } = await import('@/lib/supabase');
        const { useAuthStore } = await import('@/stores/authStore');

        const repo = repositoryFactory.getProviderRepository();

        // 1. Create Provider Profile
        const newProvider = await repo.create({
            userId,
            identity: data.identity,
            businessNameZh: data.nameZh,
            businessNameEn: data.nameEn,
            isVerified: false, // Pending verification
            verificationLevel: 1,
            badges: [],
            stats: { totalOrders: 0, totalIncome: 0, averageRating: 0, reviewCount: 0 },
            location: data.location,
            isActive: true
        });

        // 2. Update User Profile (Add Role)
        const { error: userError } = await supabase
            .from('user_profiles')
            .update({
                provider_profile_id: newProvider.id,
                roles: ['BUYER', 'PROVIDER'] // Append provider role
            })
            .eq('id', userId);

        if (userError) throw userError;

        // 3. Update Local Auth State
        const authStore = useAuthStore.getState();
        if (authStore.currentUser) {
            authStore.updateUser({
                roles: ['BUYER', 'PROVIDER'],
                providerProfileId: newProvider.id,
                isVerifiedProvider: true
            });
        }
    }
}));
