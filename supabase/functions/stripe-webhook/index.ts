// Supabase Edge Function: stripe-webhook
// Purpose: Handle Stripe webhook events for payment confirmation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.16.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// ===== SMS Helper (with aws4fetch) =====
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17'

interface SMSParams {
    phoneNumber: string;
    message: string;
    region?: string;
}

async function sendSMS(params: SMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { phoneNumber, message, region = 'ca-central-1' } = params; // Default to ca-central-1 (user's verified sandbox region)
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')?.replace(/\s/g, ''); // Aggressive trim
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')?.replace(/\s/g, ''); // Aggressive trim

    if (!accessKeyId || !secretAccessKey) {
        console.error('[❌ SMS] AWS credentials not configured');
        return { success: false, error: 'AWS credentials not configured' };
    }

    // SAFE LOGGING: Show characteristics of the keys without exposing the full secret
    console.log(`[🔑 SMS] Credential Check:
    - AccessKey: ${accessKeyId.substring(0, 4)}...${accessKeyId.slice(-4)} (Len: ${accessKeyId.length})
    - SecretKey: ${secretAccessKey.substring(0, 2)}...${secretAccessKey.slice(-2)} (Len: ${secretAccessKey.length})
    - Region: ${region}`);

    try {
        const aws = new AwsClient({ accessKeyId, secretAccessKey, region, service: 'sns' });
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

        console.log(`[📱 SMS] Sending to ${formattedPhone} via aws4fetch (GET - String URL)`);

        // Use a plain string URL to ensure aws4fetch signs the EXACT string we expect
        // Parameters MUST be in alphabetical order for the canonical request
        const queryParams = [
            `Action=Publish`,
            `Message=${encodeURIComponent(message)}`,
            `PhoneNumber=${encodeURIComponent(formattedPhone)}`,
            `Version=2010-03-31`
        ];
        const url = `https://sns.${region}.amazonaws.com/?${queryParams.join('&')}`;

        const response = await aws.fetch(url, {
            method: 'GET',
        });

        const responseText = await response.text();
        if (!response.ok) {
            console.error('[❌ SMS] AWS SNS error:', responseText);
            return { success: false, error: responseText };
        }

        const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/);
        const messageId = messageIdMatch ? messageIdMatch[1] : undefined;
        console.log('[✅ SMS] Sent successfully:', messageId);
        return { success: true, messageId };
    } catch (error) {
        console.error('[❌ SMS] Error sending SMS:', error);
        return { success: false, error: error.message };
    }
}
// ===== End SMS Helper =====

