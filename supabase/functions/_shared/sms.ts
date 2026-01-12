// AWS SNS SMS Helper for Deno/Supabase Edge Functions
// Sends SMS notifications via AWS SNS

interface SMSParams {
    phoneNumber: string;
    message: string;
    region?: string;
}

/**
 * Send SMS via AWS SNS
 * @param params - Phone number and message
 * @returns Promise with success status
 */
export async function sendSMS(params: SMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { phoneNumber, message, region = 'us-east-1' } = params;

    // Get AWS credentials from environment
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

    if (!awsAccessKeyId || !awsSecretKey) {
        console.error('[❌ SMS] AWS credentials not configured');
        return { success: false, error: 'AWS credentials not configured' };
    }

    try {
        // Format phone number (ensure E.164 format: +1234567890)
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

        console.log(`[📱 SMS] Sending to ${formattedPhone}`);

        // AWS SNS API endpoint
        const endpoint = `https://sns.${region}.amazonaws.com/`;

        // Prepare request parameters
        const params = new URLSearchParams({
            'Action': 'Publish',
            'PhoneNumber': formattedPhone,
            'Message': message,
            'Version': '2010-03-31',
        });

        // Create AWS Signature V4
        const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
        const date = timestamp.substring(0, 8);

        const canonicalRequest = [
            'POST',
            '/',
            '',
            `content-type:application/x-www-form-urlencoded`,
            `host:sns.${region}.amazonaws.com`,
            `x-amz-date:${timestamp}`,
            '',
            'content-type;host;x-amz-date',
            await sha256(params.toString()),
        ].join('\n');

        const credentialScope = `${date}/${region}/sns/aws4_request`;
        const stringToSign = [
            'AWS4-HMAC-SHA256',
            timestamp,
            credentialScope,
            await sha256(canonicalRequest),
        ].join('\n');

        const signingKey = await getSignatureKey(awsSecretKey, date, region, 'sns');
        const signature = await hmacSha256(signingKey, stringToSign);

        const authorizationHeader = [
            `AWS4-HMAC-SHA256 Credential=${awsAccessKeyId}/${credentialScope}`,
            `SignedHeaders=content-type;host;x-amz-date`,
            `Signature=${signature}`,
        ].join(', ');

        // Make request to AWS SNS
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': `sns.${region}.amazonaws.com`,
                'X-Amz-Date': timestamp,
                'Authorization': authorizationHeader,
            },
            body: params.toString(),
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[❌ SMS] AWS SNS error:', responseText);
            return { success: false, error: responseText };
        }

        // Parse MessageId from XML response
        const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/);
        const messageId = messageIdMatch ? messageIdMatch[1] : undefined;

        console.log('[✅ SMS] Sent successfully:', messageId);
        return { success: true, messageId };

    } catch (error) {
        console.error('[❌ SMS] Error sending SMS:', error);
        return { success: false, error: error.message };
    }
}

// Helper functions for AWS Signature V4
async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hmacSha256(key: Uint8Array | string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = typeof key === 'string' ? encoder.encode(key) : key;
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const kDate = await hmacSha256Raw(encoder.encode(`AWS4${key}`), dateStamp);
    const kRegion = await hmacSha256Raw(kDate, region);
    const kService = await hmacSha256Raw(kRegion, service);
    const kSigning = await hmacSha256Raw(kService, 'aws4_request');
    return kSigning;
}

async function hmacSha256Raw(key: Uint8Array, message: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return new Uint8Array(signature);
}
