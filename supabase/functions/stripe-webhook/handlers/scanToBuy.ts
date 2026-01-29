// handlers/scanToBuy.ts
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@11.16.0?target=deno'
import { sendSMS } from '../../_shared/sms.ts'

export async function handleScanToBuy(
    session: Stripe.Checkout.Session,
    supabase: SupabaseClient,
    metadata: any
) {
    const {
        listingItemId: rawItemId,
        phoneNumber,
        buyerId,
        couponId,
        couponCode,
        couponDiscount,
        originalPrice
    } = metadata;
    const listingItemId = rawItemId?.trim();
    const DEMO_BUYER_ID = '99999999-9999-9999-9999-999999999999';
    const safeBuyerId = buyerId === DEMO_BUYER_ID ? null : buyerId;

    if (!listingItemId) {
        throw new Error('Missing listingItemId for SCAN_TO_BUY');
    }

    // 0. Idempotency Check
    const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', session.payment_intent as string)
        .maybeSingle();

    if (existingOrder) {
        console.log(`[⚠️ ScanToBuy] Order already exists. Skipping.`);
        return;
    }

    // 1. Prepare Data
    const generatedOrderId = crypto.randomUUID();
    const { data: itemDetails } = await supabase
        .from('listing_items')
        .select('master_id, listing_masters(provider_id)')
        .eq('id', listingItemId)
        .single();

    const providerId = (itemDetails?.listing_masters as any)?.provider_id;
    if (!providerId) throw new Error('Provider ID not found');

    // 2. Insert Order (COMPLETED)
    const orderSnapshot: any = {
        session_id: session.id,
        phone_number: phoneNumber,
    };

    // Add coupon info to snapshot if a coupon was used
    if (couponId) {
        orderSnapshot.coupon_id = couponId;
        orderSnapshot.coupon_code = couponCode;
        orderSnapshot.coupon_discount = couponDiscount;
        orderSnapshot.original_price = originalPrice;
    }

    const { error: insertError } = await supabase
        .from('orders')
        .insert({
            id: generatedOrderId,
            item_id: listingItemId,
            master_id: itemDetails?.master_id,
            provider_id: providerId,
            buyer_id: safeBuyerId,
            status: 'COMPLETED',
            payment_status: 'PAID',
            payment_intent_id: session.payment_intent as string,
            amount_base: originalPrice || session.amount_total || 0, // Use original price if available
            amount_total: session.amount_total || 0,
            currency: (session.currency || 'cad').toUpperCase(),
            actual_transaction_model: 'SCAN_TO_BUY',
            snapshot: orderSnapshot,
        });

    if (insertError) throw insertError;

    // 2.5. Record Coupon Redemption if a coupon was used
    if (couponId) {
        console.log(`[🎟️ ScanToBuy] Recording coupon redemption for coupon ${couponCode}`);

        const { error: redemptionError } = await supabase
            .from('coupon_redemptions')
            .insert({
                coupon_id: couponId,
                order_id: generatedOrderId,
                user_id: safeBuyerId,
                user_phone: phoneNumber,
                original_amount: (originalPrice || session.amount_total || 0) / 100, // Convert from cents to dollars
                discount_applied: (couponDiscount || 0) / 100, // Convert from cents to dollars
                final_amount: (session.amount_total || 0) / 100, // Convert from cents to dollars
                redemption_type: 'online',
                redeemed_at: new Date().toISOString()
            });

        if (redemptionError) {
            // Log the error but don't throw - we don't want to fail the order if coupon tracking fails
            console.error('[⚠️ ScanToBuy] Failed to record coupon redemption:', redemptionError);
            // Still record this in failed_fulfillments for manual review
            await supabase.from('failed_fulfillments').insert({
                order_id: generatedOrderId,
                error_message: `Coupon redemption tracking failed: ${redemptionError.message}`,
                retry_count: 0
            });
        } else {
            console.log(`[✅ ScanToBuy] Coupon redemption recorded for ${couponCode}`);
        }
    }

    // 3. Allocate Inventory (WITH ERROR HANDLING)
    // If this fails, we DON'T throw - customer already paid, we'll handle manually
    try {
        const { data: inventoryItems, error: rpcError } = await supabase.rpc('allocate_inventory_item', {
            p_listing_item_id: listingItemId,
            p_order_id: generatedOrderId,
            p_buyer_id: safeBuyerId
        });

        if (rpcError) throw rpcError;
        const inventoryItem = inventoryItems?.[0];
        if (!inventoryItem) throw new Error('No available inventory');

        // 4. Update Order with Inventory Details
        await supabase.from('orders').update({
            snapshot: {
                session_id: session.id,
                phone_number: phoneNumber,
                inventory_id: inventoryItem.o_id,
                serial_number: inventoryItem.o_serial_number,
                secret_code: inventoryItem.o_secret_code
            },
        }).eq('id', generatedOrderId);

        // 5. Send SMS (Only if allocation succeeded)
        if (phoneNumber && inventoryItem.o_serial_number) {
            console.log('[📄 ScanToBuy] Fetching template: purchase-success (en)');
            const { data: template } = await supabase
                .from('communication_templates')
                .select('content')
                .eq('slug', 'purchase-success')
                .eq('language', 'en')
                .maybeSingle();

            // Fallback to coded default if DB template is missing
            const templateContent = template?.content || `[JWD] Purchase Successful! Card: \${serialNumber}. PIN: \${secretCode}. Use this at the merchant terminal. Thanks for using JUSTWEDO.com!`;

            // Variable Injection
            const serialNumber = inventoryItem.o_serial_number;
            const secretCode = inventoryItem.o_secret_code || 'None';

            const message = templateContent
                .replace(/\${serialNumber}/g, serialNumber)
                .replace(/\${secretCode}/g, secretCode);

            await sendSMS({ phoneNumber, message: message });
        }

        console.log('[✅ ScanToBuy] Order fulfilled successfully');
    } catch (allocationError: any) {
        // CRITICAL: Log failure but DON'T throw (customer already paid)
        console.error('[❌ ScanToBuy] Inventory allocation failed:', allocationError.message);

        // Record in failed_fulfillments for manual intervention
        await supabase.from('failed_fulfillments').insert({
            order_id: generatedOrderId,
            error_message: allocationError.message || 'Unknown allocation error',
            retry_count: 0
        });

        console.log('[📝 ScanToBuy] Logged to failed_fulfillments table for manual review');

        // WARNING: We return SUCCESS to Stripe to prevent retry loop
        // Support team must manually fulfill this order
    }
}
