export interface PlivoSMSParams {
    to: string;
    message: string;
}

export async function sendSMS_Plivo(params: PlivoSMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, message } = params;
    const authId = Deno.env.get('PLIVO_AUTH_ID');
    const authToken = Deno.env.get('PLIVO_AUTH_TOKEN');
    const src = Deno.env.get('PLIVO_PHONE_NUMBER'); // The purchased Plivo number

    if (!authId || !authToken || !src) {
        console.error('[❌ Plivo] Credentials or Source Number not configured');
        return { success: false, error: 'Plivo credentials missing' };
    }

    try {
        // Authorization header Basic Auth
        const auth = btoa(`${authId}:${authToken}`);

        // Format number: Plivo expects E.164 without '+' for some endpoints, 
        // but generally supports standard international format. 
        // Best practice for Plivo: Country Code + Number (e.g., 16135550100)
        let destination = to.replace(/\D/g, '');
        if (destination.length === 10) destination = '1' + destination; // Assume North America if 10 digits

        console.log(`[📱 Plivo] Sending to ${destination}`);

        const response = await fetch(`https://api.plivo.com/v1/Account/${authId}/Message/`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                src: src,
                dst: destination,
                text: message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[❌ Plivo] API Error:', JSON.stringify(data));
            return { success: false, error: data.error || 'Unknown Plivo Error' };
        }

        const messageId = data.message_uuid?.[0];
        console.log('[✅ Plivo] Sent successfully:', messageId);
        return { success: true, messageId };

    } catch (error: unknown) {
        console.error('[❌ Plivo] Request failed:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
