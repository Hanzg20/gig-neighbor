-- ==========================================
-- ADD JSONB FIELDS TO LISTING_MASTERS
-- Date: 2026-01-20
-- Purpose: Add attributes and metadata support for complex listings
-- ==========================================

-- 1. Add columns
ALTER TABLE public.listing_masters 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 2. Force refresh schema cache
NOTIFY pgrst, 'reload config';
