# 🧪 Authentication Flow Test Plan - Task #204

**Test Date**: 2026-01-05
**Tester**: [Your Name]
**Environment**: Development (localhost:8080)
**Supabase Project**: fvjgmydkxklqclcyhuvl

---

## Pre-Test Checklist

- [x] Supabase schema deployed (Task #202)
- [ ] Seed data imported (Task #203) - **VERIFY FIRST**
- [x] Development server running
- [x] .env configured correctly

---

## Test 1: Verify Seed Data Import

### SQL Queries to Run in Supabase SQL Editor:

```sql
-- Check ref_codes (should return 42+ rows)
SELECT COUNT(*) as total_ref_codes FROM public.ref_codes;

-- Check community nodes (should return 2 rows: NODE_LEES, NODE_KANATA)
SELECT code_id, en_name, zh_name
FROM public.ref_codes
WHERE type = 'NODE';

-- Check top-level industries (should return 5 rows)
SELECT code_id, en_name, zh_name
FROM public.ref_codes
WHERE type = 'INDUSTRY'
ORDER BY sort_order;

-- Check roles (should return 4 rows)
SELECT * FROM public.roles;
```

### Expected Results:
- ✅ ref_codes: 42+ rows (5 industries + 2 nodes + 35 categories)
- ✅ Community nodes: 2 (NODE_LEES, NODE_KANATA)
- ✅ Roles: 4 (BUYER, PROVIDER, VERIFIED_PRO, ADMIN)

**Status**: [ ] PASS / [ ] FAIL

---

## Test 2: User Registration (Email/Password)

### Steps:
1. Navigate to http://localhost:8080/login
2. Click "Register" or "Sign Up"
3. Enter test credentials:
   - Email: `test-user-001@example.com`
   - Password: `TestPassword123!`
4. Submit registration form

### Expected Behavior:
- ✅ User created in Supabase `auth.users` table
- ✅ Redirect to email verification page
- ✅ Verification email sent (check Supabase Auth logs)

### Verification SQL:
```sql
-- Check if user was created
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'test-user-001@example.com';
```

**Screenshot**: `docs/walkthroughs/screenshots/2026-01-05_registration-form.png`
**Status**: [ ] PASS / [ ] FAIL
**Notes**:

---

## Test 3: User Profile Auto-Creation (Trigger)

### Purpose:
Verify that the database trigger automatically creates a `user_profiles` record when a new auth user is created.

### Verification SQL:
```sql
-- Check if profile was auto-created
SELECT
  up.id,
  up.email,
  up.name,
  up.beans_balance,
  up.node_id,
  up.created_at
FROM public.user_profiles up
INNER JOIN auth.users au ON au.id = up.id
WHERE au.email = 'test-user-001@example.com';
```

### Expected Results:
- ✅ `user_profiles` record exists with matching UUID
- ✅ `email` matches auth.users.email
- ✅ `beans_balance` = 100 (initial welcome beans)
- ✅ `node_id` = 'NODE_LEES' (default community)
- ✅ `created_at` timestamp is set

**Screenshot**: `docs/walkthroughs/screenshots/2026-01-05_profile-created.png`
**Status**: [ ] PASS / [ ] FAIL
**Notes**:

---

## Test 4: Initial Beans Balance

### Verification:
Check that new users receive 100 welcome beans.

### SQL:
```sql
SELECT email, beans_balance
FROM public.user_profiles
WHERE email = 'test-user-001@example.com';
```

### Expected:
- ✅ `beans_balance` = 100

**Status**: [ ] PASS / [ ] FAIL

---

## Test 5: Email Verification (Magic Link)

### Steps:
1. Check Supabase Auth Logs for verification email
2. Copy magic link from email (or Supabase dashboard)
3. Click the link
4. Verify redirect to app

### Expected:
- ✅ `auth.users.email_confirmed_at` is updated
- ✅ User redirected to home page with authenticated session

### Verification SQL:
```sql
SELECT email, email_confirmed_at
FROM auth.users
WHERE email = 'test-user-001@example.com';
```

**Status**: [ ] PASS / [ ] FAIL

---

## Test 6: Login Flow (Existing User)

### Steps:
1. Navigate to http://localhost:8080/login
2. Enter credentials:
   - Email: `test-user-001@example.com`
   - Password: `TestPassword123!`
3. Click "Login"

### Expected:
- ✅ Successful authentication
- ✅ Session token stored in browser
- ✅ Redirect to home page
- ✅ User profile loaded in authStore

### Browser Console Check:
```javascript
// Open DevTools Console and check:
localStorage.getItem('supabase.auth.token')
```

**Screenshot**: `docs/walkthroughs/screenshots/2026-01-05_login-success.png`
**Status**: [ ] PASS / [ ] FAIL

---

## Test 7: Session Persistence

### Steps:
1. Login successfully (Test 6)
2. Refresh the page (F5)
3. Verify user remains logged in

### Expected:
- ✅ No redirect to login page
- ✅ User data still loaded in UI
- ✅ Session token still valid

**Status**: [ ] PASS / [ ] FAIL

---

## Test 8: Logout Flow

### Steps:
1. While logged in, click "Logout" button
2. Verify redirect to login page
3. Check session cleared

### Expected:
- ✅ Redirect to /login
- ✅ Session token removed from localStorage
- ✅ Cannot access protected pages without re-login

**Status**: [ ] PASS / [ ] FAIL

---

## Test 9: Repository Pattern Verification

### Check:
Verify that authentication is using the Repository Pattern (not direct Supabase calls).

### Code Review:
Check `src/pages/Login.tsx` and `src/pages/Register.tsx`:
```typescript
// Should use:
import { repositoryFactory } from '@/services/repositories/factory';
const authRepo = repositoryFactory.getAuthRepository();

// Should NOT use:
import { supabase } from '@/lib/supabase'; // ❌
```

**Status**: [ ] PASS / [ ] FAIL

---

## Summary

### Test Results:
- [ ] Test 1: Seed Data Import
- [ ] Test 2: User Registration
- [ ] Test 3: Profile Auto-Creation
- [ ] Test 4: Initial Beans Balance
- [ ] Test 5: Email Verification
- [ ] Test 6: Login Flow
- [ ] Test 7: Session Persistence
- [ ] Test 8: Logout Flow
- [ ] Test 9: Repository Pattern

### Issues Found:
1.
2.
3.

### Task Completion:
- [ ] Task #203: Seed Data Import
- [ ] Task #204: Auth Flow Implementation
- [ ] Task #205: Walkthrough Documentation
- [ ] Task #206: Update system_design_document.md

---

## Next Steps

After all tests pass:
1. ✅ Update [task.md](task.md) to mark Task #204 as complete
2. ✅ Document results in [walkthrough.md](walkthrough.md) with screenshots
3. ✅ Add implementation notes to [system_design_document.md](system_design_document.md)
4. ✅ Move to Task #210 (Flow 2: Browse & Search)
