-- Add provider_profile_id column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS provider_profile_id UUID REFERENCES provider_profiles(id);

-- Also ensure 'roles' column exists and is array type (if not already)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{BUYER}';

-- Also ensure 'is_verified_provider' exists or use provider_profile_id as proxy in code
-- Generally good to have explicit column if code relies on it, or just use joining.
-- Based on error "Could not find...", we definitely need the ID.

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload config';
