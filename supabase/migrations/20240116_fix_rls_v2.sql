-- RLS is already enabled on storage.objects by default, skipping ALTER TABLE to avoid permission errors.

-- Allow public access to 'listing-media' bucket for now to unblock development
-- This allows ANYONE to view and upload files to this bucket
DROP POLICY IF EXISTS "Public Access to Listing Media" ON storage.objects;
CREATE POLICY "Public Access to Listing Media"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'listing-media')
WITH CHECK (bucket_id = 'listing-media');

-- Ensure listing_masters is writable by authenticated users
DROP POLICY IF EXISTS "Authenticated users insert listings" ON listing_masters;
CREATE POLICY "Authenticated users insert listings"
ON listing_masters
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure listing_masters is writable by public/anon if necessary (optional, removed for safety unless requested)
-- But let's verify checking if the user is 'provider' role if possible, or just open it for now.
