# Quick Deployment Guide for Stripe Edge Functions

## Prerequisites
```bash
npm install -g supabase
supabase login
```

## Step 1: Link Project
```bash
cd "d:\My Project\ts\hangs\gig-neighbor"
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 2: Set Secrets
```bash
# Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Get service role key from Supabase dashboard
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Step 3: Deploy Functions
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

## Step 4: Configure Stripe Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook secret and set it:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Step 5: Test
Visit your app and try the Scan-to-Buy flow. The CORS error should be resolved!

## Troubleshooting
- **CORS still failing?** Wait 1-2 minutes after deployment for functions to be ready
- **401 Unauthorized?** Check that `VITE_SUPABASE_ANON_KEY` is set in `.env.local`
- **500 Error?** Check function logs: `supabase functions logs create-checkout-session`
