-- 🍁 Seed Data for HangHand Platform - CANADA VERSION
-- Version: 4.1
-- Date: 2026-01-05
-- Reason: Consolidate maintenance scripts, fix node types, and add profile recovery logic.
-- Execute this after supabase_schema.sql

-- ============================================================================
-- 1. REF CODES (Categories & Nodes)
-- ============================================================================
 delete from public.ref_codes;
-- Top-Level Business Domains (Meituan-Inspired Lifestyle Buckets)
INSERT INTO public.ref_codes (code_id, type, en_name, zh_name, extra_data, sort_order) VALUES
('1010000', 'INDUSTRY', 'Home & Life', '居家生活', '{"icon": "HeartHandshake", "color": "#10b981", "desc": "Everyday home maintenance and errands"}', 1),
('1020000', 'INDUSTRY', 'Pro & Beauty', '专业美业', '{"icon": "Crown", "color": "#dc2626", "requiresLicense": true, "desc": "Licensed pros and personal styling"}', 2),
('1030000', 'INDUSTRY', 'Kids & Wellness', '育儿教育', '{"icon": "Sparkles", "color": "#8b5cf6", "desc": "Childcare, tutoring, and personal care"}', 3),
('1040000', 'INDUSTRY', 'Food & Market', '美食市集', '{"icon": "Utensils", "color": "#f59e0b", "desc": "Community eats and local marketplace"}', 4),
('1050000', 'INDUSTRY', 'Travel & Outdoor', '出行时令', '{"icon": "PlaneTakeoff", "color": "#3b82f6", "desc": "Airport trips, carpool, and seasonal tasks"}', 5)
ON CONFLICT (code_id) DO UPDATE SET 
  en_name = EXCLUDED.en_name,
  zh_name = EXCLUDED.zh_name,
  extra_data = EXCLUDED.extra_data;
 
-- Community Nodes (Pilot Launch Sites)
INSERT INTO public.ref_codes (code_id, type, en_name, zh_name, extra_data, sort_order) VALUES
('NODE_LEES', 'NODE', 'Ottawa-Lees', '渥太华-利斯 (Lees Ave)', '{"city": "Ottawa", "postal_prefix": "K1S", "cluster": "Student/Urban"}', 1),
('NODE_KANATA', 'NODE', 'Ottawa-Kanata', '渥太华-卡纳塔 (Kanata Lakes)', '{"city": "Ottawa", "postal_prefix": "K2K", "cluster": "Suburban/Family"}', 2)
ON CONFLICT (code_id) DO UPDATE SET 
  type = EXCLUDED.type,
  en_name = EXCLUDED.en_name,
  zh_name = EXCLUDED.zh_name,
  extra_data = EXCLUDED.extra_data;
 
-- Tier 2: Subcategories (High Information Density, 7 per Industry)
INSERT INTO public.ref_codes (code_id, parent_id, type, en_name, zh_name, extra_data, sort_order) VALUES
-- 1010000: Home Help
('1010100', '1010000', 'CATEGORY', 'Cleaning', '居家清洁', '{"icon": "Sparkle"}', 1),
('1010200', '1010000', 'CATEGORY', 'Junk Removal', '垃圾清理', '{"icon": "Trash2"}', 2),
('1010300', '1010000', 'CATEGORY', 'Furniture Assembly', '家具组装', '{"icon": "Hammer"}', 3),
('1010400', '1010000', 'CATEGORY', 'Handyman', '居家维修', '{"icon": "Wrench"}', 4),
('1010500', '1010000', 'CATEGORY', 'Moving Help', '搬家互助', '{"icon": "Truck"}', 5),
('1010600', '1010000', 'CATEGORY', 'Errands', '跑腿代办', '{"icon": "Footprints"}', 6),
('1010700', '1010000', 'CATEGORY', 'Private Chef', '上门做饭', '{"icon": "ChefHat"}', 7),

