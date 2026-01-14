# Environment Configuration for Supabase

## Development Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Feature Flags
VITE_USE_MOCK_DATA=false  # Set to 'true' for local development without backend
VITE_ENABLE_AI_SEARCH=false  # Set to 'true' after deploying embedding Edge Function

# Pilot Node Configuration
VITE_DEFAULT_NODE=NODE_LEES  # Default pilot node for new users
VITE_AVAILABLE_NODES=NODE_LEES,NODE_KANATA

# Debug Options
VITE_DEBUG_MODE=true  # Enable console logging for API calls
VITE_SHOW_DEV_TOOLS=true  # Show development UI helpers
```

## Supabase Project Setup Steps

1. **Create Project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `justwedo-production` (or `justwedo-dev` for testing)
   - Database Password: Generate strong password and save in password manager
   - Region: `us-east-1` (closest to Ottawa)

2. **Enable Extensions**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```
   Run in SQL Editor → New Query

3. **Deploy Schema**:
   - Copy contents of `docs/supabase_schema.sql`
   - Paste into SQL Editor → Execute
   - Verify: Check Tables sidebar (should show 20+ tables)

4. **Deploy Triggers**:
   - Copy contents of `docs/supabase_triggers.sql`
   - Execute in SQL Editor
   - Test: Create test user via Auth → Users tab

5. **Seed Data**:
   - Copy contents of `docs/seed_data.sql`
   - Execute in SQL Editor
   - Verify: `SELECT * FROM ref_codes;` (should show 10+ categories)

6. **Get API Credentials**:
   - Go to Project Settings → API
   - Copy `URL` → Set as `VITE_SUPABASE_URL`
   - Copy `anon` `public` key → Set as `VITE_SUPABASE_ANON_KEY`

7. **Configure Auth Providers**:
   - Go to Authentication → Providers
   - Enable "Email" (for Magic Links)
   - Optional: Enable "Phone" for SMS OTP (requires Twilio setup)

## Testing the Connection

Run this command after setting up `.env.local`:

```bash
npm run dev
```

Then test:
1. Navigate to `/login`
2. Enter email address
3. Check Supabase Dashboard → Auth → Users (new user should appear)
4. Check `user_profiles` table (auto-created by trigger)

## Troubleshooting

### "Invalid API key"
- Verify `.env.local` has correct `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env` files

### "Table does not exist"
- Re-run `supabase_schema.sql` in SQL Editor
- Check for SQL errors in the output panel

### "User profile not created"
- Verify `supabase_triggers.sql` was executed
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`

### Test user not getting email
- Check Supabase Dashboard → Authentication → Settings
- Confirm Site URL is correct (e.g., `http://localhost:5173` for dev)
- Check spam folder

## Production Checklist

Before deploying to production:
- [ ] Enable RLS on all tables
- [ ] Test with 2+ user accounts (different roles)
- [ ] Set up email templates (Supabase → Auth → Email Templates)
- [ ] Configure custom SMTP (optional, reduces Supabase email limits)
- [ ] Set up database backups (Supabase → Database → Backups)
- [ ] Enable 2FA for Supabase dashboard access

## Storage Configuration

Run these commands to set up the necessary media buckets and permissions:

```sql
-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-media', 'listing-media', true) ON CONFLICT (id) DO NOTHING;

-- 2. Review Media Policies
DROP POLICY IF EXISTS "Public Read Review" ON storage.objects;
CREATE POLICY "Public Read Review" ON storage.objects FOR SELECT TO public USING (bucket_id = 'review-media');

DROP POLICY IF EXISTS "Auth Upload Review" ON storage.objects;
CREATE POLICY "Auth Upload Review" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-media' AND auth.role() = 'authenticated');

-- 3. Listing Media Policies
DROP POLICY IF EXISTS "Public Read Listing" ON storage.objects;
CREATE POLICY "Public Read Listing" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listing-media');

DROP POLICY IF EXISTS "Auth Upload Listing" ON storage.objects;
CREATE POLICY "Auth Upload Listing" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owner Delete Listing" ON storage.objects;
CREATE POLICY "Owner Delete Listing" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-media' AND owner = auth.uid());
```
