-- ==========================================
-- Post Statistics Functions
-- ==========================================

-- Ensure view_count column exists
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Function to increment post view count
CREATE OR REPLACE FUNCTION public.increment_post_view_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_post_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_view_count(UUID) TO anon;

-- Note: We grant to anon as well if we want guest views to count.
-- If only authenticated users should count, remove the second GRANT.

-- Completion notice
DO $$
BEGIN
    RAISE NOTICE 'Post statistics functions created successfully!';
END $$;
