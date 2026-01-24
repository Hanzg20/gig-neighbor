-- ==========================================
-- STORAGE POLICIES: Avatar Upload
-- ==========================================
-- Purpose: Allow authenticated users to upload and manage their own avatars
-- Security: Users can only upload/update their own avatars (folder name = user ID)

-- Enable RLS on storage.objects (if not already enabled)
-- Note: This should already be enabled by default in Supabase

-- Policy 1: Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Anyone can view avatars (public read)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

COMMENT ON POLICY "Users can upload own avatar" ON storage.objects IS 'Allows authenticated users to upload avatars to their own folder (user_id)';
COMMENT ON POLICY "Anyone can view avatars" ON storage.objects IS 'Public read access to avatar images';
