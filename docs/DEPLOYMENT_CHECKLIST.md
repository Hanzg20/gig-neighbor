# 🚀 Supabase Deployment Checklist

Follow these steps in order to deploy HangHand to Supabase production.

---

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**:
   - Navigate to https://supabase.com/dashboard
   - Click "New Project" button

2. **Project Configuration**:
   - **Name**: `hanghand-production` (or `hanghand-dev` for testing)
   - **Database Password**: Generate a strong password (save it in a password manager!)
   - **Region**: `us-east-1` (North America East - closest to Ottawa)
   - **Pricing Plan**: Free tier is sufficient for MVP

3. **Wait for Provisioning**:
   - This takes about 2 minutes
   - You'll see "Setting up project..." status

---

## Step 2: Enable Required Extensions

1. **Open SQL Editor**:
   - In your Supabase project, click "SQL Editor" in the left sidebar
   - Click "+ New query"

2. **Run Extension Setup**:
   ```sql
   -- Enable required PostgreSQL extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```

3. **Execute**:
   - Click "Run" or press `Ctrl+Enter`
   - You should see "Success. No rows returned"

---

## Step 3: Deploy Database Schema

1. **Copy Schema File**:
   - Open `docs/supabase_schema.sql` in your project
   - Copy the entire file content (Ctrl+A, Ctrl+C)

2. **Create New Query**:
   - In SQL Editor, click "+ New query"
   - Paste the schema SQL

3. **Execute Schema**:
   - Click "Run"
   - This creates all tables, types, and initial structure
   - **Expected time**: ~10 seconds

4. **Verify Tables**:
   - Click "Table Editor" in sidebar
   - You should see 20+ tables including:
     - `ref_codes`
     - `user_profiles`
     - `listing_masters`
     - `orders`
     - `bean_transactions`

---

## Step 4: Deploy Database Triggers

1. **Copy Triggers File**:
   - Open `docs/supabase_triggers.sql`
   - Copy entire file

2. **Run Triggers**:
   - SQL Editor → New query
   - Paste and execute

3. **Verify Triggers**:
   ```sql
   -- Check that triggers exist
   SELECT tgname, tgrelid::regclass 
   FROM pg_trigger 
   WHERE tgname IN ('on_auth_user_created', 'generate_listing_embedding', 'validate_order_status');
   ```
   - Should return 3 rows

---

## Step 5: Seed Reference Data

1. **Copy Seed Data**:
   - Open `docs/seed_data.sql`
   - Copy entire file

2. **Execute Seed**:
   - SQL Editor → New query
   - Paste and run

3. **Verify Data**:
   ```sql
   -- Check categories and nodes
   SELECT code_id, type, zh_name, en_name 
   FROM ref_codes 
   WHERE type IN ('INDUSTRY', 'COMMUNITY_NODE') 
   ORDER BY type, sort_order;
   ```
   - Should return ~7 rows (5 industries + 2 nodes)

---

## Step 6: Configure Authentication

1. **Enable Email Provider**:
   - Go to Authentication → Providers
   - Find "Email" and toggle it ON
   - **Confirm email**: Toggle ON (for production)
   - **Secure email change**: Toggle ON

2. **Configure Email Templates**:
   - Authentication → Email Templates
   - Customize "Confirm signup" template (optional):
     ```
     <h2>Welcome to HangHand! 欢迎加入邻里社区</h2>
     <p>Click the link below to confirm your email:</p>
     <a href="{{ .ConfirmationURL }}">Confirm Email</a>
     ```

3. **Set Site URL**:
   - Authentication → URL Configuration
   - **Site URL**: `http://localhost:5173` (for dev) or your production URL
   - **Redirect URLs**: Add your development and production URLs

---

## Step 7: Get API Credentials

1. **Navigate to Settings**:
   - Click "Settings" (gear icon) in sidebar
   - Go to "API" section

2. **Copy Credentials**:
   - **Project URL**: Copy the URL (e.g., `https://abc123xyz.supabase.co`)
   - **Project API keys** → `anon` `public`: Copy this key

3. **Create .env.local**:
   - In your project root, create `.env.local`
   - Copy from `.env.example` and fill in:
     ```bash
     VITE_SUPABASE_URL=https://abc123xyz.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     VITE_USE_MOCK_DATA=false
     ```

---

## Step 8: Test the Connection

1. **Restart Dev Server**:
   ```bash
   npm run dev
   ```

2. **Test Registration**:
   - Navigate to http://localhost:5173/login
   - Enter your email address
   - Click "Send Magic Link"

3. **Verify in Supabase**:
   - Go to Authentication → Users
   - You should see your new user
   - Go to Table Editor → `user_profiles`
   - A profile should have been auto-created (via trigger!)

4. **Check Console**:
   - Open browser DevTools → Console
   - You should NOT see any Supabase errors
   - If you see "Invalid API key", double-check `.env.local`

---

## Step 9: Populate Test Data (Optional)

To test the app with some listings, you can insert test data:

```sql
-- Insert a test listing master
INSERT INTO listing_masters (
  id, category_id, node_id, title_zh, title_en, description_zh, 
  type, status, created_by
) VALUES (
  gen_random_uuid(),
  '1010100', -- House Cleaning category
  'NODE_LEES',
  '专业家庭清洁',
  'Professional House Cleaning',
  '提供全屋深度清洁服务，经验丰富，价格实惠',
  'SERVICE',
  'PUBLISHED',
  (SELECT id FROM user_profiles LIMIT 1) -- Your user ID
);
```

---

## Step 10: Verify Everything Works

**Checklist**:
- [ ] Can log in with email OTP
- [ ] User profile auto-created
- [ ] Can view categories from RefCodes
- [ ] No console errors
- [ ] Mock data toggle works (VITE_USE_MOCK_DATA=true/false)

---

## 🎉 Deployment Complete!

Your app is now connected to Supabase production. Next steps:

1. **Deploy Edge Function** (for AI search):
   ```bash
   npx supabase functions deploy generate-embedding
   ```

2. **Enable Row Level Security** (for production):
   - Table Editor → Each table → "..." → Enable RLS
   - Add policies for user data access

3. **Production Deployment**:
   - Deploy frontend to Vercel/Netlify
   - Update Site URL in Supabase Auth settings
   - Set production environment variables

---

## Troubleshooting

### "Could not connect to database"
- Check if Supabase project is active (not paused)
- Verify `.env.local` has correct URL

### "JWT expired" or "Invalid token"
- Clear browser localStorage
- Re-login to get fresh session

### "Row Level Security policy violation"
- RLS policies need to be configured
- For MVP, you can disable RLS (not recommended for production)

### Test user not receiving email
- Check spam folder
- Verify email provider is enabled in Supabase
- Check Authentication → Logs for delivery errors

Need help? Check the `SUPABASE_SETUP.md` guide or Supabase docs at https://supabase.com/docs
