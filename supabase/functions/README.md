# Supabase Edge Functions

This directory contains Supabase Edge Functions for the JUSTWEDO platform.

## Functions

### 1. `create-checkout-session`
Creates a Stripe Checkout Session for the Scan-to-Buy flow.

**Endpoint**: `https://[PROJECT_REF].supabase.co/functions/v1/create-checkout-session`

**Request Body**:
```json
{
  "listingItemId": "uuid",
  "phoneNumber": "+1234567890",
  "productName": "Self-Service Wash Recharge Card ($50)",
  "price": 5000,
  "currency": "cad",
  "masterId": "uuid"
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

### 2. `stripe-webhook`
Handles Stripe webhook events for payment confirmation and inventory allocation.

**Endpoint**: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`

**Events Handled**:
- `checkout.session.completed`: Allocates inventory and creates order
- `payment_intent.payment_failed`: Handles failed payments

## Deployment

### Prerequisites
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref [YOUR_PROJECT_REF]
   ```

### Set Environment Variables

Set the required secrets for your Supabase project:

```bash
# Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (get from Stripe Dashboard)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase URL (already available by default)
# SUPABASE_URL is automatically set

# Supabase Service Role Key (for webhook to access DB)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Deploy Functions

Deploy all functions:
```bash
supabase functions deploy
```

Or deploy individually:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Local Development

Run functions locally:
```bash
# Start Supabase local development
supabase start

# Serve functions locally
supabase functions serve create-checkout-session --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-checkout-session' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"listingItemId":"...","phoneNumber":"+1234567890","productName":"Test","price":5000}'
```

## Stripe Webhook Configuration

After deploying the `stripe-webhook` function:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Set it as a Supabase secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Environment Variables

Create a `.env.local` file for local development:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Testing

### Test Checkout Session Creation

```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "listingItemId": "test-uuid",
    "phoneNumber": "+16135550123",
    "productName": "Test Product",
    "price": 5000,
    "currency": "cad",
    "masterId": "test-master-uuid"
  }'
```

### Test Webhook Locally

Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local function
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Troubleshooting

### CORS Errors
- Ensure `Access-Control-Allow-Origin: *` is set in response headers
- Check that OPTIONS requests return 200 OK

### Webhook Signature Verification Failed
- Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard
- Ensure raw request body is used for signature verification

### Inventory Allocation Failed
- Check that `listing_inventory` table has available items
- Verify `listing_item_id` matches an existing item
- Check database permissions for service role key

## Security Notes

- Never commit `.env.local` or expose secret keys
- Use Stripe test keys for development
- Webhook endpoint should only accept requests from Stripe IPs (optional)
- Validate all input data before processing
