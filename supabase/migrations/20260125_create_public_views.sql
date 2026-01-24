-- ==============================================================================
-- Migration: Create Public Views for Secure Access
-- Purpose: Expose safe data via Views to bypass Table RLS complexity for public reads
-- ==============================================================================

-- 1. View: Public User Profiles
-- Exposes only safe fields. Replaces direct SELECT on user_profiles for public profile pages.
DROP VIEW IF EXISTS public.view_public_profiles;
CREATE OR REPLACE VIEW public.view_public_profiles AS
SELECT 
    id, 
    name, 
    avatar, 
    bio, 
    node_id, 
    verification_level,
    CASE 
        WHEN array_length(roles, 1) > 0 THEN roles 
        ELSE ARRAY['BUYER']::text[]
    END as roles,
    provider_profile_id,
    follower_count,
    following_count,
    post_count,
    created_at
FROM public.user_profiles;

-- Grant access to public (anon) and authenticated users
GRANT SELECT ON public.view_public_profiles TO anon, authenticated;


-- 2. View: Provider Details (Rich Data)
-- Joins provider info with user avatar and credentials. 
-- Simplifies frontend queries (no manual joins needed).
DROP VIEW IF EXISTS public.view_provider_details;
CREATE OR REPLACE VIEW public.view_provider_details AS
SELECT 
    p.id,
    p.user_id,
    p.business_name_zh,
    p.business_name_en,
    p.description_zh,
    p.description_en,
    p.identity,
    p.is_verified,
    p.verification_level,
    p.badges,
    p.stats,
    p.location_address,
    p.service_radius_km,
    p.created_at,
    p.updated_at,
    -- Join User Avatar
    u.avatar as user_avatar,
    -- Join User Name (fallback)
    u.name as user_name,
    -- Aggregate Credentials into a JSON array
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'type', c.type,
                'license_number', c.license_number,
                'jurisdiction', c.jurisdiction,
                'status', c.status,
                'verified_at', c.verified_at
            )
        )
        FROM public.professional_credentials c 
        WHERE c.provider_id = p.id
    ) as credentials_json
FROM public.provider_profiles p
LEFT JOIN public.user_profiles u ON p.user_id = u.id
WHERE p.verification_status != 'SUSPENDED'; -- Only show active providers

-- Grant access to public (anon) and authenticated users
GRANT SELECT ON public.view_provider_details TO anon, authenticated;
