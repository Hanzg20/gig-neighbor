-- Enable RLS on provider_profiles (if not already enabled)
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Allow Public Read Access (so everyone can see providers)
DROP POLICY IF EXISTS "Public Read Access" ON provider_profiles;
CREATE POLICY "Public Read Access"
ON provider_profiles
FOR SELECT
TO public
USING (true);

-- 2. Allow Authenticated Users to Insert their OWN profile
DROP POLICY IF EXISTS "Users can create own provider profile" ON provider_profiles;
CREATE POLICY "Users can create own provider profile"
ON provider_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow Providers to Update their OWN profile
DROP POLICY IF EXISTS "Users can update own provider profile" ON provider_profiles;
CREATE POLICY "Users can update own provider profile"
ON provider_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Also need to ensure user_profiles can be updated if the code updates it at the same time
-- The code updates `user_profiles` to set `provider_profile_id` and `roles`
DROP POLICY IF EXISTS "Users can update own user profile" ON user_profiles;
CREATE POLICY "Users can update own user profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
