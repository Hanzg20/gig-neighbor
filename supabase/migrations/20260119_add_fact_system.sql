-- ==========================================
-- JUSTTALK 真言系统数据库迁移
-- Version: 1.0
-- Date: 2026-01-19
-- Purpose: 添加真言(Fact)相关字段和表
-- ==========================================

-- ==========================================
-- 1. 扩展 community_posts 表
-- ==========================================

-- 添加真言相关字段
ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS is_fact BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fact_data JSONB,
ADD COLUMN IF NOT EXISTS consensus JSONB DEFAULT '{"agree":0,"partial":0,"disagree":0,"uncertain":0,"totalVotes":0,"level":"PENDING"}',
ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_community_posts_is_fact ON public.community_posts(is_fact);
CREATE INDEX IF NOT EXISTS idx_community_posts_fact_data ON public.community_posts USING gin(fact_data);

-- 注释
COMMENT ON COLUMN public.community_posts.is_fact IS '是否为真言帖';
COMMENT ON COLUMN public.community_posts.fact_data IS '真言额外数据: {occurredAt, location, factType, subject?, evidence?}';
COMMENT ON COLUMN public.community_posts.consensus IS '社区共识: {agree, partial, disagree, uncertain, totalVotes, level}';
COMMENT ON COLUMN public.community_posts.save_count IS '收藏数';