-- 1020000: Pro Help
('1020100', '1020000', 'CATEGORY', 'Electrician', '持证电工', '{"icon": "Zap", "requiresLicense": true, "license": "ECRA"}', 1),
('1020200', '1020000', 'CATEGORY', 'Plumber', '持证水工', '{"icon": "Droplet", "requiresLicense": true}', 2),
('1020300', '1020000', 'CATEGORY', 'HVAC', '冷暖气片', '{"icon": "Wind", "requiresLicense": true}', 3),
('1020400', '1020000', 'CATEGORY', 'Appliance Repair', '家电维修', '{"icon": "Settings"}', 4),
('1020500', '1020000', 'CATEGORY', 'Real Estate', '房地产经纪', '{"icon": "Home", "requiresLicense": true, "license": "RECO"}', 5),
('1020600', '1020000', 'CATEGORY', 'Beauty', '美业中心', '{"icon": "Scissors"}', 6),

-- 1030000: Wellness & Kids
('1030100', '1030000', 'CATEGORY', 'Pet Care', '宠物寄养', '{"icon": "Dog"}', 1),
('1030200', '1030000', 'CATEGORY', 'Tutoring', '邻里辅导', '{"icon": "BookOpen"}', 2),
('1030300', '1030000', 'CATEGORY', 'Massage', '按摩理疗', '{"icon": "Waves", "requiresLicense": true}', 3),
('1030400', '1030000', 'CATEGORY', 'Fitness', '私人健身', '{"icon": "Dumbbell"}', 4),
('1030500', '1030000', 'CATEGORY', 'Childcare', '育儿母婴', '{"icon": "Baby"}', 5),
('1030600', '1030000', 'CATEGORY', 'After School', '课后托管', '{"icon": "Clock"}', 6),
('1030700', '1030000', 'CATEGORY', 'Classes', '兴趣班', '{"icon": "Palette"}', 7),

-- 1040000: Marketplace & Food
('1040100', '1040000', 'CATEGORY', 'Free & Share', '免费领', '{"icon": "Heart"}', 1),
('1040200', '1040000', 'CATEGORY', 'Used Goods', '二手市集', '{"icon": "ShoppingBag"}', 2),
('1040300', '1040000', 'CATEGORY', 'Tool Rental', '工具租赁', '{"icon": "Construction", "pricing": "Daily"}', 3),
('1040400', '1040000', 'CATEGORY', 'Sports Gear', '运动装备', '{"icon": "Bike"}', 4),
('1040500', '1040000', 'CATEGORY', 'Food Sharing', '邻里食光', '{"icon": "Utensils"}', 5),
('1040600', '1040000', 'CATEGORY', 'Home Food', '社区美食', '{"icon": "Soup"}', 6),
('1040700', '1040000', 'CATEGORY', 'Local Eats', '餐厅美食', '{"icon": "Utensils"}', 7),

-- 1050000: Travel & Seasonal
('1050100', '1050000', 'CATEGORY', 'Snow Clearing', '铲雪互助', '{"icon": "Snowflake", "season": "Winter"}', 1),
('1050200', '1050000', 'CATEGORY', 'Lawn Care', '割草养护', '{"icon": "Scissors", "season": "Summer"}', 2),
('1050300', '1050000', 'CATEGORY', 'Leaf Raking', '落叶清理', '{"icon": "Wind", "season": "Fall"}', 3),
('1050400', '1050000', 'CATEGORY', 'Gutter Cleaning', '屋檐清理', '{"icon": "Pipette"}', 4),
('1050500', '1050000', 'CATEGORY', 'Pest Control', '时令驱虫', '{"icon": "Bug"}', 5),
('1050600', '1050000', 'CATEGORY', 'Carpool', '顺风车', '{"icon": "Car"}', 6),
('1050700', '1050000', 'CATEGORY', 'Airport Trip', '机场接送', '{"icon": "PlaneTakeoff"}', 7)
ON CONFLICT (code_id) DO UPDATE SET 
  en_name = EXCLUDED.en_name,
  zh_name = EXCLUDED.zh_name,
  extra_data = EXCLUDED.extra_data;

-- ============================================================================
-- 2. ROLES & PERMISSIONS
-- ============================================================================

