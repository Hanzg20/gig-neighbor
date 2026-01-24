// sms.ts
// Purpose: Multi-provider SMS dispatcher for Edge Functions

import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17'
import { sendSMS_Twilio } from './twilio.ts'

export interface SMSParams {
    phoneNumber: string;
    message: string;
    region?: string;
}

// AWS SNS Implementation
async function sendSMS_AWS(params: SMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { phoneNumber, message, region = 'ca-central-1' } = params;
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')?.replace(/\s/g, '');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')?.replace(/\s/g, '');

    if (!accessKeyId || !secretAccessKey) {
        return { success: false, error: 'AWS credentials missing' };
    }

    try {
        const aws = new AwsClient({ accessKeyId, secretAccessKey, region, service: 'sns' });
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

        console.log(`[📱 AWS SMS] Sending to ${formattedPhone}`);

        const queryParams = [
            `Action=Publish`,
            `Message=${encodeURIComponent(message)}`,
            `PhoneNumber=${encodeURIComponent(formattedPhone)}`,
            `Version=2010-03-31`
        ];
        const url = `https://sns.${region}.amazonaws.com/?${queryParams.join('&')}`;

        const response = await aws.fetch(url, { method: 'GET' });
        const responseText = await response.text();

        if (!response.ok) {
            console.error('[❌ AWS SMS] Error:', responseText);
            return { success: false, error: responseText };
        }

        const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/);
        return { success: true, messageId: messageIdMatch ? messageIdMatch[1] : undefined };
    } catch (error: unknown) {
        console.error('[❌ AWS SMS] Exception:', error);
        return { success: false, error: String(error) };
    }
}

// Main SMS Dispatcher
export async function sendSMS(params: SMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // 1. Try Twilio First (High Reliability)
    if (Deno.env.get('TWILIO_ACCOUNT_SID') && Deno.env.get('TWILIO_AUTH_TOKEN')) {
        console.log('[🔄 SMS] Attempting send via Twilio...');
        const twilioResult = await sendSMS_Twilio({
            to: params.phoneNumber,
            message: params.message
        });

        if (twilioResult.success) return twilioResult;
        console.warn('[⚠️ SMS] Twilio failed, falling back to AWS SNS:', twilioResult.error);
    }

    // 2. Fallback to AWS SNS
    console.log('[🔄 SMS] Attempting send via AWS SNS...');
    return sendSMS_AWS(params);
}
