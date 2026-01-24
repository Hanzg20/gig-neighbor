// handlers/webOrder.ts
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@11.16.0?target=deno'

export async function handleWebOrder(
    session: Stripe.Checkout.Session,
    supabase: SupabaseClient,
    metadata: any
) {
    console.log('[🌐 WebOrder] Processing web order payment...');

    const {
        orderId,
        listingItemId,
        masterId,
        buyerId,
        rentalStart,
        rentalEnd,
        rentalDays,
        depositAmount,
        serviceCallFee
    } = metadata;

    const DEMO_BUYER_ID = '99999999-9999-9999-9999-999999999999';
    const safeBuyerId = buyerId === DEMO_BUYER_ID ? null : buyerId;

    const updateData: any = {
        payment_status: 'PAID',
        payment_intent_id: session.payment_intent as string,
        status: 'PENDING_CONFIRMATION',
        actual_transaction_model: 'WEB_ORDER'
    };

    if (rentalStart) updateData.rental_start_date = rentalStart;
    if (rentalEnd) updateData.rental_end_date = rentalEnd;
    if (rentalDays) updateData.rental_days = parseInt(rentalDays);
    if (depositAmount) updateData.deposit_amount = parseInt(depositAmount);
    if (serviceCallFee) updateData.service_call_fee = parseInt(serviceCallFee);

    if (orderId) {
        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) throw error;
        console.log('[✅ WebOrder] Existing order updated:', orderId);
    } else {
        const { error } = await supabase
            .from('orders')
            .insert({
                ...updateData,
                buyer_id: safeBuyerId,
                item_id: listingItemId,
                master_id: masterId,
                amount_total: session.amount_total || 0,
                currency: (session.currency || 'cad').toUpperCase(),
                snapshot: {
                    session_id: session.id,
                    product_name: session.line_items?.data[0]?.description
                }
            });

        if (error) throw error;
        console.log('[✅ WebOrder] New web order created');
    }
}