INSERT INTO public.roles (id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'BUYER', 'Regular user browsing services'),
('00000000-0000-0000-0000-000000000002', 'PROVIDER', 'Neighbor helper or merchant'),
('00000000-0000-0000-0000-000000000003', 'VERIFIED_PRO', 'Licensed professional (Level 5)'),
('00000000-0000-0000-0000-000000000004', 'ADMIN', 'Platform moderator')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.permissions (id, name, description) VALUES
('10000000-0000-0000-0000-000000000001', 'VIEW_LISTINGS', 'Can view all listings'),
('10000000-0000-0000-0000-000000000002', 'POST_REVIEW', 'Can post reviews'),
('10000000-0000-0000-0000-000000000003', 'MANAGE_LISTINGS', 'Can manage own listings'),
('10000000-0000-0000-0000-000000000004', 'CREATE_ORDER', 'Can create orders')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Assign Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 3. MOCK PROFILES (For Dev Testing)
-- ============================================================================

-- We assume Auth IDs for these users exist or we just use static ones for local dev
-- User A: "Lao Wang" (Provider in Kanata)
-- User B: "Xiao Li" (Buyer in Lees)

-- ============================================================================
-- 4. JINBEAN SYSTEM SEED
-- ============================================================================

-- Initial reference data or specific point rules could go here.

-- ============================================================================
-- 5. MAINTENANCE: PROFILE RECOVERY
-- ============================================================================
-- Added: 2026-01-05
-- Ensures users registered during trigger failures have valid profiles.

INSERT INTO public.user_profiles (id, email, name, node_id, beans_balance, roles, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'Neighbor'), 
    COALESCE(raw_user_meta_data->>'nodeId', 'NODE_LEES'),
    0,
    ARRAY['BUYER']::TEXT[],
    created_at,
    updated_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 🍁 USAGE NOTES
-- ============================================================================
-- 2. MOCK DATA (Ottawa Pilot)
-- ============================================================================

-- 2.1 Mock Provider (Dynamic Association)
-- This block ensures a provider profile exists for a real user.
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Provider Profile
        INSERT INTO public.provider_profiles (id, user_id, business_name_en, business_name_zh, identity, is_verified, verification_level, stats, location_address, insurance_summary_en, license_info) VALUES
        ('11111111-1111-1111-1111-111111111111', target_user_id, 'Kanata Home Care', '卡纳塔居家服务', 'NEIGHBOR', true, 3, '{"total_orders": 12, "average_rating": 4.9}', 'Kanata Lakes, Ottawa', '$2M Liability Coverage', 'Ottawa Business Lic. #54921'),
        ('22222222-2222-2222-2222-222222222222', target_user_id, 'UOttawa Student Gear', '渥大留学生器材', 'NEIGHBOR', true, 2, '{"total_orders": 45, "average_rating": 4.7}', '170 Lees Ave, Ottawa', 'Equipment Damage Protection', 'Student Identity Verified')
        ON CONFLICT (id) DO UPDATE SET
          business_name_en = EXCLUDED.business_name_en,
          business_name_zh = EXCLUDED.business_name_zh,
          insurance_summary_en = EXCLUDED.insurance_summary_en,
          license_info = EXCLUDED.license_info;

        -- Listing Masters
        INSERT INTO public.listing_masters (id, provider_id, title_en, title_zh, description_en, images, type, category_id, node_id, status, location_address) VALUES
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Driveway Power Washing', '车道高压清洗', 'Professional power washing for your driveway and walkways.', ARRAY['https://images.unsplash.com/photo-1520220663982-f0945f220f18?auto=format&fit=crop&q=80&w=800'], 'SERVICE', '1010100', 'NODE_KANATA', 'PUBLISHED', 'Kanata Lakes, Ottawa'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'DeWalt Cordless Drill 20V', 'DeWalt 20V 充电钻', 'High-power DeWalt drill with two batteries.', ARRAY['https://images.unsplash.com/photo-1540103359328-3bc92bcfe131?auto=format&fit=crop&q=80&w=800'], 'RENTAL', '1040300', 'NODE_LEES', 'PUBLISHED', '170 Lees Ave, Ottawa')
        ON CONFLICT (id) DO UPDATE SET title_en = EXCLUDED.title_en;

        -- Listing Items
        INSERT INTO public.listing_items (id, master_id, name_en, name_zh, description_en, price_amount, price_unit, deposit_amount, pricing_model, status) VALUES
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Standard (2-Car)', '标准车道', 'Full cleaning.', 8500, 'service', 0, 'FIXED', 'AVAILABLE'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Daily Rental', '日租', 'Includes drill/case.', 1500, 'day', 10000, 'DAILY', 'AVAILABLE')
        ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en;
    END IF;
