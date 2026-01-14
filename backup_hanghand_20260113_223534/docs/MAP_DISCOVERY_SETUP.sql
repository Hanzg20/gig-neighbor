-- ==========================================
-- Phase 10: Map Discovery Mode & PostGIS Setup
-- ==========================================

-- 1. Enable PostGIS extension (requires superuser/dashboard access usually, but trying here)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add geography column to listing_masters if it doesn't exist
-- We use geography(POINT) for performance and distance accuracy in meters
ALTER TABLE public.listing_masters 
ADD COLUMN IF NOT EXISTS location_coords geography(POINT);

-- 3. Create index for spatial queries
CREATE INDEX IF NOT EXISTS idx_listing_masters_location_coords ON public.listing_masters USING GIST (location_coords);

-- 4. Function to sync lat/lng to geography column
CREATE OR REPLACE FUNCTION public.sync_listing_coords()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location_coords = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to automatically sync coords on insert/update
DROP TRIGGER IF EXISTS trg_sync_listing_coords ON public.listing_masters;
CREATE TRIGGER trg_sync_listing_coords
BEFORE INSERT OR UPDATE OF latitude, longitude
ON public.listing_masters
FOR EACH ROW
EXECUTE FUNCTION public.sync_listing_coords();

-- 6. RPC for Radius Search
CREATE OR REPLACE FUNCTION public.match_listings_by_radius(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION,
    p_type TEXT DEFAULT NULL,
    p_category_id TEXT DEFAULT NULL,
    p_match_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    title_zh TEXT,
    title_en TEXT,
    description_zh TEXT,
    description_en TEXT,
    images TEXT[],
    type listing_type,
    category_id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating NUMERIC,
    review_count INTEGER,
    status TEXT,
    distance_meters DOUBLE PRECISION
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        lm.id,
        lm.title_zh,
        lm.title_en,
        lm.description_zh,
        lm.description_en,
        lm.images,
        lm.type,
        lm.category_id,
        lm.latitude,
        lm.longitude,
        lm.rating,
        lm.review_count,
        lm.status,
        ST_Distance(lm.location_coords, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) AS distance_meters
    FROM public.listing_masters lm
    WHERE 
        lm.status = 'PUBLISHED'
        AND ST_DWithin(lm.location_coords, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_meters)
        AND (p_type IS NULL OR lm.type::text = p_type)
        AND (p_category_id IS NULL OR lm.category_id = p_category_id)
    ORDER BY distance_meters ASC
    LIMIT p_match_count;
END;
$$;

-- 7. Populate existing coordinates (Migration for old data)
UPDATE public.listing_masters
SET location_coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location_coords IS NULL;
