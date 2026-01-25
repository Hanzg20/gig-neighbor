-- ============================================
-- Coupon System Migration
-- Version: 1.0
-- Date: 2026-01-24
-- ============================================

-- 1. 优惠券表 (商家创建的优惠券)
CREATE TABLE IF NOT EXISTS provider_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

    -- 优惠码 (用户输入的字符串)
    code VARCHAR(20) NOT NULL,

    -- 基本信息
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- 折扣规则
    discount_type VARCHAR(20) NOT NULL,    -- 'percentage' | 'fixed'
    discount_value DECIMAL(10,2) NOT NULL, -- 20 = 20% 或 $20
    min_purchase DECIMAL(10,2) DEFAULT 0,  -- 最低消费门槛
    max_discount DECIMAL(10,2),            -- 最大折扣金额 (百分比时)

    -- 使用限制
    max_uses INTEGER,                      -- 总使用次数 (NULL=无限)
    max_uses_per_user INTEGER DEFAULT 1,   -- 每用户限用次数
    used_count INTEGER DEFAULT 0,          -- 已使用次数

    -- 有效期
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,

    -- 状态
    is_active BOOLEAN DEFAULT TRUE,

    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 约束
    CONSTRAINT provider_coupons_code_unique UNIQUE(provider_id, code),
    CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT valid_discount_value CHECK (discount_value > 0),
    CONSTRAINT valid_date_range CHECK (valid_until > valid_from)
);

-- 2. 优惠券使用记录表
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES provider_coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),

    -- 使用者 (支持游客)
    user_id UUID REFERENCES user_profiles(id),
    user_phone VARCHAR(20),

    -- 折扣详情
    original_amount DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,

    -- 核销信息 (线下核销时使用)
    redeemed_by UUID REFERENCES user_profiles(id),
    redemption_type VARCHAR(20) DEFAULT 'online', -- 'online' | 'offline'

    -- 时间戳
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_coupons_provider ON provider_coupons(provider_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON provider_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON provider_coupons(is_active, valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_phone ON coupon_redemptions(user_phone);
CREATE INDEX IF NOT EXISTS idx_redemptions_order ON coupon_redemptions(order_id);

-- ============================================
-- 触发器: 自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_coupon_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_coupon_updated_at ON provider_coupons;
CREATE TRIGGER trigger_coupon_updated_at
    BEFORE UPDATE ON provider_coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_updated_at();

-- ============================================
-- 触发器: 使用后自动更新 used_count
-- ============================================

CREATE OR REPLACE FUNCTION update_coupon_used_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE provider_coupons
    SET used_count = used_count + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_coupon_used_count ON coupon_redemptions;
CREATE TRIGGER trigger_update_coupon_used_count
    AFTER INSERT ON coupon_redemptions
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_used_count();

-- ============================================
-- RLS 策略
-- ============================================

ALTER TABLE provider_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- provider_coupons 策略

-- 商家可以查看自己的优惠券
DROP POLICY IF EXISTS "Providers can view own coupons" ON provider_coupons;
CREATE POLICY "Providers can view own coupons" ON provider_coupons
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM provider_profiles WHERE user_id = auth.uid()
        )
    );

-- 商家可以创建优惠券
DROP POLICY IF EXISTS "Providers can create coupons" ON provider_coupons;
CREATE POLICY "Providers can create coupons" ON provider_coupons
    FOR INSERT WITH CHECK (
        provider_id IN (
            SELECT id FROM provider_profiles WHERE user_id = auth.uid()
        )
    );

-- 商家可以更新自己的优惠券
DROP POLICY IF EXISTS "Providers can update own coupons" ON provider_coupons;
CREATE POLICY "Providers can update own coupons" ON provider_coupons
    FOR UPDATE USING (
        provider_id IN (
            SELECT id FROM provider_profiles WHERE user_id = auth.uid()
        )
    );

-- 商家可以删除自己的优惠券
DROP POLICY IF EXISTS "Providers can delete own coupons" ON provider_coupons;
CREATE POLICY "Providers can delete own coupons" ON provider_coupons
    FOR DELETE USING (
        provider_id IN (
            SELECT id FROM provider_profiles WHERE user_id = auth.uid()
        )
    );

-- 所有人可以查看有效的优惠券 (用于验证)
DROP POLICY IF EXISTS "Anyone can view active coupons for validation" ON provider_coupons;
CREATE POLICY "Anyone can view active coupons for validation" ON provider_coupons
    FOR SELECT USING (is_active = true AND valid_until > NOW());

-- coupon_redemptions 策略