END $$;

-- ============================================================================
-- 3. MAINTENANCE LOG & SUMMARY
-- ============================================================================
-- 1. All categories humanized per Neighborly Warmth philosophy.
-- 2. Ottawa Pilot Nodes established (Kanata/Lees).
-- 3. Dynamic Mock Data included for English-first testing.
-- 4. Unified Seed Version 4.2


-- 🍁 Pilot Seed Data: English-First (Ottawa Kanata & Lees)
-- Author: Antigravity
-- Date: 2026-01-05

-- 1. Mock Providers
INSERT INTO public.provider_profiles (id, user_id, business_name_en, identity, is_verified, verification_level, stats, location) VALUES
('11111111-1111-1111-1111-111111111111', 'u1', 'Kanata Home Care', 'NEIGHBOR', true, 3, '{"totalOrders": 12, "averageRating": 4.9, "reviewCount": 8}', '{"lat": 45.3483, "lng": -75.9221, "address": "Kanata Lakes, Ottawa", "radiusKm": 5}'),
('22222222-2222-2222-2222-222222222222', 'u1', 'UOttawa Student Gear', 'NEIGHBOR', true, 2, '{"totalOrders": 45, "averageRating": 4.7, "reviewCount": 32}', '{"lat": 45.4215, "lng": -75.6819, "address": "170 Lees Ave, Ottawa", "radiusKm": 2}')
ON CONFLICT (id) DO UPDATE SET
  business_name_en = EXCLUDED.business_name_en,
  location = EXCLUDED.location;

-- 2. Listing Masters
INSERT INTO public.listing_masters (id, provider_id, title_en, description_en, images, type, category_id, node_id, status, tags, location) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Driveway Power Washing', 'Professional power washing for your driveway and walkways. We remove all stains, moss, and winter salt.', 
ARRAY['https://images.unsplash.com/photo-1520220663982-f0945f220f18?auto=format&fit=crop&q=80&w=800'], 
'SERVICE', '1010100', 'NODE_KANATA', 'PUBLISHED', ARRAY['Kanata', 'Cleanup', 'Service'], '{"fullAddress": "Kanata Lakes, Ottawa"}'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'DeWalt Cordless Drill 20V', 'High-power DeWalt drill with two batteries and a charger. Perfect for home DIY or furniture assembly.', 
ARRAY['https://images.unsplash.com/photo-1540103359328-3bc92bcfe131?auto=format&fit=crop&q=80&w=800'], 
'RENTAL', '1040300', 'NODE_LEES', 'PUBLISHED', ARRAY['Lees', 'Tools', 'DIY'], '{"fullAddress": "170 Lees Ave, Ottawa"}')
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  description_en = EXCLUDED.description_en,
  status = EXCLUDED.status;

