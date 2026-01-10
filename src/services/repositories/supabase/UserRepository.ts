import { supabase } from '@/lib/supabase';
import { UserAddress } from '@/types/domain';
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
}
