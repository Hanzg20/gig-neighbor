-- Allow authenticated users to insert into listing_masters
DROP POLICY IF EXISTS "Users can create their own listings" ON listing_masters;
CREATE POLICY "Users can create their own listings"
ON listing_masters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = provider_id);

-- Allow authenticated users to view all listings (if not already exists)
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listing_masters;
CREATE POLICY "Listings are viewable by everyone"
ON listing_masters
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to update their own listings
DROP POLICY IF EXISTS "Users can update their own listings" ON listing_masters;
CREATE POLICY "Users can update their own listings"
ON listing_masters
FOR UPDATE
TO authenticated
USING (auth.uid() = provider_id);

-- Fix Storage RLS for listing-media bucket
-- Allow authenticated users to upload files to 'listings' folder
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-media');

-- Allow public access to view files in listing-media
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
CREATE POLICY "Allow public view"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-media');
