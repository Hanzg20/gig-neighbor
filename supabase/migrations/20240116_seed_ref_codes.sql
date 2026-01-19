-- ==========================================
-- SEED DATA: REFERENCE CODES v2 (Aligned with seed_data.sql)
-- Purpose: Populate Categories and Nodes consistent with project standards.
-- ==========================================

-- 1. NODES (Community Launch Sites)
INSERT INTO public.ref_codes (code_id, type, zh_name, en_name, extra_data, sort_order) VALUES
('NODE_LEES', 'NODE', '渥太华-利斯 (Lees Ave)', 'Ottawa-Lees', '{"city": "Ottawa", "postal_prefix": "K1S", "cluster": "Student/Urban"}', 1),
('NODE_KANATA', 'NODE', '渥太华-卡纳塔 (Kanata Lakes)', 'Ottawa-Kanata', '{"city": "Ottawa", "postal_prefix": "K2K", "cluster": "Suburban/Family"}', 2),
('NODE_ORLEANS', 'NODE', '渥太华-奥尔良 (Orleans)', 'Ottawa-Orleans', '{"city": "Ottawa", "postal_prefix": "K1E", "cluster": "Family/Growing"}', 3),
('NODE_BARRHAVEN', 'NODE', '渥太华-巴尔黑文 (Barrhaven)', 'Ottawa-Barrhaven', '{"city": "Ottawa", "postal_prefix": "K2J", "cluster": "Suburban/Family"}', 4),
('NODE_DOWNTOWN', 'NODE', '渥太华-市中心 (Downtown)', 'Ottawa-Downtown', '{"city": "Ottawa", "postal_prefix": "K1P", "cluster": "Urban/Professional"}', 5)
ON CONFLICT (code_id) DO UPDATE SET 
    zh_name = EXCLUDED.zh_name,
    en_name = EXCLUDED.en_name,
    extra_data = EXCLUDED.extra_data;

-- 2. INDUSTRIES (Top Level)
INSERT INTO public.ref_codes (code_id, type, zh_name, en_name, sort_order) VALUES
('1010000', 'INDUSTRY', '居家生活', 'Home & Life', 1),
('1020000', 'INDUSTRY', '专业美业', 'Pro & Beauty', 2),
('1030000', 'INDUSTRY', '育儿教育', 'Kids & Wellness', 3),
('1040000', 'INDUSTRY', '美食市集', 'Food & Market', 4),
('1050000', 'INDUSTRY', '出行时令', 'Travel & Outdoor', 5)
ON CONFLICT (code_id) DO NOTHING;

-- 3. CATEGORIES (Sub Level - Essential mappings for frontend defaults)
-- NOTE: Frontend might default to 'GENERAL' or specific IDs. 
-- We map standard ones here to cover "Service" (1020xxx) and "Goods" (1040xxx).

-- General Fallback (if strictly needed by code, though should move to numeric)
INSERT INTO public.ref_codes (code_id, type, zh_name, en_name, sort_order) VALUES
('GENERAL', 'CATEGORY', '通用', 'General', 99)
ON CONFLICT (code_id) DO NOTHING;

-- Home & Services
INSERT INTO public.ref_codes (code_id, parent_id, type, zh_name, en_name, sort_order) VALUES
('1010100', '1010000', 'CATEGORY', '居家清洁', 'Cleaning', 1),
('1010500', '1010000', 'CATEGORY', '搬家互助', 'Moving Help', 5);

-- Pro Services
INSERT INTO public.ref_codes (code_id, parent_id, type, zh_name, en_name, sort_order) VALUES
('1020100', '1020000', 'CATEGORY', '持证电工', 'Electrician', 1);

-- Market / Goods
INSERT INTO public.ref_codes (code_id, parent_id, type, zh_name, en_name, sort_order) VALUES
('1040200', '1040000', 'CATEGORY', '二手市集', 'Used Goods', 2),
('1040600', '1040000', 'CATEGORY', '社区美食', 'Home Food', 6);

-- Travel
INSERT INTO public.ref_codes (code_id, parent_id, type, zh_name, en_name, sort_order) VALUES
('1050600', '1050000', 'CATEGORY', '顺风车', 'Carpool', 6);

-- Handling Conflicts for Categories
-- Using a DO block or separate statements is fine, but simple Insert-On-Conflict matches standard practice.
-- Since the above INSERTs might fail if parent_id doesn't exist (though we inserted Industries first), strict ordering matters.

-- Force reload schema cache
NOTIFY pgrst, 'reload config';
