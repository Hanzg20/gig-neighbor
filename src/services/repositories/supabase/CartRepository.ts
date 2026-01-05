import { supabase } from '@/lib/supabase';
import { CartItem } from '@/types/orders';
import { ICartRepository } from '../interfaces';

export class SupabaseCartRepository implements ICartRepository {
    async getItems(userId: string): Promise<CartItem[]> {
        const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (cartError) return [];

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, listing_items(*)')
            .eq('cart_id', cartData.id);

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            itemId: row.item_id,
            masterId: row.listing_items?.master_id || '',
            name: row.listing_items?.name_en || row.listing_items?.name_zh || '',
            price: {
                amount: row.listing_items?.price_amount || 0,
                currency: row.listing_items?.price_currency || 'CAD'
            },
            quantity: row.quantity,
            image: row.listing_items?.images?.[0]
        }));
    }

    async addItem(userId: string, itemId: string, masterId: string): Promise<CartItem> {
        // Ensure cart exists
        let { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (!cartData) {
            const { data: newCart, error: createError } = await supabase
                .from('carts')
                .insert({ user_id: userId })
                .select()
                .single();

            if (createError) throw createError;
            cartData = newCart;
        }

        const { data, error } = await supabase
            .from('cart_items')
            .insert({
                cart_id: cartData.id,
                item_id: itemId,
                quantity: 1
            })
            .select('*, listing_items(*)')
            .single();

        if (error) throw error;

        return {
            id: data.id,
            itemId: data.item_id,
            masterId: data.listing_items?.master_id || masterId,
            name: data.listing_items?.name_en || data.listing_items?.name_zh || '',
            price: {
                amount: data.listing_items?.price_amount || 0,
                currency: data.listing_items?.price_currency || 'CAD'
            },
            quantity: data.quantity,
            image: data.listing_items?.images?.[0]
        };
    }

    async removeItem(cartItemId: string): Promise<void> {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId);

        if (error) throw error;
    }

    async clearCart(userId: string): Promise<void> {
        const { data: cartData } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (cartData) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cartData.id);
        }
    }
}
