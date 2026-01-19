-- ==========================================
-- LISTING PERMISSIONS MIGRATION
-- Version: 1.1
-- Purpose: Grant providers/users permission to manage their own listings (Update/Delete)
-- ==========================================

-- 1. Enable Providers to Manage their Own Listings (UPDATE, DELETE)
-- Checks if the auth.uid() matches the provider's user_id
DROP POLICY IF EXISTS "Providers can manage own listings" ON public.listing_masters;
CREATE POLICY "Providers can manage own listings" 
ON public.listing_masters 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.provider_profiles p 
        WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
);

-- Also allow if the User Profile ID matches (for simple users who are not yet providers but created a listing? 
-- Actually, listing_masters.provider_id REFERENCES provider_profiles, so the above check is safer.
-- BUT, we also have non-provider listings (Community Posts converted). 
-- Wait, Community Posts are in `community_posts` table now.
-- However, `listing_masters` is used for "Services" and "Goods". 
-- The `provider_id` in `listing_masters` refers to `provider_profiles.id`.
-- So the user MUST have a provider profile to own a listing in `listing_masters`.

-- 2. Allow Providers to Manage their Own Listing Items
DROP POLICY IF EXISTS "Providers can manage own listing items" ON public.listing_items;
CREATE POLICY "Providers can manage own listing items" 
ON public.listing_items 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.listing_masters m
        JOIN public.provider_profiles p ON m.provider_id = p.id
        WHERE m.id = public.listing_items.master_id
        AND p.user_id = auth.uid()
    )
);

-- 3. Allow Viewing Own Drafts/Pending Listings
-- The existing policy "Masters viewable if published" only allows 'PUBLISHED'.
-- Owners need to see their own non-published listings.

DROP POLICY IF EXISTS "Providers can view own listings" ON public.listing_masters;
CREATE POLICY "Providers can view own listings" 
ON public.listing_masters 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.provider_profiles p 
        WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
);

-- Ensure we don't have conflicting SELECT policies (RLS policies are OR-ed, so this is fine).
