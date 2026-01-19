import { create } from 'zustand';
import { ProviderProfile } from '@/types/domain';

interface ProviderState {
    providers: ProviderProfile[];
    setProviders: (providers: ProviderProfile[]) => void;
    getProviderById: (id: string) => ProviderProfile | undefined;
    upgradeToProvider: (userId: string, data: { identity: 'NEIGHBOR' | 'MERCHANT', nameZh: string, nameEn?: string, location: any }) => Promise<void>;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
    providers: [],
    setProviders: (providers) => set({ providers }),
    getProviderById: (id) => get().providers.find(p => p.id === id),

    upgradeToProvider: async (userId, data) => {
        // dynamic import to avoid circular dep if possible, or just standard import
        const { SupabaseProviderRepository } = await import('@/services/repositories/supabase/ProviderRepository');
        const { supabase } = await import('@/lib/supabase');
        const { useAuthStore } = await import('@/stores/authStore'); // Access auth store to update user

        const repo = new SupabaseProviderRepository();

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
            location: data.location
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
