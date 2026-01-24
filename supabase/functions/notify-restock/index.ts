// notify-restock/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { sendSMS } from '../_shared/sms.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { listingItemId } = await req.json()
        if (!listingItemId) throw new Error('listingItemId required')

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Fetch Item Details and Provider Phone
        // Path: listing_items -> listing_masters -> provider_profiles -> user_profiles(phone)
        console.log(`[🔍 Restock] Fetching provider info for Item: ${listingItemId}`);

        const { data: item, error: itemError } = await supabase
            .from('listing_items')
            .select(`
                name_zh,
                name_en,
                attributes,
                master:listing_masters (
                    provider:provider_profiles (
                        user:user_profiles!provider_profiles_user_id_fkey (
                            phone,
                            name
                        )
                    )
                )
            `)
            .eq('id', listingItemId)
            .single()

        if (itemError) {
            console.error('[❌ Restock] Database Query Error:', itemError);
            throw itemError;
        }

        if (!item) {
            console.error('[❌ Restock] Item not found in database');
            throw new Error('Item not found');
        }

        // --- RATE LIMITING CHECK (12 HOURS) ---
        const attributes = item.attributes || {};
        const lastNotifiedStr = attributes.lastRestockNotifiedAt;
        if (lastNotifiedStr) {
            const lastNotified = new Date(lastNotifiedStr);
            const now = new Date();
            const twelveHoursInMs = 12 * 60 * 60 * 1000;

            if (now.getTime() - lastNotified.getTime() < twelveHoursInMs) {
                console.log(`[🔇 Restock] Rate limited. Last notification was at ${lastNotifiedStr}. Skipping SMS.`);
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Rate limited: Notification already sent within the last 12 hours',
                    lastNotifiedAt: lastNotifiedStr
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                })
            }
        }

        console.log('[👤 User Profile Recovery]', JSON.stringify((item as any).master?.provider?.user));

        // Use 'phone' as primary, fallback to 'phone_number' or 'phoneNumber'
        const providerUser = (item as any).master?.provider?.user;
        const providerPhone = providerUser?.phone || providerUser?.phone_number || providerUser?.phoneNumber;
        const itemName = item.name_zh || item.name_en || 'Unknown Product';

        if (!providerPhone) {
            console.warn(`[⚠️ Restock] CRITICAL: No phone number found in user profile.`);
            return new Response(JSON.stringify({ success: false, error: 'Provider phone missing' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // 2. Fetch Dynamic Template
        console.log('[📄 Restock] Fetching template: restock-alert (en)');
        const { data: template } = await supabase
            .from('communication_templates')
            .select('content')
            .eq('slug', 'restock-alert')
            .eq('language', 'en')
            .maybeSingle();

        // Fallback to coded default if DB template is missing
        const templateContent = template?.content || `[JWD Alert] Merchant Restock Needed: "\${itemName}" is out of stock. Update inventory now to resume Scan-to-Buy services.`;

        // Variable Injection
        const message = templateContent.replace(/\${itemName}/g, itemName);

        console.log(`[📱 Restock] Triggering SMS to ${providerPhone} for ${itemName}`);

        const smsResult = await sendSMS({
            phoneNumber: providerPhone,
            message: message
        })

        if (smsResult.success) {
            console.log(`[✅ Restock] Notification sent successfully. MessageId: ${smsResult.messageId}`);

            // 3. Update lastRestockNotifiedAt in attributes
            const updatedAttributes = {
                ...attributes,
                lastRestockNotifiedAt: new Date().toISOString()
            };

            const { error: updateError } = await supabase
                .from('listing_items')
                .update({ attributes: updatedAttributes })
                .eq('id', listingItemId);

            if (updateError) {
                console.error('[⚠️ Restock] Failed to update notification timestamp:', updateError);
            } else {
                console.log('[📈 Restock] Notification timestamp updated in database.');
            }
        } else {
            console.error('[❌ Restock] SMS Provider Error:', smsResult.error);
        }

        return new Response(JSON.stringify({
            success: smsResult.success,
            messageId: smsResult.messageId,
            error: smsResult.error
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: unknown) {
        console.error('[❌ Restock] Error:', error)
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: corsHeaders,
            status: 400
        })
    }
})
