-- =============================================
-- 用户关注系统 (User Followers System)
-- =============================================

-- 1. 创建关注关系表
CREATE TABLE IF NOT EXISTS user_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 确保不能重复关注
    UNIQUE(follower_id, following_id),
    -- 确保不能关注自己
    CHECK (follower_id != following_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_followers_follower ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following ON user_followers(following_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_created ON user_followers(created_at DESC);

-- 3. 在 user_profiles 表添加关注数统计字段
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 4. 创建触发器函数：更新关注数
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 增加被关注者的粉丝数
        UPDATE user_profiles
        SET follower_count = COALESCE(follower_count, 0) + 1
        WHERE id = NEW.following_id;

        -- 增加关注者的关注数
        UPDATE user_profiles
        SET following_count = COALESCE(following_count, 0) + 1
        WHERE id = NEW.follower_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 减少被关注者的粉丝数
        UPDATE user_profiles
        SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0)
        WHERE id = OLD.following_id;

        -- 减少关注者的关注数
        UPDATE user_profiles
        SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
        WHERE id = OLD.follower_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON user_followers;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON user_followers
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();

-- 6. 启用 RLS
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- 7. RLS 策略
-- 所有人可以查看关注关系
DROP POLICY IF EXISTS "Anyone can view follows" ON user_followers;
CREATE POLICY "Anyone can view follows" ON user_followers
    FOR SELECT USING (true);

-- 用户只能创建自己的关注
DROP POLICY IF EXISTS "Users can follow others" ON user_followers;
CREATE POLICY "Users can follow others" ON user_followers
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 用户只能取消自己的关注
DROP POLICY IF EXISTS "Users can unfollow" ON user_followers;
CREATE POLICY "Users can unfollow" ON user_followers
    FOR DELETE USING (auth.uid() = follower_id);

-- 8. 初始化现有用户的关注数（如果有历史数据）
-- 这是一次性的数据修复，确保计数准确
UPDATE user_profiles p
SET follower_count = (
    SELECT COUNT(*) FROM user_followers f WHERE f.following_id = p.id
),
following_count = (
    SELECT COUNT(*) FROM user_followers f WHERE f.follower_id = p.id
);

-- 9. 添加帖子数统计字段到 user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- 10. 更新帖子数统计
UPDATE user_profiles p
SET post_count = (
    SELECT COUNT(*) FROM community_posts cp
    WHERE cp.author_id = p.id AND cp.status = 'ACTIVE'
);

-- 11. 创建触发器：自动更新帖子数
CREATE OR REPLACE FUNCTION update_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'ACTIVE' THEN
            UPDATE user_profiles
            SET post_count = COALESCE(post_count, 0) + 1
            WHERE id = NEW.author_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 状态从非 ACTIVE 变为 ACTIVE
        IF OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN
            UPDATE user_profiles
            SET post_count = COALESCE(post_count, 0) + 1
            WHERE id = NEW.author_id;
        -- 状态从 ACTIVE 变为非 ACTIVE
        ELSIF OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
            UPDATE user_profiles
            SET post_count = GREATEST(COALESCE(post_count, 0) - 1, 0)
            WHERE id = NEW.author_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'ACTIVE' THEN
            UPDATE user_profiles
            SET post_count = GREATEST(COALESCE(post_count, 0) - 1, 0)
            WHERE id = OLD.author_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_post_count ON community_posts;
CREATE TRIGGER trigger_update_user_post_count
    AFTER INSERT OR UPDATE OF status OR DELETE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_post_count();

COMMENT ON TABLE user_followers IS '用户关注关系表';
COMMENT ON COLUMN user_followers.follower_id IS '关注者ID（发起关注的人）';
COMMENT ON COLUMN user_followers.following_id IS '被关注者ID（被关注的人）';
