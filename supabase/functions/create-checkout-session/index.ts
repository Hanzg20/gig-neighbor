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
            listingItemId,
            phoneNumber,
            productName,
            price,
            currency = 'cad',
            masterId
        } = await req.json()

        // Validate required fields
        if (!listingItemId || !phoneNumber || !productName || !price) {
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

        console.log('[🔵 Checkout] Creating session for:', { listingItemId, phoneNumber, price, currency })

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: productName,
                            description: `Phone: ${phoneNumber}`,
                            metadata: {
                                listingItemId,
                                phoneNumber,
                                masterId,
                            },
                        },
                        unit_amount: price, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&item_id=${listingItemId}&from=scan`,
            cancel_url: `${origin}/scan/${masterId}?preselect=${listingItemId}&payment=cancelled`,
            metadata: {
                listingItemId,
                phoneNumber,
                masterId,
            },
            phone_number_collection: {
                enabled: false, // We already collected it
            },
            customer_email: undefined, // Optional: collect email if needed
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

    } catch (error) {
        console.error('[❌ Stripe] Error creating checkout session:', error)

        return new Response(
            JSON.stringify({
                error: error.message || 'Failed to create checkout session',
                details: error.toString()
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
}, { verify: false })
