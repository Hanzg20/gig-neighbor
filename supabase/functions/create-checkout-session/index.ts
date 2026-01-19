// Supabase Edge Function: create-checkout-session
// Purpose: Create a Stripe Checkout Session for Scan-to-Buy flow

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Parse request body
        const {
            orderType = 'SCAN_TO_BUY', // 'SCAN_TO_BUY' or 'WEB_ORDER'
            orderId, // explicitly extract orderId from root
            listingItemId,
            masterId,
            buyerId,
            phoneNumber,
            productName,
            price, // in cents
            currency = 'cad',
            metadata = {}
        } = await req.json()

        // Validate required fields
        if ((!listingItemId && orderType === 'SCAN_TO_BUY') || !productName || !price) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Get the origin for success/cancel URLs
        const origin = req.headers.get('origin') || 'http://localhost:8080'

        console.log(`[🔵 Checkout] Creating ${orderType} session for:`, { listingItemId, price, orderType, orderId })

        // Consolidate metadata
        const stripeMetadata = {
            orderType,
            listingItemId,
            masterId,
            buyerId,
            phoneNumber,
            orderId: orderId || metadata.orderId, // use root-level orderId preferentially
            ...metadata // Spread additional fields like rentalStart, rentalEnd, rentalDays
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: productName,
                            description: orderType === 'SCAN_TO_BUY' ? `Phone: ${phoneNumber}` : `Order type: ${orderType}`,
                        },
                        unit_amount: price, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: orderType === 'SCAN_TO_BUY'
                ? `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&item_id=${listingItemId}&from=scan`
                : `${origin}/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: orderType === 'SCAN_TO_BUY'
                ? `${origin}/scan/${masterId}?preselect=${listingItemId}&payment=cancelled`
                : `${origin}/checkout?payment=cancelled`,
            metadata: stripeMetadata,
        })

        console.log('[✅ Stripe] Checkout session created:', session.id)

        return new Response(
            JSON.stringify({
                url: session.url,
                sessionId: session.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: unknown) {
        console.error('[❌ Stripe] Error creating checkout session:', error)

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to create checkout session',
                details: String(error)
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
