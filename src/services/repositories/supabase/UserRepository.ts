import { supabase } from '@/lib/supabase';
import { UserAddress } from '@/types/domain';
import { UserContribution, getUserLevel } from '@/types/community';
import { IUserRepository } from '../interfaces';

export class SupabaseUserRepository implements IUserRepository {
    async getAddresses(userId: string): Promise<UserAddress[]> {
        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapAddressToDomain);
    }

    async addAddress(address: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAddress> {
        const { data, error } = await supabase
            .from('user_addresses')
            .insert({
                user_id: address.userId,
                label: address.label,
                address_text: address.address.fullAddress,
                is_default: address.isDefault
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapAddressToDomain(data);
    }

    async updateAddress(id: string, data: Partial<UserAddress>): Promise<UserAddress> {
        const updateData: any = {};
        if (data.label) updateData.label = data.label;
        if (data.address?.fullAddress) updateData.address_text = data.address.fullAddress;
        if (data.isDefault !== undefined) updateData.is_default = data.isDefault;

        const { error } = await supabase
            .from('user_addresses')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

        const { data: updated, error: fetchError } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        return this.mapAddressToDomain(updated);
    }

    async deleteAddress(id: string): Promise<void> {
        const { error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    private mapAddressToDomain(dbAddr: any): UserAddress {
        return {
            id: dbAddr.id,
            userId: dbAddr.user_id,
            label: dbAddr.label,
            address: {
                fullAddress: dbAddr.address_text,
            },
            isDefault: dbAddr.is_default,
            createdAt: dbAddr.created_at,
            updatedAt: dbAddr.updated_at || dbAddr.created_at
        };
    }

    // ============================================
    // User Contribution & Level Methods
    // ============================================

    /**
     * Get user's contribution data
     */
    async getUserContribution(userId: string): Promise<UserContribution | null> {
        const { data, error } = await supabase
            .from('user_contributions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No record found - return default contribution
                return {
                    userId,
                    score: 0,
                    level: 1,
                    totalPosts: 0,
                    factPosts: 0,
                    totalComments: 0,
                    likesReceived: 0,
                    factVotesReceived: 0,
                    avgAgreeRate: 0,
                    votesGiven: 0,
                    updatedAt: new Date().toISOString()
                };
            }
            throw error;
        }

        return this.mapContributionToDomain(data);
    }

    /**
     * Get multiple users' contribution data (for batch operations)
     */
    async getUserContributions(userIds: string[]): Promise<Map<string, UserContribution>> {
        if (userIds.length === 0) return new Map();

        const { data, error } = await supabase
            .from('user_contributions')
            .select('*')
            .in('user_id', userIds);

        if (error) throw error;

        const result = new Map<string, UserContribution>();
        for (const record of data || []) {
            result.set(record.user_id, this.mapContributionToDomain(record));
        }

        // Fill in defaults for users without contribution records
        for (const userId of userIds) {
            if (!result.has(userId)) {
                result.set(userId, {
                    userId,
                    score: 0,
                    level: 1,
                    totalPosts: 0,
                    factPosts: 0,
                    totalComments: 0,
                    likesReceived: 0,
                    factVotesReceived: 0,
                    avgAgreeRate: 0,
                    votesGiven: 0,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        return result;
    }

    /**
     * Get top contributors (leaderboard)
     */
    async getTopContributors(limit: number = 10): Promise<UserContribution[]> {
        const { data, error } = await supabase
            .from('user_contributions')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []).map(this.mapContributionToDomain);
    }

    /**
     * Manually refresh a user's contribution score
     * This calls the database function to recalculate the score
     */
    async refreshUserContribution(userId: string): Promise<void> {
        const { error } = await supabase.rpc('refresh_user_contribution', {
            p_user_id: userId
        });

        if (error) {
            console.warn('Failed to refresh user contribution:', error);
            // Non-critical, don't throw
        }
    }

    private mapContributionToDomain(db: any): UserContribution {
        const userLevel = getUserLevel(db.score || 0);
        return {
            userId: db.user_id,
            score: db.score || 0,
            level: userLevel.level,
            totalPosts: db.total_posts || 0,
            factPosts: db.fact_posts || 0,
            totalComments: db.total_comments || 0,
            likesReceived: db.likes_received || 0,
            factVotesReceived: db.fact_votes_received || 0,
            avgAgreeRate: db.avg_agree_rate || 0,
            votesGiven: db.votes_given || 0,
            updatedAt: db.updated_at
        };
    }
}

// Export singleton instance
export const userRepository = new SupabaseUserRepository();
