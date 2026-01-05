import { supabase } from '@/lib/supabaseClient';
import { Order, OrderStatus } from '@/types/orders';
import { IOrderRepository } from '../interfaces';

export class SupabaseOrderRepository implements IOrderRepository {
    async getAll(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                provider_profiles (
                    user_id
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Order Fetch Error:', error);
            throw error;
        }

        console.log('UseOrderStore Raw Data:', data); // DEBUG: Check if provider_profiles is populated
        return (data || []).map(this.mapToDomain);
    }

    async getById(id: string): Promise<Order | null> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return this.mapToDomain(data);
    }

    async getByUser(userId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapToDomain);
    }

    async getByProvider(providerId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapToDomain);
    }

    async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
        const dbOrder = {
            master_id: order.masterId,
            item_id: order.itemId,
            buyer_id: order.buyerId,
            provider_id: order.providerId,
            status: order.status,
            amount_base: order.pricing.baseAmount.amount,
            amount_tax: order.pricing.taxAmount?.amount || 0,
            amount_fee_platform: order.pricing.platformFee.amount,
            amount_fee_service: order.pricing.serviceFee?.amount || 0,
            amount_total: order.pricing.total.amount,
            currency: order.currency,
            snapshot: order.snapshot,
            payment_status: order.paymentStatus,
            actual_transaction_model: order.snapshot.itemPricing.model, // Based on snapshot
            metadata: order.metadata || {}
        };

        const { data, error } = await supabase
            .from('orders')
            .insert(dbOrder)
            .select()
            .single();

        if (error) throw error;
        return this.mapToDomain(data);
    }

    async update(id: string, updates: Partial<Pick<Order, 'status' | 'metadata' | 'paymentStatus'>>): Promise<Order> {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.metadata) dbUpdates.metadata = updates.metadata;

        const { data, error } = await supabase
            .from('orders')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapToDomain(data);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        return this.update(id, { status });
    }

    private mapToDomain(dbOrder: any): Order {
        const formatMoney = (amount: number, currency: string) => {
            return `${currency === 'CAD' ? '$' : currency} ${(amount / 100).toFixed(2)}`;
        };

        return {
            id: dbOrder.id,
            masterId: dbOrder.master_id,
            itemId: dbOrder.item_id,
            buyerId: dbOrder.buyer_id,
            providerId: dbOrder.provider_id,
            providerUserId: (Array.isArray(dbOrder.provider_profiles)
                ? dbOrder.provider_profiles[0]?.user_id
                : dbOrder.provider_profiles?.user_id) || dbOrder.provider_id,
            status: dbOrder.status as OrderStatus,
            paymentStatus: dbOrder.payment_status,
            currency: dbOrder.currency,
            pricing: {
                baseAmount: {
                    amount: dbOrder.amount_base,
                    currency: dbOrder.currency,
                    formatted: formatMoney(dbOrder.amount_base, dbOrder.currency)
                },
                taxAmount: {
                    amount: dbOrder.amount_tax,
                    currency: dbOrder.currency,
                    formatted: formatMoney(dbOrder.amount_tax, dbOrder.currency)
                },
                platformFee: {
                    amount: dbOrder.amount_fee_platform,
                    currency: dbOrder.currency,
                    formatted: formatMoney(dbOrder.amount_fee_platform, dbOrder.currency)
                },
                serviceFee: {
                    amount: dbOrder.amount_fee_service,
                    currency: dbOrder.currency,
                    formatted: formatMoney(dbOrder.amount_fee_service, dbOrder.currency)
                },
                total: {
                    amount: dbOrder.amount_total,
                    currency: dbOrder.currency,
                    formatted: formatMoney(dbOrder.amount_total, dbOrder.currency)
                }
            },
            snapshot: dbOrder.snapshot,
            paymentIntentId: dbOrder.payment_intent_id,
            metadata: dbOrder.metadata,
            createdAt: dbOrder.created_at,
            updatedAt: dbOrder.updated_at
        };
    }
}
