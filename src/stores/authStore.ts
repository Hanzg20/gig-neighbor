import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/domain';
import { supabase, onAuthStateChange } from '@/lib/supabase';

interface AuthState {
    currentUser: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    refreshBalance: () => Promise<void>;
    initializeAuth: (forcedSession?: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            isLoading: true,

            login: (user: User) => {
                set({ currentUser: user, isLoading: false });
            },

            logout: async () => {
                // Sign out from Supabase
                try {
                    await supabase.auth.signOut();
                } catch (error) {
                    console.error('Error signing out from Supabase:', error);
                }

                set({ currentUser: null, isLoading: false });
            },

            updateUser: (updates: Partial<User>) => {
                const currentUser = get().currentUser;
                if (currentUser) {
                    set({ currentUser: { ...currentUser, ...updates } });
                }
            },

            refreshBalance: async () => {
                const currentUser = get().currentUser;
                if (!currentUser) return;

                try {
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('beans_balance')
                        .eq('id', currentUser.id)
                        .single();

                    if (!error && data) {
                        set({ currentUser: { ...currentUser, beansBalance: data.beans_balance } });
                    }
                } catch (error) {
                    console.error('Error refreshing balance:', error);
                }
            },

            initializeAuth: async (forcedSession?: any) => {
                set({ isLoading: true });

                try {
                    // Use forced session if provided, otherwise get from Supabase
                    const session = forcedSession || (await supabase.auth.getSession()).data.session;

                    if (session?.user) {
                        // Fetch user profile from database
                        const { data: profile, error } = await supabase
                            .from('user_profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (error) {
                            console.error('❌ Error fetching user profile:', error);
                            set({ currentUser: null, isLoading: false });
                            return;
                        }

                        // Map database profile to User type
                        const user: User = {
                            id: profile.id,
                            email: profile.email,
                            name: profile.name,
                            avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
                            phone: profile.phone,
                            bio: profile.bio,
                            settings: profile.settings,
                            roles: profile.roles || ['BUYER'],
                            permissions: profile.permissions || [],
                            joinedDate: profile.created_at,
                            beansBalance: profile.beans_balance || 0,
                            providerProfileId: profile.provider_profile_id,
                            isVerifiedProvider: !!profile.provider_profile_id,
                            nodeId: profile.node_id
                        };

                        set({ currentUser: user, isLoading: false });
                    } else {
                        set({ currentUser: null, isLoading: false });
                    }
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    set({ currentUser: null, isLoading: false });
                }
            },
        }),
        {
            name: 'justwedo-auth-storage',
            partialize: (state) => ({ currentUser: state.currentUser }), // Only persist user, not loading state
        }
    )
);

// Subscribe to Supabase auth state changes
onAuthStateChange(async (session) => {
    // Only logout if we definitely don't have a Supabase session AND we aren't in a Demo/Mock state
    // We check if the current user ID looks like a real UUID (Supabase style) or a demo ID (u1, p1)
    const store = useAuthStore.getState();
    const currentUserId = store.currentUser?.id;
    const isDemoUser = currentUserId === 'u1' || currentUserId === 'p1';

    if (session?.user) {
        if (!currentUserId || !isDemoUser) {
            await store.initializeAuth();
        }
    } else {
        if (currentUserId && !isDemoUser) {
            store.logout();
        }
    }
});

// Auto-initialize on app load
if (typeof window !== 'undefined') {
    useAuthStore.getState().initializeAuth();
}