-- ==========================================
-- 2. 创建真言投票表
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fact_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('agree', 'partial', 'disagree', 'uncertain')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 每个用户对每个帖子只能投一票
    UNIQUE(post_id, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_fact_votes_post_id ON public.fact_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_fact_votes_user_id ON public.fact_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_fact_votes_vote_type ON public.fact_votes(vote_type);

-- 注释
COMMENT ON TABLE public.fact_votes IS '真言帖社区共识投票';
COMMENT ON COLUMN public.fact_votes.vote_type IS '投票类型: agree/partial/disagree/uncertain';

-- RLS 策略
ALTER TABLE public.fact_votes ENABLE ROW LEVEL SECURITY;

-- 所有人可查看投票统计
CREATE POLICY "Anyone can view fact votes" ON public.fact_votes
FOR SELECT USING (true);

-- 登录用户可投票
CREATE POLICY "Authenticated users can vote" ON public.fact_votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可更新自己的投票
CREATE POLICY "Users can update own vote" ON public.fact_votes
FOR UPDATE USING (auth.uid() = user_id);

-- 用户可删除自己的投票
CREATE POLICY "Users can delete own vote" ON public.fact_votes
FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 3. 创建用户贡献度表
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_contributions (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,

    -- 统计字段
    total_posts INTEGER DEFAULT 0,
    fact_posts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    fact_votes_received INTEGER DEFAULT 0,
    avg_agree_rate DECIMAL(5,4) DEFAULT 0,  -- 0.0000 - 1.0000
    votes_given INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_contributions_score ON public.user_contributions(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_contributions_level ON public.user_contributions(level);

-- 注释
COMMENT ON TABLE public.user_contributions IS '用户贡献度统计';
COMMENT ON COLUMN public.user_contributions.score IS '总贡献分数';
COMMENT ON COLUMN public.user_contributions.level IS '用户等级 (1-5)';
COMMENT ON COLUMN public.user_contributions.fact_posts IS '真言帖数量';
COMMENT ON COLUMN public.user_contributions.avg_agree_rate IS '真言平均认可率';

-- RLS 策略
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

-- 所有人可查看贡献度
CREATE POLICY "Anyone can view contributions" ON public.user_contributions
FOR SELECT USING (true);

-- 系统可更新贡献度 (通过服务角色)
CREATE POLICY "Service can manage contributions" ON public.user_contributions
FOR ALL USING (true);

-- ==========================================
-- 4. 创建帖子收藏表
-- ==========================================

CREATE TABLE IF NOT EXISTS public.post_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(post_id, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);

-- 注释
COMMENT ON TABLE public.post_saves IS '帖子收藏';

-- RLS 策略
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view saves count" ON public.post_saves
FOR SELECT USING (true);

CREATE POLICY "Users can save posts" ON public.post_saves
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" ON public.post_saves
FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 5. 触发器: 自动更新共识统计
-- ==========================================

CREATE OR REPLACE FUNCTION update_post_consensus()
RETURNS TRIGGER AS $$
DECLARE
    vote_counts RECORD;
    total_votes INTEGER;
    agree_rate DECIMAL;
    disagree_rate DECIMAL;
    new_level VARCHAR(20);
BEGIN
    -- 统计投票
    SELECT
        COALESCE(SUM(CASE WHEN vote_type = 'agree' THEN 1 ELSE 0 END), 0) as agree,
        COALESCE(SUM(CASE WHEN vote_type = 'partial' THEN 1 ELSE 0 END), 0) as partial,
        COALESCE(SUM(CASE WHEN vote_type = 'disagree' THEN 1 ELSE 0 END), 0) as disagree,
        COALESCE(SUM(CASE WHEN vote_type = 'uncertain' THEN 1 ELSE 0 END), 0) as uncertain,
        COUNT(*) as total
    INTO vote_counts
    FROM public.fact_votes
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id);

    total_votes := vote_counts.total;

    -- 计算共识等级
    IF total_votes < 3 THEN
        new_level := 'PENDING';
    ELSE
        agree_rate := vote_counts.agree::DECIMAL / total_votes;
        disagree_rate := vote_counts.disagree::DECIMAL / total_votes;

        IF disagree_rate >= 0.30 THEN
            new_level := 'CONTROVERSIAL';
        ELSIF agree_rate >= 0.70 AND total_votes >= 10 THEN
            new_level := 'HIGH';
        ELSIF agree_rate >= 0.50 AND total_votes >= 5 THEN
            new_level := 'MEDIUM';
        ELSE
            new_level := 'LOW';
        END IF;
    END IF;

    -- 更新帖子共识数据
    UPDATE public.community_posts
    SET consensus = jsonb_build_object(
        'agree', vote_counts.agree,
        'partial', vote_counts.partial,
        'disagree', vote_counts.disagree,
        'uncertain', vote_counts.uncertain,
        'totalVotes', total_votes,
        'level', new_level
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_consensus_on_vote ON public.fact_votes;
CREATE TRIGGER trigger_update_consensus_on_vote
AFTER INSERT OR UPDATE OR DELETE ON public.fact_votes
FOR EACH ROW EXECUTE FUNCTION update_post_consensus();

-- ==========================================
-- 6. 触发器: 自动更新收藏数
-- ==========================================

CREATE OR REPLACE FUNCTION update_post_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts
        SET save_count = save_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts
        SET save_count = GREATEST(save_count - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_save_count ON public.post_saves;
CREATE TRIGGER trigger_update_save_count
AFTER INSERT OR DELETE ON public.post_saves
FOR EACH ROW EXECUTE FUNCTION update_post_save_count();

-- ==========================================
-- 7. 函数: 计算用户贡献度
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_user_contribution(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_posts INTEGER;
    v_fact_posts INTEGER;
    v_total_comments INTEGER;
    v_likes_received INTEGER;
    v_fact_votes_received INTEGER;
    v_avg_agree_rate DECIMAL;
    v_votes_given INTEGER;
    v_score INTEGER;
    v_level INTEGER;
BEGIN
    -- 统计帖子数
    SELECT COUNT(*), COALESCE(SUM(CASE WHEN is_fact THEN 1 ELSE 0 END), 0)
    INTO v_total_posts, v_fact_posts
    FROM public.community_posts
    WHERE author_id = p_user_id AND status = 'ACTIVE';

    -- 统计评论数
    SELECT COUNT(*)
    INTO v_total_comments
    FROM public.community_comments
    WHERE author_id = p_user_id;

    -- 统计获得的点赞数
    SELECT COALESCE(SUM(like_count), 0)
    INTO v_likes_received
    FROM public.community_posts
    WHERE author_id = p_user_id;

    -- 统计真言获得的投票数
    SELECT COUNT(*)
    INTO v_fact_votes_received
    FROM public.fact_votes fv
    JOIN public.community_posts cp ON fv.post_id = cp.id
    WHERE cp.author_id = p_user_id;

    -- 计算平均认可率
    SELECT COALESCE(AVG(
        CASE WHEN (consensus->>'totalVotes')::INTEGER > 0
        THEN (consensus->>'agree')::DECIMAL / (consensus->>'totalVotes')::INTEGER
        ELSE 0 END
    ), 0)
    INTO v_avg_agree_rate
    FROM public.community_posts
    WHERE author_id = p_user_id AND is_fact = TRUE;

    -- 统计参与投票次数
    SELECT COUNT(*)
    INTO v_votes_given
    FROM public.fact_votes
    WHERE user_id = p_user_id;

    -- 计算总分
    v_score := (
        v_total_posts * 5 +
        v_fact_posts * 20 +
        v_total_comments * 2 +
        v_likes_received * 1 +
        v_fact_votes_received * 3 +
        FLOOR(v_avg_agree_rate * 50) +
        v_votes_given * 1
    );

    -- 计算等级
    IF v_score >= 5000 THEN v_level := 5;
    ELSIF v_score >= 2000 THEN v_level := 4;
    ELSIF v_score >= 500 THEN v_level := 3;
    ELSIF v_score >= 100 THEN v_level := 2;
    ELSE v_level := 1;
    END IF;

    -- 更新或插入贡献度记录
    INSERT INTO public.user_contributions (
        user_id, score, level,
        total_posts, fact_posts, total_comments,
        likes_received, fact_votes_received, avg_agree_rate, votes_given,
        updated_at
    ) VALUES (
        p_user_id, v_score, v_level,
        v_total_posts, v_fact_posts, v_total_comments,
        v_likes_received, v_fact_votes_received, v_avg_agree_rate, v_votes_given,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        score = EXCLUDED.score,
        level = EXCLUDED.level,
        total_posts = EXCLUDED.total_posts,
        fact_posts = EXCLUDED.fact_posts,
        total_comments = EXCLUDED.total_comments,
        likes_received = EXCLUDED.likes_received,
        fact_votes_received = EXCLUDED.fact_votes_received,
        avg_agree_rate = EXCLUDED.avg_agree_rate,
        votes_given = EXCLUDED.votes_given,
        updated_at = NOW();

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 8. 初始化: 为现有帖子设置默认值
-- ==========================================

UPDATE public.community_posts
SET
    is_fact = FALSE,
    consensus = '{"agree":0,"partial":0,"disagree":0,"uncertain":0,"totalVotes":0,"level":"PENDING"}'
WHERE is_fact IS NULL;

-- ==========================================
-- 完成
-- ==========================================

-- 输出迁移结果
DO $$
BEGIN
    RAISE NOTICE 'JustTalk 真言系统迁移完成！';
    RAISE NOTICE '- community_posts 表已添加 is_fact, fact_data, consensus, save_count 字段';
    RAISE NOTICE '- fact_votes 表已创建';
    RAISE NOTICE '- user_contributions 表已创建';
    RAISE NOTICE '- post_saves 表已创建';
    RAISE NOTICE '- 触发器和函数已创建';
END $$;