-- 商家可以查看自己优惠券的使用记录
DROP POLICY IF EXISTS "Providers can view own coupon redemptions" ON coupon_redemptions;
CREATE POLICY "Providers can view own coupon redemptions" ON coupon_redemptions
    FOR SELECT USING (
        coupon_id IN (
            SELECT id FROM provider_coupons WHERE provider_id IN (
                SELECT id FROM provider_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 允许插入使用记录 (验证在应用层)
DROP POLICY IF EXISTS "Allow insert redemptions" ON coupon_redemptions;
CREATE POLICY "Allow insert redemptions" ON coupon_redemptions
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 验证优惠码的函数 (原子操作)
-- ============================================

CREATE OR REPLACE FUNCTION validate_and_apply_coupon(
    p_code VARCHAR,
    p_provider_id UUID,
    p_amount DECIMAL,
    p_user_id UUID DEFAULT NULL,
    p_user_phone VARCHAR DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_coupon RECORD;
    v_user_redemption_count INTEGER;
    v_discount DECIMAL;
    v_final_amount DECIMAL;
BEGIN
    -- 查找优惠券
    SELECT * INTO v_coupon
    FROM provider_coupons
    WHERE provider_id = p_provider_id
      AND code = p_code
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'invalid_code',
            'message', '优惠码不存在'
        );
    END IF;

    -- 检查有效期
    IF NOW() < v_coupon.valid_from THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'coupon_not_started',
            'message', '优惠券未开始'
        );
    END IF;

    IF NOW() > v_coupon.valid_until THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'coupon_expired',
            'message', '优惠券已过期'
        );
    END IF;

    -- 检查使用次数
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'coupon_exhausted',
            'message', '优惠券已用完'
        );
    END IF;

    -- 检查用户使用次数 (如果有用户信息)
    IF v_coupon.max_uses_per_user IS NOT NULL AND (p_user_id IS NOT NULL OR p_user_phone IS NOT NULL) THEN
        SELECT COUNT(*) INTO v_user_redemption_count
        FROM coupon_redemptions
        WHERE coupon_id = v_coupon.id
          AND (
              (p_user_id IS NOT NULL AND user_id = p_user_id) OR
              (p_user_phone IS NOT NULL AND user_phone = p_user_phone)
          );

        IF v_user_redemption_count >= v_coupon.max_uses_per_user THEN
            RETURN json_build_object(
                'valid', false,
                'error', 'user_limit_exceeded',
                'message', '您已达到使用上限'
            );
        END IF;
    END IF;

    -- 检查最低消费
    IF p_amount < v_coupon.min_purchase THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'min_purchase_not_met',
            'message', '需满 $' || v_coupon.min_purchase || ' 可用'
        );
    END IF;

    -- 计算折扣
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := p_amount * (v_coupon.discount_value / 100);
        -- 应用最大折扣限制
        IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
            v_discount := v_coupon.max_discount;
        END IF;
    ELSE
        v_discount := LEAST(v_coupon.discount_value, p_amount);
    END IF;

    v_final_amount := GREATEST(0, p_amount - v_discount);

    RETURN json_build_object(
        'valid', true,
        'coupon_id', v_coupon.id,
        'coupon_name', v_coupon.name,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'discount_amount', v_discount,
        'final_amount', v_final_amount,
        'message', '优惠码有效，已优惠 $' || v_discount
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 核销优惠券的函数 (线下使用)
-- ============================================

CREATE OR REPLACE FUNCTION redeem_coupon_offline(
    p_code VARCHAR,
    p_provider_id UUID,
    p_redeemed_by UUID
) RETURNS JSON AS $$
DECLARE
    v_coupon RECORD;
    v_redemption_id UUID;
BEGIN
    -- 查找并锁定优惠券
    SELECT * INTO v_coupon
    FROM provider_coupons
    WHERE provider_id = p_provider_id
      AND code = p_code
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', '优惠码不存在');
    END IF;

    IF NOW() > v_coupon.valid_until THEN
        RETURN json_build_object('success', false, 'error', '优惠券已过期');
    END IF;

    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN json_build_object('success', false, 'error', '优惠券已用完');
    END IF;

    -- 创建核销记录
    INSERT INTO coupon_redemptions (
        coupon_id,
        original_amount,
        discount_applied,
        final_amount,
        redeemed_by,
        redemption_type
    ) VALUES (
        v_coupon.id,
        0, -- 线下核销不记录金额
        0,
        0,
        p_redeemed_by,
        'offline'
    ) RETURNING id INTO v_redemption_id;

    RETURN json_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'coupon_name', v_coupon.name,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'message', '核销成功'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 完成
-- ============================================

COMMENT ON TABLE provider_coupons IS '商家优惠券表';
COMMENT ON TABLE coupon_redemptions IS '优惠券使用记录表';
COMMENT ON FUNCTION validate_and_apply_coupon IS '验证并计算优惠码折扣';
COMMENT ON FUNCTION redeem_coupon_offline IS '线下核销优惠券';
