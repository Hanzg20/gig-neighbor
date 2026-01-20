-- ==========================================
-- Comment Likes Functions
-- ==========================================

-- Function to increment comment likes count
CREATE OR REPLACE FUNCTION public.increment_comment_likes(p_comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_comments
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement comment likes count
CREATE OR REPLACE FUNCTION public.decrement_comment_likes(p_comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_comments
    SET like_count = GREATEST(0, COALESCE(like_count, 0) - 1)
    WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_comment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_comment_likes(UUID) TO authenticated;

-- Completion notice
DO $$
BEGIN
    RAISE NOTICE 'Comment likes functions created successfully!';
END $$;
