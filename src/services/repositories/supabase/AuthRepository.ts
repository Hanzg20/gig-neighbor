import { supabase } from '@/lib/supabase';
import { IAuthRepository } from '../interfaces';
import { User } from '@/types/domain';

export class SupabaseAuthRepository implements IAuthRepository {
    async login(email: string, password: string): Promise<User | null> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            return null;
        }

        if (!data.user) return null;

        // Fetch user profile
        return this.getUserProfile(data.user.id);
    }

    async signInWithOtp(email: string): Promise<void> {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });
        if (error) throw error;
    }

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        return this.getUserProfile(user.id);
    }

    async register(email: string, password: string, name: string, nodeId?: string): Promise<User | null> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    node_id: nodeId
                }
            }
        });

        if (error) {
            console.error('Registration error:', error);
            return null;
        }

        if (!data.user) return null;

        // Create user profile
        const profile = await this.createUserProfile(data.user.id, email, name, nodeId);
        return profile;
    }

    private async getUserProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select(`
        *,
        user_roles (
          role:roles (
            role_name
          )
        )
      `)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        if (!data) return null;

        // Map roles
        const roles = data.user_roles?.map((ur: any) => ur.role.role_name) || ['BUYER'];

        return {
            id: data.user_id,
            email: data.email,
            name: data.display_name || data.email,
            avatar: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            roles,
            permissions: [], // TODO: Fetch from role_permissions
            joinedDate: data.created_at,
            beansBalance: data.beans_balance || 0,
            nodeId: data.node_id,
            isVerifiedProvider: roles.includes('PROVIDER'),
            providerProfileId: data.provider_profile_id,
        };
    }

    private async createUserProfile(userId: string, email: string, name: string, nodeId?: string): Promise<User> {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert({
                user_id: userId,
                email,
                display_name: name,
                node_id: nodeId,
                beans_balance: 100 // Welcome bonus
            })
            .select()
            .single();

        if (error) throw error;

        // Assign default BUYER role
        await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: 1 // Assuming BUYER role has id 1
            });

        return {
            id: userId,
            email,
            name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            roles: ['BUYER'],
            permissions: ['VIEW_LISTINGS', 'POST_REVIEW'],
            joinedDate: data.created_at,
            beansBalance: 100,
            nodeId,
            isVerifiedProvider: false,
        };
    }
}
