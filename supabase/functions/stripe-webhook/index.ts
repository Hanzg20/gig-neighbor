// Supabase Edge Function: stripe-webhook
// Purpose: Main Event Router for Stripe Webhook events

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.16.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Import Handlers
import { handleScanToBuy } from './handlers/scanToBuy.ts'
import { handleWebOrder } from './handlers/webOrder.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const body = await req.text()
        const event = JSON.parse(body)

        console.log(`[🎯 Webhook] Event Received: ${event.type}`)

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const metadata = session.metadata || {}
                const orderType = metadata.orderType || 'SCAN_TO_BUY'

                console.log(`[✅ Payment] Session: ${session.id}, Type: ${orderType}`)

                if (orderType === 'SCAN_TO_BUY') {
                    await handleScanToBuy(session, supabase, metadata)
                }
                else if (orderType === 'WEB_ORDER') {
                    // Isolated path for Web Shopping development
                    try {
                        await handleWebOrder(session, supabase, metadata)
                    } catch (err) {
                        console.error('[❌ WebOrder] Isolated Handler Error:', err)
                        // Note: We catch here so WebOrder errors don't crash the whole webhook
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: unknown) {
        console.error('[❌ Webhook] Global Error:', error)
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: corsHeaders,
            status: 400
        })
    }
})