-- 3. Listing Items (SKUs)
INSERT INTO public.listing_items (id, master_id, name_en, description_en, pricing, status) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Standard Driveway (2-Car)', 'Full cleaning of a standard family driveway.', '{"model": "FIXED", "price": {"amount": 8500, "currency": "CAD", "formatted": "$85.00"}, "unit": "per service"}', 'AVAILABLE'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Large Driveway (4-Car+)', 'Specialized for larger properties or interlocking stone.', '{"model": "FIXED", "price": {"amount": 15000, "currency": "CAD", "formatted": "$150.00"}, "unit": "per service"}', 'AVAILABLE'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Daily Rental', 'Includes drill, 2 batteries, and hard case.', '{"model": "DAILY", "price": {"amount": 1500, "currency": "CAD", "formatted": "$15.00"}, "unit": "per day", "deposit": {"amount": 10000, "currency": "CAD", "formatted": "$100.00"}}', 'AVAILABLE'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Weekend Special (3 Days)', 'Pick up Friday, return Monday.', '{"model": "FIXED", "price": {"amount": 3500, "currency": "CAD", "formatted": "$35.00"}, "unit": "per weekend", "deposit": {"amount": 10000, "currency": "CAD", "formatted": "$100.00"}}', 'AVAILABLE'),
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Custom Interlocking Repair', 'Requires on-site assessment for accurate quote.', '{"model": "QUOTE", "price": {"amount": 0, "currency": "CAD", "formatted": "$0.00"}, "unit": "per project"}', 'AVAILABLE'),
('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'On-Site Assessment', 'Professional visit to inspect property and provide detailed quote.', '{"model": "VISIT_FEE", "price": {"amount": 5000, "currency": "CAD", "formatted": "$50.00"}, "unit": "per visit"}', 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  pricing = EXCLUDED.pricing;
-- ============================================================================
-- 4. GOODS & TASKS TEST DATA
-- ============================================================================

-- Seed a Provider
INSERT INTO public.providers (id, user_id, business_name_zh, business_name_en, identity, status, location, stats)
VALUES 
('prov_test_01', 'user_hv1', 'Test Neighbor', 'Test Neighbor', 'NEIGHBOR', 'APPROVED', '{"address": "123 Test St", "city": "Kanata"}', '{"averageRating": 4.8, "reviewCount": 10, "totalOrders": 5}')
ON CONFLICT (id) DO NOTHING;

-- Seed a Good (Nintendo Switch)
INSERT INTO public.listing_masters (
    id, provider_id, title_zh, title_en, description_zh, description_en, 
    images, type, category_id, node_id, status, metadata, tags, location
)
VALUES (
    'good_001', 'prov_test_01', '99新 Switch OLED', 'Switch OLED Like New', 
    '买了吃灰，箱说全，带塞尔达卡带。', 'Bought but never used. Complete in box with Zelda.',
    ARRAY['https://images.unsplash.com/photo-1578303512597-81de50a55058?auto=format&fit=crop&q=80&w=1000'],
    'GOODS', 'cat_elec', 'node_kanata', 'PUBLISHED',
    '{"deliveryOptions": ["PICKUP", "DELIVERY"]}',
    ARRAY['Electronics', 'Gaming'],
    '{"address": "Kanata Lakes", "city": "Ottawa"}'
) ON CONFLICT (id) DO UPDATE SET title_zh = EXCLUDED.title_zh;

INSERT INTO public.listing_items (
    id, master_id, name_zh, price_amount, pricing_model, attributes, status
)
VALUES (
    'item_good_001', 'good_001', 'Switch OLED', 180000, 'FIXED', 
    '{"condition": "LIKE_NEW", "delivery": ["PICKUP"]}', 'AVAILABLE'
) ON CONFLICT (id) DO UPDATE SET name_zh = EXCLUDED.name_zh;

-- Seed a Task (Move Sofa)
INSERT INTO public.listing_masters (
    id, provider_id, title_zh, title_en, description_zh, description_en, 
    images, type, category_id, node_id, status, metadata, tags, location
)
VALUES (
    'task_001', 'prov_test_01', '求帮搬沙发上楼', 'Help moving sofa', 
    '沙发在楼下车库，需要两个人搬到二楼，有电梯但是沙发太长进不去，需要走楼梯。', 'Sofa in garage, need 2 ppl to move to 2nd floor via stairs.',
    ARRAY['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=1000'],
    'TASK', 'cat_home', 'node_kanata', 'PUBLISHED',
    '{}',
    ARRAY['Moving', 'Heavy'],
    '{"address": "Kanata Lakes", "city": "Ottawa"}'
) ON CONFLICT (id) DO UPDATE SET title_zh = EXCLUDED.title_zh;

INSERT INTO public.listing_items (
    id, master_id, name_zh, price_amount, pricing_model, attributes, status
)
VALUES (
    'item_task_001', 'task_001', '搬运服务', 5000, 'BUDGET', 
    '{"urgency": "HIGH", "locationType": "ON_SITE", "address": "123 Kanata Ave"}', 'AVAILABLE'
) ON CONFLICT (id) DO UPDATE SET name_zh = EXCLUDED.name_zh;
