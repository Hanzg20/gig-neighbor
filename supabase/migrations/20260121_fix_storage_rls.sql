-- ============================================
-- Fix Storage RLS Policy for listing-media bucket
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-media', 'listing-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "listing-media public read" ON storage.objects;
DROP POLICY IF EXISTS "listing-media authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "listing-media authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "listing-media authenticated delete" ON storage.objects;

-- 3. Create new RLS policies for listing-media bucket

-- Policy: Public can view all files in listing-media
CREATE POLICY "listing-media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-media');

-- Policy: Authenticated users can upload to listing-media
CREATE POLICY "listing-media authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'listing-media' 
    AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can update their own files
CREATE POLICY "listing-media authenticated update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'listing-media' 
    AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete their own files
CREATE POLICY "listing-media authenticated delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'listing-media' 
    AND auth.role() = 'authenticated'
);

-- 4. Notify completion
DO $$ BEGIN RAISE NOTICE 'Storage RLS policies for listing-media bucket have been updated!'; END $$;
