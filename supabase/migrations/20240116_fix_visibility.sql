-- ==========================================
-- FIX: VISIBILITY (SELECT POLICY)
-- Purpose: Ensure everyone can READ listings (so they appear in My Listings & Search).
-- ==========================================

-- 1. Listing Masters (Allow Reading)
DROP POLICY IF EXISTS "Public Read Access" ON listing_masters;
CREATE POLICY "Public Read Access" ON listing_masters FOR SELECT TO public USING (true);

-- 2. Listing Items (Allow Reading)
DROP POLICY IF EXISTS "Public Read Access Items" ON listing_items;
CREATE POLICY "Public Read Access Items" ON listing_items FOR SELECT TO public USING (true);

-- 3. Provider Profiles (Allow Reading - Refresher)
DROP POLICY IF EXISTS "Public Read Access Providers" ON provider_profiles;
CREATE POLICY "Public Read Access Providers" ON provider_profiles FOR SELECT TO public USING (true);

-- Force reload schema cache
NOTIFY pgrst, 'reload config';
