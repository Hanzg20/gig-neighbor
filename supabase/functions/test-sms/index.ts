// Test SMS Function - For testing SMS without Stripe webhook
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { sendSMS } from '../_shared/sms.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { phoneNumber } = await req.json()

        if (!phoneNumber) {
            return new Response(
                JSON.stringify({ error: 'Phone number required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[🧪 Test] Sending test SMS to ${phoneNumber}`)

        const testMessage = `Your HangHand purchase is complete! Card Number: WC-TEST12345. Thank you for your purchase!`

        const result = await sendSMS({
            phoneNumber,
            message: testMessage,
            region: 'us-east-1',
        })

        if (result.success) {
            console.log(`[✅ Test] SMS sent successfully, MessageId: ${result.messageId}`)
            return new Response(
                JSON.stringify({
                    success: true,
                    messageId: result.messageId,
                    message: 'SMS sent successfully'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        } else {
            console.error(`[❌ Test] SMS failed:`, result.error)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: result.error
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

    } catch (error) {
        console.error('[❌ Test] Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
