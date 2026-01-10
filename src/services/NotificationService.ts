/**
 * Notification Service
 * Responsible for sending SMS and Email notifications.
 * Integration point for Twilio, SendGrid, or Supabase Edge Functions.
 */
export class NotificationService {
    /**
     * Sends a fulfillment notification containing the serial number.
     * @param phone User's phone number
     * @param serial The purchased serial/card number
     * @param title Title of the product
     */
    static async sendFulfillmentSMS(phone: string, serial: string, title: string): Promise<void> {
        console.log(`[NotificationService] Sending SMS to ${phone}: "Your code for ${title} is ${serial}"`);

        // In production:
        // await fetch('https://your-edge-function.supabase.co/send-sms', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ to: phone, message: `...` })
        // });

        return Promise.resolve();
    }

    /**
     * Sends a generic notification.
     */
    static async notify(userId: string, message: string): Promise<void> {
        console.log(`[NotificationService] Notifying user ${userId}: ${message}`);
        return Promise.resolve();
    }
}
