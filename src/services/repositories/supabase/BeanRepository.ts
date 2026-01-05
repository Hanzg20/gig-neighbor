import { supabase } from '@/lib/supabaseClient';
import { BeanTransaction } from '@/types/domain';
import { IBeanRepository } from '../interfaces';

export class SupabaseBeanRepository implements IBeanRepository {
    async getBalance(userId: string): Promise<number> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('beans_balance')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data?.beans_balance || 0;
    }

    async getTransactions(userId: string): Promise<BeanTransaction[]> {
        const { data, error } = await supabase
            .from('bean_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapToDomain);
    }

    async addTransaction(transaction: Omit<BeanTransaction, 'id' | 'createdAt'>): Promise<BeanTransaction> {
        const { data, error } = await supabase
            .from('bean_transactions')
            .insert({
                user_id: transaction.userId,
                amount: transaction.amount,
                type: transaction.type,
                reason: transaction.descriptionZh, // Mapping reason to descriptionZh
                related_order_id: (transaction as any).relatedOrderId // Pass through extra fields
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapToDomain(data);
    }

    private mapToDomain(dbTx: any): BeanTransaction {
        return {
            id: dbTx.id,
            userId: dbTx.user_id,
            amount: dbTx.amount,
            type: dbTx.type as any,
            descriptionZh: dbTx.reason,
            createdAt: dbTx.created_at
        };
    }
}
