import { supabase } from '@/lib/supabase';
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
        const DEMO_BUYER_ID = '99999999-9999-9999-9999-999999999999';

        let query = supabase
            .from('orders')
            .select('*');

        if (userId === DEMO_BUYER_ID) {
            query = query.is('buyer_id', null);
        } else {
            query = query.eq('buyer_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

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
        // Special Handling for Demo Users: If the ID is the hardcoded demo UUID, 
        // we pass NULL to Supabase because it won't exist in the user_profiles table 
        // (unless properly seeded with auth.users). Subabase 'orders' table has 
        // buyer_id set to NULLABLE for guest support.
        const DEMO_BUYER_ID = '99999999-9999-9999-9999-999999999999';

        const dbOrder = {
            master_id: order.masterId,
            item_id: order.itemId,
            buyer_id: order.buyerId === DEMO_BUYER_ID ? null : order.buyerId,
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
            metadata: order.metadata || {},
            rental_start_date: order.rentalStartDate,
            rental_end_date: order.rentalEndDate,
            rental_days: order.rentalDays,
            deposit_amount: order.depositAmount || 0,
            deposit_status: order.depositStatus || 'NONE',
            service_call_fee: order.serviceCallFee || 0
        };

        const { data, error } = await supabase
            .from('orders')
            .insert(dbOrder)
            .select()
            .single();

        if (error) throw error;
        return this.mapToDomain(data);
    }

    async update(id: string, updates: Partial<Order>): Promise<Order> {
        const DEMO_BUYER_ID = '99999999-9999-9999-9999-999999999999';
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.metadata) dbUpdates.metadata = updates.metadata;
        if (updates.rentalStartDate) dbUpdates.rental_start_date = updates.rentalStartDate;
        if (updates.rentalEndDate) dbUpdates.rental_end_date = updates.rentalEndDate;
        if (updates.rentalDays !== undefined) dbUpdates.rental_days = updates.rentalDays;
        if (updates.depositAmount !== undefined) dbUpdates.deposit_amount = updates.depositAmount;
        if (updates.depositStatus) dbUpdates.deposit_status = updates.depositStatus;
        if (updates.serviceCallFee !== undefined) dbUpdates.service_call_fee = updates.serviceCallFee;

        if (updates.buyerId !== undefined) {
            dbUpdates.buyer_id = updates.buyerId === DEMO_BUYER_ID ? null : updates.buyerId;
        }

        if (updates.pricing) {
            dbUpdates.amount_base = updates.pricing.baseAmount.amount;
            dbUpdates.amount_total = updates.pricing.total.amount;
            if (updates.pricing.taxAmount) dbUpdates.amount_tax = updates.pricing.taxAmount.amount;
            if (updates.pricing.platformFee) dbUpdates.amount_fee_platform = updates.pricing.platformFee.amount;
            if (updates.pricing.serviceFee) dbUpdates.amount_fee_service = updates.pricing.serviceFee.amount;
        }

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

        const DEMO_BUYER_ID = '99999999-9999-9999-9999-999999999999';

        return {
            id: dbOrder.id,
            masterId: dbOrder.master_id,
            itemId: dbOrder.item_id,
            buyerId: dbOrder.buyer_id === null ? DEMO_BUYER_ID : dbOrder.buyer_id,
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
            rentalStartDate: dbOrder.rental_start_date,
            rentalEndDate: dbOrder.rental_end_date,
            rentalDays: dbOrder.rental_days,
            depositAmount: dbOrder.deposit_amount,
            depositStatus: dbOrder.deposit_status,
            serviceCallFee: dbOrder.service_call_fee,
            createdAt: dbOrder.created_at,
            updatedAt: dbOrder.updated_at
        };
    }

    subscribeToUserOrders(userId: string, callback: (order: Order) => void): () => void {
        const channel = supabase
            .channel(`user-orders:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `buyer_id=eq.${userId}`
                },
                (payload) => {
                    callback(this.mapToDomain(payload.new));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `provider_id=eq.${userId}`
                },
                (payload) => {
                    callback(this.mapToDomain(payload.new));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}
