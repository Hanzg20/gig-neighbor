-- ==========================================
-- MASTER FIX SCRIPT: 2024-01-16
-- Purpose: Consolidate all partial fixes into one idempotent execution.
-- Fixes: Registration Trigger, RLS (Provider/Listing/Storage), Missing Columns.
-- ==========================================

-- 1. FIX USER REGISTRATION TRIGGER (Dynamic Node ID)
-- Previously hardcoded to 'NODE_LEES'. Now respects metadata or defaults to 'NODE_LEES'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, node_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Neighbor'), 
    COALESCE(NEW.raw_user_meta_data->>'nodeId', 'NODE_LEES') -- FIX: Dynamic Node ID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. FIX SCHEMA: MISSING COLUMNS IN user_profiles
-- Essential for "Upgrade to Provider" flow
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS provider_profile_id UUID REFERENCES provider_profiles(id);

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{BUYER}';

-- 3. FIX RLS: PROVIDER PROFILES
-- Essential for "Become Provider" page
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON provider_profiles;
CREATE POLICY "Public Read Access" ON provider_profiles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can create own provider profile" ON provider_profiles;
CREATE POLICY "Users can create own provider profile" ON provider_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own provider profile" ON provider_profiles;
CREATE POLICY "Users can update own provider profile" ON provider_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. FIX RLS: USER PROFILES (Update Permission)
-- Essential for linking User -> Provider
DROP POLICY IF EXISTS "Users can update own user profile" ON user_profiles;
CREATE POLICY "Users can update own user profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. FIX RLS: LISTING MASTERS & ITEMS
-- Essential for "Publish Service"
ALTER TABLE listing_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users insert listings" ON listing_masters;
CREATE POLICY "Authenticated users insert listings" ON listing_masters FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users update own listings" ON listing_masters;
CREATE POLICY "Authenticated users update own listings" ON listing_masters FOR UPDATE TO authenticated USING (auth.uid() = (select user_id from provider_profiles where id = provider_id));

DROP POLICY IF EXISTS "Authenticated users insert items" ON listing_items;
CREATE POLICY "Authenticated users insert items" ON listing_items FOR INSERT TO authenticated WITH CHECK (true);

-- 6. FIX STORAGE RLS
-- Essential for Image Uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-media', 'listing-media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to Listing Media" ON storage.objects;
CREATE POLICY "Public Access to Listing Media" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listing-media');

DROP POLICY IF EXISTS "Authenticated users upload media" ON storage.objects;
CREATE POLICY "Authenticated users upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-media');

DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-media' AND owner = auth.uid());

-- Force reload
NOTIFY pgrst, 'reload config';
