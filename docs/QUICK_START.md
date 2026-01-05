# 🚀 Quick Start Guide - Supabase Deployment

This is the **fastest path** to get HangHand running with Supabase. Follow these steps in order.

---

## ⏱️ 15-Minute Setup

### 1. Create Supabase Project (2 min)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `hanghand-dev`
   - Password: (generate and save)
   - Region: `us-east-1`
4. Wait for provisioning (~2 min)

### 2. Deploy Database (5 min)

Open **SQL Editor** in Supabase:

**Query 1: Extensions**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
```

**Query 2: Schema**
- Copy entire contents of `docs/supabase_schema.sql`
- Paste and run (takes ~10 seconds)

**Query 3: Triggers**
- Copy entire contents of `docs/supabase_triggers.sql`
- Paste and run

**Query 4: Seed Data**
- Copy entire contents of `docs/seed_data.sql`
- Paste and run

**Verify**:
```sql
SELECT code_id, zh_name FROM ref_codes WHERE type = 'COMMUNITY_NODE';
```
Should return 2 rows (NODE_LEES, NODE_KANATA)

### 3. Configure Environment (3 min)

1. **Get API Credentials**:
   - Settings → API
   - Copy "Project URL" and "anon public" key

2. **Create `.env.local`** in project root:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_USE_MOCK_DATA=false
   VITE_DEFAULT_NODE=NODE_LEES
   ```

3. **Enable Email Auth**:
   - Authentication → Providers → Toggle "Email" ON
   - Authentication → URL Configuration → Site URL: `http://localhost:5173`

### 4. Test Connection (5 min)

```bash
# Restart dev server to load new env vars
npm run dev
```

**Test Steps**:
1. Go to http://localhost:5173/login
2. Enter your email
3. Click "Send Magic Link" (or use demo login)
4. Check Supabase Dashboard:
   - Authentication → Users (should see new user)
   - Table Editor → user_profiles (profile created by trigger!)

**Success Indicators**:
- ✅ No "Invalid API key" errors in console
- ✅ User appears in Supabase Dashboard
- ✅ Console shows: `🔗 Repository Factory: Using Supabase (Production Mode)`

---

## 🎉 You're Done!

Your app is now connected to Supabase. The repository layer will automatically use production data.

### Next Steps

**Option 1: Add Test Data**
```sql
-- Run in SQL Editor to create a test listing
INSERT INTO listing_masters (category_id, node_id, title_zh, title_en, description_zh, type, status, created_by)
SELECT 
  '1010100',
  'NODE_LEES',
  '帮忙铲雪',
  'Snow Removal Help',
  '提供铲雪服务，$20/次',
  'SERVICE',
  'PUBLISHED',
  id
FROM user_profiles LIMIT 1;
```

**Option 2: Continue Building**
- Integrate BeanBalance into Header
- Deploy Edge Function for AI search
- Add more JinBean patterns

### Toggle Between Mock & Production

Want to switch back to mock data for testing?

```bash
# In .env.local
VITE_USE_MOCK_DATA=true  # Use mock data
VITE_USE_MOCK_DATA=false # Use Supabase
```

Restart dev server after changing.

---

## 🆘 Troubleshooting

| Issue | Solution |
|:------|:---------|
| "Could not connect" | Verify `.env.local` has correct URL and key |
| "Invalid API key" | Restart dev server (`Ctrl+C`, then `npm run dev`) |
| User not created | Check Authentication → Logs for errors |
| Profile not created | Verify trigger exists: `SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';` |

For detailed help, see `docs/DEPLOYMENT_CHECKLIST.md`
