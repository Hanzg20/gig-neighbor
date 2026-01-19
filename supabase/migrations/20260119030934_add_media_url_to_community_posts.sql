-- Add media_url column to community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_url TEXT;
