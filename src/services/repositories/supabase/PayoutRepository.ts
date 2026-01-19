import { supabase } from '@/lib/supabase';
import { IPayoutRepository, PayoutRequest } from '../interfaces';

export class SupabasePayoutRepository implements IPayoutRepository {
    async getRequests(providerId: string): Promise<PayoutRequest[]> {
        const { data, error } = await supabase
            .from('payout_requests')
            .select('*')
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async createRequest(request: Omit<PayoutRequest, 'id' | 'status' | 'createdAt'>): Promise<PayoutRequest> {
        const { data, error } = await supabase
            .from('payout_requests')
            .insert({
                provider_id: request.providerId,
                amount_cents: request.amountCents,
                currency: request.currency,
                method: request.method,
                details: request.details
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapFromDb(data);
    }

    async getProviderEarnings(providerId: string): Promise<{
        totalRevenue: number;
        availableBalance: number;
        pendingPayouts: number;
    }> {
        // 1. Get all completed orders for this provider
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('pricing')
            .eq('provider_id', providerId)
            .eq('status', 'COMPLETED');

        if (orderError) throw orderError;

        // Calculate total revenue (base amount provider earns)
        // Note: The logic here assumes pricing.baseAmount is the provider's share.
        const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.baseAmount?.amount || 0), 0);

        // 2. Get all payout requests
        const { data: payouts, error: payoutError } = await supabase
            .from('payout_requests')
            .select('amount_cents, status')
            .eq('provider_id', providerId);

        if (payoutError) throw payoutError;

        const paidOut = payouts
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + p.amount_cents, 0);

        const pendingPayouts = payouts
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + p.amount_cents, 0);

        const availableBalance = totalRevenue - paidOut - pendingPayouts;

        return {
            totalRevenue,
            availableBalance,
            pendingPayouts
        };
    }

    private mapFromDb(row: any): PayoutRequest {
        return {
            id: row.id,
            providerId: row.provider_id,
            amountCents: row.amount_cents,
            currency: row.currency,
            status: row.status,
            method: row.method,
            details: row.details,
            createdAt: row.created_at
        };
    }
}