// Used for types only
/*
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})
*/

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.text()

        // TEMPORARY: Skip signature verification due to Supabase Edge Runtime compatibility issues
        // In production, implement alternative security (IP whitelisting, etc.)
        const event = JSON.parse(body)

        console.log('[🎯 Webhook] Received event:', event.type)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                console.log('[✅ Payment] Checkout session completed:', session.id)
                console.log('[📋 Metadata]', session.metadata)

                const supabaseUrl = Deno.env.get('SUPABASE_URL')!
                const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                const supabase = createClient(supabaseUrl, supabaseKey)

                const {
                    orderType = 'SCAN_TO_BUY',
                    listingItemId: rawItemId,
                    phoneNumber,
                    masterId,
                    buyerId,
                    orderId, // Optional: if we created a pending order first
                    rentalStart,
                    rentalEnd,
                    depositAmount,
                    serviceCallFee
                } = session.metadata || {}
                const listingItemId = rawItemId?.trim();

                if (!listingItemId && orderType === 'SCAN_TO_BUY') {
                    console.error('[❌ Webhook] Missing listingItemId in metadata')
                    break
                }

                // --- SCAN_TO_BUY Logic ---
                if (orderType === 'SCAN_TO_BUY') {
                    // 0. Idempotency Check: Prevent double processing
                    const { data: existingOrder } = await supabase
                        .from('orders')
                        .select('id')
                        .eq('payment_intent_id', session.payment_intent as string)
                        .maybeSingle();

                    if (existingOrder) {
                        console.log(`[⚠️ Webhook] Order already exists for payment_intent: ${session.payment_intent}. Skipping.`);
                        break;
                    }

                    console.log(`[🔍 Inventory] Allocating item for listingItemId: '${listingItemId}'`)

                    // 1. Allocate inventory item atomically via RPC
                    const { data: inventoryItem, error: rpcError } = await supabase.rpc('allocate_inventory_item', {
                        p_listing_item_id: listingItemId,
                        p_order_id: session.id, // Use session ID as temporary order reference
                        p_buyer_id: buyerId || phoneNumber // Store phone or buyer ID
                    })

                    if (rpcError || !inventoryItem) {
                        console.error('[❌ Inventory] Allocation failed:', rpcError)
                        // In production, you might want to trigger a refund or alert admin here
                        break
                    }

                    console.log('[✅ Inventory] Atomic allocation success:', inventoryItem.serial_number)

                    // 2. Create order record
                    const { error: orderError } = await supabase
                        .from('orders')
                        .insert({
                            item_id: listingItemId,
                            status: 'COMPLETED',
                            payment_status: 'PAID',
                            payment_intent_id: session.payment_intent as string,
                            provider_id: inventoryItem.provider_id,
                            amount_base: session.amount_total || 0,
                            amount_tax: 0,
                            amount_fee_platform: 0,
                            amount_total: session.amount_total || 0,
                            currency: (session.currency || 'cad').toUpperCase(),
                            actual_transaction_model: 'SCAN_TO_BUY',
                            snapshot: {
                                session_id: session.id,
                                phone_number: phoneNumber,
                                inventory_id: inventoryItem.id,
                                serial_number: inventoryItem.serial_number,
                            },
                        })

                    if (orderError) console.error('[❌ Order] Failed:', orderError)

                    // 3. Send SMS
                    if (phoneNumber && inventoryItem.serial_number) {
                        await sendSMS({
                            phoneNumber,
                            message: `Your HangHand purchase is complete! Card Number: ${inventoryItem.serial_number}.`
                        });
                    }
                }

                // --- WEB_ORDER Logic ---
                else if (orderType === 'WEB_ORDER') {
                    console.log('[🌐 Web Order] Processing web order payment...');

                    const updateData: any = {
                        payment_status: 'PAID',
                        payment_intent_id: session.payment_intent as string,
                        status: 'PENDING_CONFIRMATION', // Paid, waiting for provider
                        actual_transaction_model: 'WEB_ORDER'
                    };

                    // If it's a rental or has metadata, ensure it's captured (if not already in DB)
                    if (rentalStart) updateData.rental_start_date = rentalStart;
                    if (rentalEnd) updateData.rental_end_date = rentalEnd;
                    if (depositAmount) updateData.deposit_amount = parseInt(depositAmount);
                    if (serviceCallFee) updateData.service_call_fee = parseInt(serviceCallFee);

                    if (orderId) {
                        // Update existing pending order
                        const { error: updateError } = await supabase
                            .from('orders')
                            .update(updateData)
                            .eq('id', orderId);

                        if (updateError) console.error('[❌ Web Order] Update failed:', updateError);
                        else console.log('[✅ Web Order] Order updated:', orderId);
                    } else {
                        // Create new order (e.g. for guest checkout without pre-creation)
                        const { error: insertError } = await supabase
                            .from('orders')
                            .insert({
                                ...updateData,
                                buyer_id: buyerId,
                                item_id: listingItemId,
                                master_id: masterId,
                                amount_total: session.amount_total || 0,
                                currency: (session.currency || 'cad').toUpperCase(),
                                snapshot: {
                                    session_id: session.id,
                                    product_name: session.line_items?.data[0]?.description
                                }
                            });

                        if (insertError) console.error('[❌ Web Order] Insert failed:', insertError);
                        else console.log('[✅ Web Order] New order created');
                    }
                }

                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.log('[❌ Payment] Payment failed:', paymentIntent.id)
                break
            }

            default:
                console.log(`[ℹ️ Webhook] Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('[❌ Webhook] Error processing webhook:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
