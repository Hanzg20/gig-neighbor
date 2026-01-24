-- ==========================================
-- PROJECT SECURITY FACADE: SAFE PUBLIC VIEWS
-- ==========================================

-- A. CREATE VIEWS FIRST
-- 1. SAFE INVENTORY VIEW
CREATE OR REPLACE VIEW public.safe_inventory_levels AS
SELECT 
    id, 
    listing_item_id, 
    status,
    created_at
FROM public.listing_inventory
WHERE status = 'available';

-- 2. SAFE PROFILE VIEW
CREATE OR REPLACE VIEW public.public_user_info AS
SELECT 
    id, 
    name, 
    avatar, 
    bio, 
    node_id,
    created_at
FROM public.user_profiles;


-- B. GRANT PERMISSIONS SECOND
-- Grant access to public (anon & authenticated)
GRANT SELECT ON public.safe_inventory_levels TO anon, authenticated;
GRANT SELECT ON public.public_user_info TO anon, authenticated;

-- Force PostgREST reload
NOTIFY pgrst, 'reload config';

COMMENT ON VIEW public.safe_inventory_levels IS 'Secure view for checking stock availability without exposing card data.';
COMMENT ON VIEW public.public_user_info IS 'Secure view for public profile display without exposing private contact info.';
