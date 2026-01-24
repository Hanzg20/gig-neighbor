export interface TwilioSMSParams {
    to: string;
    message: string;
}

export async function sendSMS_Twilio(params: TwilioSMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, message } = params;
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
        console.error('[❌ Twilio] Credentials or Sender Number not configured');
        return { success: false, error: 'Twilio credentials missing' };
    }

    try {
        console.log(`[📱 Twilio] Sending to ${to}`);
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const auth = btoa(`${accountSid}:${authToken}`);
        const formData = new URLSearchParams();
        formData.append('To', to);
        formData.append('From', fromNumber);
        formData.append('Body', message);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('[❌ Twilio] API Error:', JSON.stringify(data));
            return { success: false, error: data.message || 'Unknown Twilio Error' };
        }

        console.log('[✅ Twilio] Sent successfully:', data.sid);
        return { success: true, messageId: data.sid };
    } catch (error: unknown) {
        console.error('[❌ Twilio] Request failed:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
