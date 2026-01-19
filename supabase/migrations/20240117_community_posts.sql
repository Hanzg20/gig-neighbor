-- ==========================================
-- COMMUNITY POSTS SCHEMA MIGRATION
-- Version: 1.0
-- Purpose: Create dedicated tables for community social posts
-- ==========================================

-- 1. Community Posts Table (主帖表)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Content
    post_type TEXT NOT NULL DEFAULT 'GENERAL', -- 'SECOND_HAND', 'WANTED', 'GIVEAWAY', 'EVENT', 'HELP', 'GENERAL'
    title TEXT,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    
    -- Optional pricing (for second-hand / wanted)
    price_hint INTEGER, -- in cents, nullable
    price_negotiable BOOLEAN DEFAULT TRUE,
    
    -- Location
    location_text TEXT,
    node_id TEXT REFERENCES public.ref_codes(code_id),
    
    -- Tags & Categorization
    tags TEXT[] DEFAULT '{}',
    
    -- Social Metrics (denormalized for performance)
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESOLVED', 'ARCHIVED', 'DELETED'
    is_pinned BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE, -- 已出 / 已找到
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Comments Table (评论表)
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE, -- For nested replies
    
    like_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Likes Table (点赞表 - Posts)
CREATE TABLE IF NOT EXISTS public.community_post_likes (
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- 4. Community Likes Table (点赞表 - Comments)
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
    comment_id UUID NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

-- 5. Post-to-Service Conversion Tracking (帖子→服务转化记录)
CREATE TABLE IF NOT EXISTS public.community_post_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listing_masters(id) ON DELETE CASCADE,
    converted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id)
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_node ON public.community_posts(node_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON public.community_comments(author_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;

-- Posts: Everyone can read active posts
DROP POLICY IF EXISTS "Anyone can view active posts" ON public.community_posts;
CREATE POLICY "Anyone can view active posts" ON public.community_posts 
    FOR SELECT USING (status = 'ACTIVE' OR status = 'RESOLVED');

-- Posts: Authors can manage their own posts
DROP POLICY IF EXISTS "Authors can manage own posts" ON public.community_posts;
CREATE POLICY "Authors can manage own posts" ON public.community_posts 
    FOR ALL USING (auth.uid() = author_id);

-- Comments: Everyone can read comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_comments;
CREATE POLICY "Anyone can view comments" ON public.community_comments 
    FOR SELECT USING (TRUE);

-- Comments: Authors can manage their own comments
DROP POLICY IF EXISTS "Users can manage own comments" ON public.community_comments;
CREATE POLICY "Users can manage own comments" ON public.community_comments 
    FOR ALL USING (auth.uid() = author_id);

-- Likes: Everyone can read likes
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.community_post_likes;
CREATE POLICY "Anyone can view post likes" ON public.community_post_likes 
    FOR SELECT USING (TRUE);

-- Likes: Users can manage their own likes
DROP POLICY IF EXISTS "Users can manage own post likes" ON public.community_post_likes;
CREATE POLICY "Users can manage own post likes" ON public.community_post_likes 
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.community_comment_likes;
CREATE POLICY "Anyone can view comment likes" ON public.community_comment_likes 
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can manage own comment likes" ON public.community_comment_likes;
CREATE POLICY "Users can manage own comment likes" ON public.community_comment_likes 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at
DROP TRIGGER IF EXISTS set_timestamp_community_posts ON public.community_posts;
CREATE TRIGGER set_timestamp_community_posts
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_community_comments ON public.community_comments;
CREATE TRIGGER set_timestamp_community_comments
    BEFORE UPDATE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Auto-increment like_count on post
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_like_change ON public.community_post_likes;
CREATE TRIGGER on_post_like_change
    AFTER INSERT OR DELETE ON public.community_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Auto-increment comment_count on post
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_change ON public.community_comments;
CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ==========================================
-- ENABLE REALTIME
-- ==========================================

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- ==========================================
-- VERIFICATION QUERY
-- ==========================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'community_%';
