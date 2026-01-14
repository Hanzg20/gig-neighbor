-- 🍁 Seed Data for HangHand Platform - CANADA VERSION
-- Version: 5.0 (Discovery Plus)
-- Date: 2026-01-13
-- Reason: Consolidate maintenance scripts, add GigBridge stations, and PostGIS test markers.
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

  - ==========================================
-- GIG NEIGHBOR - BATCH LISTING DATA
-- 专业服务 + 美业 + 交通出行
-- Generated: 2026-01-06
-- ==========================================

-- ==========================================
-- ADDITIONAL NODES (社区节点扩展)
-- ==========================================
INSERT INTO public.ref_codes (code_id, type, en_name, zh_name, extra_data, sort_order) VALUES
('NODE_LEES', 'NODE', 'Ottawa-Lees', '渥太华-利斯 (Lees Ave)', '{"city": "Ottawa", "postal_prefix": "K1S", "cluster": "Student/Urban"}', 1),
('NODE_KANATA', 'NODE', 'Ottawa-Kanata', '渥太华-卡纳塔 (Kanata Lakes)', '{"city": "Ottawa", "postal_prefix": "K2K", "cluster": "Suburban/Family"}', 2),
('NODE_ORLEANS', 'NODE', 'Ottawa-Orleans', '渥太华-奥尔良 (Orleans)', '{"city": "Ottawa", "postal_prefix": "K1E", "cluster": "Family/Growing"}', 3),
('NODE_BARRHAVEN', 'NODE', 'Ottawa-Barrhaven', '渥太华-巴尔黑文 (Barrhaven)', '{"city": "Ottawa", "postal_prefix": "K2J", "cluster": "Suburban/Family"}', 4),
('NODE_DOWNTOWN', 'NODE', 'Ottawa-Downtown', '渥太华-市中心 (Downtown)', '{"city": "Ottawa", "postal_prefix": "K1P", "cluster": "Urban/Professional"}', 5)
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
INSERT INTO public.listing_items (
  id,
  master_id,
  name_zh,
  name_en,
  description_zh,
  description_en,
  price_amount,
  price_currency,
  price_unit,
  deposit_amount,
  pricing_model,
  status,
  pricing
) VALUES
(
  '50d7e5f6-5a6b-4c83-7e6f-5a6b7c8d9e00',
  '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80',
  'Standard Driveway (2-Car)', -- name_zh (provided)
  'Standard Driveway (2-Car)', -- name_en
  NULL,
  'Full cleaning of a standard family driveway.',
  8500,
  'CAD',
  'per service',
  0,
  'FIXED',
  'AVAILABLE',
  '{"model": "FIXED", "price": {"amount": 8500, "currency": "CAD", "formatted": "$85.00"}, "unit": "per service"}'
),
(
  '60e8f6a7-4b5c-4d94-6f7a-6b7c8d9e0f10',
  '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80',
  'Large Driveway (4-Car+)',
  'Large Driveway (4-Car+)',
  NULL,
  'Specialized for larger properties or interlocking stone.',
  15000,
  'CAD',
  'per service',
  0,
  'FIXED',
  'AVAILABLE',
  '{"model": "FIXED", "price": {"amount": 15000, "currency": "CAD", "formatted": "$150.00"}, "unit": "per service"}'
),
(
  '70f9a7b8-3c4d-4e05-5a6b-7c8d9e0f1a20',
  '40c6d4e5-6f7a-4b72-8d5e-4f5a6b7c8d90',
  'Daily Rental-zh',
  'Daily Rental',
  NULL,
  'Includes drill, 2 batteries, and hard case.',
  1500,
  'CAD',
  'per day',
  10000,
  'DAILY',
  'AVAILABLE',
  '{"model": "DAILY", "price": {"amount": 1500, "currency": "CAD", "formatted": "$15.00"}, "unit": "per day", "deposit": {"amount": 10000, "currency": "CAD", "formatted": "$100.00"}}'
),
(
  '80a0b8c9-2d3e-4f16-4b5c-8d9e0f1a2b30',
  '40c6d4e5-6f7a-4b72-8d5e-4f5a6b7c8d90',
  'Weekend Special (3 Days)-zh',
  'Weekend Special (3 Days)',
  NULL,
  'Pick up Friday, return Monday.',
  3500,
  'CAD',
  'per weekend',
  10000,
  'FIXED',
  'AVAILABLE',
  '{"model": "FIXED", "price": {"amount": 3500, "currency": "CAD", "formatted": "$35.00"}, "unit": "per weekend", "deposit": {"amount": 10000, "currency": "CAD", "formatted": "$100.00"}}'
),
(
  '90b1c9da-1e2f-4a27-3c4d-9e0f1a2b3c40',
  '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80',
  'Custom Interlocking Repair-zh',
  'Custom Interlocking Repair',
  NULL,
  'Requires on-site assessment for accurate quote.',
  0,
  'CAD',
  'per project',
  0,
  'QUOTE',
  'AVAILABLE',
  '{"model": "QUOTE", "price": {"amount": 0, "currency": "CAD", "formatted": "$0.00"}, "unit": "per project"}'
),
(
  'a0c2dab1-0f1e-4b38-2d3e-0f1a2b3c4d50',
  '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80',
  'On-Site Assessment-zh',
  'On-Site Assessment',
  NULL,
  'Professional visit to inspect property and provide detailed quote.',
  5000,
  'CAD',
  'per visit',
  0,
  'VISIT_FEE',
  'AVAILABLE',
  '{"model": "VISIT_FEE", "price": {"amount": 5000, "currency": "CAD", "formatted": "$50.00"}, "unit": "per visit"}'
)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_zh = EXCLUDED.name_zh,
  description_en = EXCLUDED.description_en,
  price_amount = EXCLUDED.price_amount,
  price_currency = EXCLUDED.price_currency,
  price_unit = EXCLUDED.price_unit,
  deposit_amount = EXCLUDED.deposit_amount,
  pricing_model = EXCLUDED.pricing_model,
  pricing = EXCLUDED.pricing,
  status = EXCLUDED.status;





-- ==========================================
-- PROVIDER PROFILES (专业服务提供者)
-- ==========================================
INSERT INTO public.provider_profiles (
    id, user_id, business_name_zh, business_name_en,
    description_zh, description_en, identity, is_verified,
    badges, stats, location_address, service_radius_km,
    verification_level, status
) VALUES
(
    '777b3240-3506-47ba-856e-c97f97687e49',
    '16d48e8f-0952-4193-ab73-9e7f512b2996',
    '持证电工服务',
    'Licensed Electrician',
    '安省持证电工，ECRA认证。提供住宅电路安装、维修、升级服务。包括断路器更换、插座安装、照明改造等。24小时紧急服务可用。...',
    'Ontario licensed electrician with ECRA certification. Residential electrical installation, repair, and upgrades. Including breaker replacement, outlet...',
    'MERCHANT',
    true,
    ARRAY['top_rated'],
    '{"totalOrders": 47, "averageRating": 4.9, "totalIncome": 6204}',
    '渥太华-利斯, Ottawa',
    10.0,
    3,
    'ACTIVE'
),
(
    '58127e84-378c-4963-ba95-1ebadc97e239',
    '4ccc08eb-263b-4f40-9f44-5a5d1f1d44c1',
    '持证水暖工',
    'Licensed Plumber',
    '持证水暖工，专业管道维修安装。提供水龙头维修、马桶安装、管道疏通、热水器更换等服务。快速响应，质量保证。...',
    'Licensed plumber specializing in pipe repair and installation. Faucet repair, toilet installation, drain cleaning, water heater replacement. Fast resp...',
    'MERCHANT',
    false,
    ARRAY['experienced'],
    '{"totalOrders": 55, "averageRating": 4.6, "totalIncome": 24695}',
    '渥太华-卡纳塔, Ottawa',
    15.0,
    2,
    'ACTIVE'
),
(
    'e3cb8bb8-31e9-4a3f-954f-a6139f878404',
    'e1507f9e-7343-4474-a1da-301a213943ec',
    'RECO持证地产经纪',
    'RECO Licensed Real Estate Agent',
    'RECO持证地产经纪，服务渥太华及周边地区。精通买卖、租赁、投资咨询。熟悉华人社区需求，提供中英双语服务。免费市场评估。...',
    'RECO licensed real estate agent serving Ottawa and surrounding areas. Expert in buying, selling, leasing, and investment consultation. Familiar with C...',
    'MERCHANT',
    true,
    ARRAY['top_rated', 'experienced'],
    '{"totalOrders": 60, "averageRating": 4.9, "totalIncome": 14040}',
    '渥太华-奥尔良, Ottawa',
    10.0,
    3,
    'ACTIVE'
),
(
    '23d9d4e9-4ee2-442b-8dbb-45efe7374d1e',
    '16d48e8f-0952-4193-ab73-9e7f512b2996',
    '专业美甲美睫工作室',
    'Professional Nail & Lash Studio',
    '专业美甲美睫服务，持证美容师。提供凝胶美甲、光疗甲、睫毛嫁接、半永久眉眼唇等服务。使用进口材料，环境舒适卫生。...',
    'Professional nail and lash services by certified beautician. Gel nails, UV nails, lash extensions, semi-permanent makeup. Imported materials, comforta...',
    'MERCHANT',
    true,
    ARRAY['top_rated', 'experienced'],
    '{"totalOrders": 56, "averageRating": 4.8, "totalIncome": 6832}',
    '渥太华-巴尔黑文, Ottawa',
    25.0,
    3,
    'ACTIVE'
),
(
    '80134956-7b17-437c-9a26-24cbe827d25e',
    '4ccc08eb-263b-4f40-9f44-5a5d1f1d44c1',
    '社区理发服务',
    'Community Hair Salon',
    '邻里理发服务，经验丰富的发型师。提供男女剪发、染发、烫发等服务。价格实惠，预约方便。...',
    'Neighborhood hair services by experienced stylists. Men and women haircuts, coloring, perms. Affordable prices, easy booking....',
    'MERCHANT',
    false,
    ARRAY['top_rated'],
    '{"totalOrders": 21, "averageRating": 5.0, "totalIncome": 9891}',
    '渥太华-市中心, Ottawa',
    20.0,
    1,
    'ACTIVE'
),
(
    '447fbcd9-c748-4953-960b-92e2c8826b89',
    'e1507f9e-7343-4474-a1da-301a213943ec',
    '渥太华-多伦多顺风车',
    'Ottawa-Toronto Carpool',
    '渥太华往返多伦多顺风车服务，每周固定时间发车。舒适商务车，安全可靠。可在指定地点接送，支持大件行李。需提前预约。...',
    'Ottawa-Toronto carpool service with fixed weekly schedule. Comfortable business vehicle, safe and reliable. Pickup/dropoff at designated locations, la...',
    'MERCHANT',
    true,
    ARRAY['experienced'],
    '{"totalOrders": 54, "averageRating": 4.6, "totalIncome": 10206}',
    '渥太华-利斯, Ottawa',
    15.0,
    3,
    'ACTIVE'
),
(
    'f9690d49-f7bb-4191-9750-c9d8477e9b56',
    '16d48e8f-0952-4193-ab73-9e7f512b2996',
    '社区购物接送',
    'Community Shopping Shuttle',
    '每周定期前往T&T大统华、八方等华人超市购物接送服务。固定路线，按时出发，价格实惠。适合没有车的邻居。...',
    'Weekly shuttle to T&T, Asian supermarkets and Chinese groceries. Fixed routes, punctual departure, affordable. Perfect for neighbors without cars....',
    'MERCHANT',
    true,
    ARRAY['top_rated', 'experienced'],
    '{"totalOrders": 74, "averageRating": 4.8, "totalIncome": 22348}',
    '渥太华-卡纳塔, Ottawa',
    25.0,
    3,
    'ACTIVE'
),
(
    'c7c7c367-6847-4f2a-9dd9-793ec4efce57',
    '4ccc08eb-263b-4f40-9f44-5a5d1f1d44c1',
    '渥太华机场专业接送服务',
    'Ottawa Airport Professional Transfer',
    '提供24小时渥太华机场接送服务。准时可靠，舒适商务车。可提前预约，支持航班追踪。司机经验丰富，熟悉各区域路线。...',
    '24-hour Ottawa airport transfer service. Punctual and reliable, comfortable business vehicles. Advance booking available, flight tracking supported. E...',
    'MERCHANT',
    true,
    ARRAY['top_rated'],
    '{"totalOrders": 36, "averageRating": 4.9, "totalIncome": 13860}',
    '渥太华-奥尔良, Ottawa',
    10.0,
    3,
    'ACTIVE'
)
;


-- ==========================================
-- LISTING MASTERS (服务主表)
-- ==========================================
INSERT INTO public.listing_masters (
    id, provider_id, title_zh, title_en,
    description_zh, description_en, images, type,
    category_id, tags, status, location_address,
    rating, review_count, is_promoted, node_id,
    latitude, longitude
) VALUES
(
    '4c58b0f8-0a04-4a55-81a8-9f9111dd61fe',
    '777b3240-3506-47ba-856e-c97f97687e49',
    '持证电工服务 - ECRA认证',
    'Licensed Electrician - ECRA Certified',
    '安省持证电工，ECRA认证。提供住宅电路安装、维修、升级服务。包括断路器更换、插座安装、照明改造等。24小时紧急服务可用。',
    'Ontario licensed electrician with ECRA certification. Residential electrical installation, repair, and upgrades. Including breaker replacement, outlet installation, lighting renovation. 24-hour emergency service available.',
    ARRAY['https://images.unsplash.com/photo-1621905251189-08b45d6a269e'],
    'SERVICE',
    '1020100',
    ARRAY['electrician', 'professional'],
    'PUBLISHED',
    '渥太华-利斯, Ottawa',
    5.0,
    56,
    true,
    'NODE_LEES',
    45.4215,
    -75.6972
),
(
    '6d0c0929-4fbc-4b5c-b30c-bdefaf822039',
    '58127e84-378c-4963-ba95-1ebadc97e239',
    '持证水暖工 - 管道专家',
    'Licensed Plumber - Pipeline Expert',
    '持证水暖工，专业管道维修安装。提供水龙头维修、马桶安装、管道疏通、热水器更换等服务。快速响应，质量保证。',
    'Licensed plumber specializing in pipe repair and installation. Faucet repair, toilet installation, drain cleaning, water heater replacement. Fast response, quality guaranteed.',
    ARRAY['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39'],
    'SERVICE',
    '1020200',
    ARRAY['plumber', 'professional'],
    'PUBLISHED',
    '渥太华-卡纳塔, Ottawa',
    4.6,
    16,
    true,
    'NODE_KANATA',
    45.3334,
    -75.905
),
(
    'bd80faff-e9a7-4798-9432-bda31883a970',
    'e3cb8bb8-31e9-4a3f-954f-a6139f878404',
    'RECO持证地产经纪 - 买卖租赁',
    'RECO Licensed Real Estate Agent - Buy/Sell/Rent',
    'RECO持证地产经纪，服务渥太华及周边地区。精通买卖、租赁、投资咨询。熟悉华人社区需求，提供中英双语服务。免费市场评估。',
    'RECO licensed real estate agent serving Ottawa and surrounding areas. Expert in buying, selling, leasing, and investment consultation. Familiar with Chinese community needs, bilingual service. Free market evaluation.',
    ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa'],
    'CONSULTATION',
    '1020500',
    ARRAY['real-estate-agent', 'professional', 'property', 'reco'],
    'PUBLISHED',
    '渥太华-奥尔良, Ottawa',
    4.7,
    57,
    true,
    'NODE_ORLEANS',
    45.4643,
    -75.5204
),
(
    '60b69518-a369-4e9c-90ce-c9ac61be84e6',
    '23d9d4e9-4ee2-442b-8dbb-45efe7374d1e',
    '专业美甲美睫工作室',
    'Professional Nail & Lash Studio',
    '专业美甲美睫服务，持证美容师。提供凝胶美甲、光疗甲、睫毛嫁接、半永久眉眼唇等服务。使用进口材料，环境舒适卫生。',
    'Professional nail and lash services by certified beautician. Gel nails, UV nails, lash extensions, semi-permanent makeup. Imported materials, comfortable and hygienic environment.',
    ARRAY['https://images.unsplash.com/photo-1604654894610-df63bc536371'],
    'SERVICE',
    '1020600',
    ARRAY['beauty-services', 'professional'],
    'PUBLISHED',
    '渥太华-巴尔黑文, Ottawa',
    4.5,
    46,
    true,
    'NODE_BARRHAVEN',
    45.2733,
    -75.7597
),
(
    '41fdc8a4-3aff-4791-a1c2-df1b67fdcd4a',
    '80134956-7b17-437c-9a26-24cbe827d25e',
    '社区理发服务 - 男女剪发',
    'Community Hair Salon - Men & Women',
    '邻里理发服务，经验丰富的发型师。提供男女剪发、染发、烫发等服务。价格实惠，预约方便。',
    'Neighborhood hair services by experienced stylists. Men and women haircuts, coloring, perms. Affordable prices, easy booking.',
    ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035'],
    'SERVICE',
    '1020600',
    ARRAY['beauty-services', 'professional'],
    'PUBLISHED',
    '渥太华-市中心, Ottawa',
    4.9,
    23,
    true,
    'NODE_DOWNTOWN',
    45.4215,
    -75.6972
),
(
    '646b69dc-15e6-444a-adc1-9ace72160842',
    '447fbcd9-c748-4953-960b-92e2c8826b89',
    '渥太华-多伦多顺风车',
    'Ottawa-Toronto Carpool',
    '渥太华往返多伦多顺风车服务，每周固定时间发车。舒适商务车，安全可靠。可在指定地点接送，支持大件行李。需提前预约。',
    'Ottawa-Toronto carpool service with fixed weekly schedule. Comfortable business vehicle, safe and reliable. Pickup/dropoff at designated locations, large luggage supported. Advance booking required.',
    ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
    'SERVICE',
    '1050600',
    ARRAY['carpool', 'professional', 'transportation', 'travel'],
    'PUBLISHED',
    '渥太华-利斯, Ottawa',
    4.6,
    59,
    false,
    'NODE_LEES',
    45.4215,
    -75.6972
),
(
    '0a5b1fac-1ab4-408b-9fb5-9d7ab84acc5c',
    'f9690d49-f7bb-4191-9750-c9d8477e9b56',
    '社区购物接送 - T&T/大统华',
    'Community Shopping Shuttle - T&T/Asian Markets',
    '每周定期前往T&T大统华、八方等华人超市购物接送服务。固定路线，按时出发，价格实惠。适合没有车的邻居。',
    'Weekly shuttle to T&T, Asian supermarkets and Chinese groceries. Fixed routes, punctual departure, affordable. Perfect for neighbors without cars.',
    ARRAY['https://images.unsplash.com/photo-1557804506-669a67965ba0'],
    'SERVICE',
    '1050600',
    ARRAY['carpool', 'professional'],
    'PUBLISHED',
    '渥太华-卡纳塔, Ottawa',
    4.7,
    26,
    true,
    'NODE_KANATA',
    45.3334,
    -75.905
),
(
    'ca41fe29-264d-481a-a9c5-092a949d54cf',
    'c7c7c367-6847-4f2a-9dd9-793ec4efce57',
    '渥太华机场专业接送服务',
    'Ottawa Airport Professional Transfer',
    '提供24小时渥太华机场接送服务。准时可靠，舒适商务车。可提前预约，支持航班追踪。司机经验丰富，熟悉各区域路线。',
    '24-hour Ottawa airport transfer service. Punctual and reliable, comfortable business vehicles. Advance booking available, flight tracking supported. Experienced drivers familiar with all areas.',
    ARRAY['https://images.unsplash.com/photo-1436491865332-7a61a109cc05'],
    'SERVICE',
    '1050700',
    ARRAY['airport-transportation', 'professional', 'transportation', 'travel'],
    'PUBLISHED',
    '渥太华-奥尔良, Ottawa',
    4.7,
    45,
    false,
    'NODE_ORLEANS',
    45.4643,
    -75.5204
)
;


-- ==========================================
-- LISTING ITEMS (服务明细/套餐)
-- ==========================================
INSERT INTO public.listing_items (
    id, master_id, name_zh, name_en,
    description_zh, description_en,
    price_amount, price_currency, price_unit,
    deposit_amount, pricing_model, status, sort_order,
    pricing
) VALUES
(
    '44116970-c33c-4599-b0ac-ec041d501398',
    '4c58b0f8-0a04-4a55-81a8-9f9111dd61fe',
    '基础电路检查',
    'Basic Circuit Inspection',
    null,
    null,
    12000,
    'CAD',
    'per visit',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "per visit", "price": {"amount": 12000, "currency": "CAD", "formatted": "$120.00"}}'
),
(
    'c44cae9d-b817-459b-ae94-b0f50f110045',
    '4c58b0f8-0a04-4a55-81a8-9f9111dd61fe',
    '插座/开关安装',
    'Outlet/Switch Installation',
    null,
    null,
    8500,
    'CAD',
    'per unit',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "per unit", "price": {"amount": 8500, "currency": "CAD", "formatted": "$85.00"}}'
),
(
    '80772903-05be-461e-8d9d-78efc2b54bbd',
    '4c58b0f8-0a04-4a55-81a8-9f9111dd61fe',
    '断路器更换',
    'Breaker Replacement',
    null,
    null,
    15000,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 15000, "currency": "CAD", "formatted": "$150.00"}}'
),
(
    '4e673e29-3696-4ab6-a14c-b788079f94b3',
    '4c58b0f8-0a04-4a55-81a8-9f9111dd61fe',
    '紧急维修服务',
    'Emergency Repair',
    null,
    null,
    25000,
    'CAD',
    'per call',
    0,
    'FIXED',
    'AVAILABLE',
    4,
    '{"model": "FIXED", "unit": "per call", "price": {"amount": 25000, "currency": "CAD", "formatted": "$250.00"}}'
),
(
    'fa4f79fb-0be0-497b-a3fc-0cdcf0b7b3b6',
    '6d0c0929-4fbc-4b5c-b30c-bdefaf822039',
    '管道疏通',
    'Drain Cleaning',
    null,
    null,
    15000,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 15000, "currency": "CAD", "formatted": "$150.00"}}'
),
(
    'a7946b18-2bb2-43a7-ba24-0bb6b73a3ef8',
    '6d0c0929-4fbc-4b5c-b30c-bdefaf822039',
    '水龙头维修',
    'Faucet Repair',
    null,
    null,
    9500,
    'CAD',
    'per unit',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "per unit", "price": {"amount": 9500, "currency": "CAD", "formatted": "$95.00"}}'
),
(
    'c7738e56-361a-4f7c-84bd-70206e995b63',
    '6d0c0929-4fbc-4b5c-b30c-bdefaf822039',
    '马桶安装',
    'Toilet Installation',
    null,
    null,
    25000,
    'CAD',
    'per unit',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "per unit", "price": {"amount": 25000, "currency": "CAD", "formatted": "$250.00"}}'
),
(
    '689b5197-2f4f-4322-9248-5ff791547997',
    '6d0c0929-4fbc-4b5c-b30c-bdefaf822039',
    '热水器更换',
    'Water Heater Replacement',
    null,
    null,
    120000,
    'CAD',
    'per project',
    0,
    'FIXED',
    'AVAILABLE',
    4,
    '{"model": "FIXED", "unit": "per project", "price": {"amount": 120000, "currency": "CAD", "formatted": "$1200.00"}}'
),
(
    'e254f25c-9341-41c5-95eb-4ac28d1cb3c5',
    'bd80faff-e9a7-4798-9432-bda31883a970',
    '买房咨询服务',
    'Home Buying Consultation',
    null,
    null,
    0,
    'CAD',
    'free consultation',
    0,
    'QUOTE',
    'AVAILABLE',
    1,
    '{"model": "QUOTE", "unit": "free consultation", "price": {"amount": 0, "currency": "CAD", "formatted": "$0.00"}}'
),
(
    '958a04e3-ce3a-4f62-8b9a-6b1d5ca1671d',
    'bd80faff-e9a7-4798-9432-bda31883a970',
    '卖房全程服务',
    'Home Selling Full Service',
    null,
    null,
    0,
    'CAD',
    'commission-based',
    0,
    'QUOTE',
    'AVAILABLE',
    2,
    '{"model": "QUOTE", "unit": "commission-based", "price": {"amount": 0, "currency": "CAD", "formatted": "$0.00"}}'
),
(
    '1302171d-4c89-49da-9912-510da0547bd2',
    'bd80faff-e9a7-4798-9432-bda31883a970',
    '房屋市场评估',
    'Property Market Evaluation',
    null,
    null,
    0,
    'CAD',
    'free',
    0,
    'QUOTE',
    'AVAILABLE',
    3,
    '{"model": "QUOTE", "unit": "free", "price": {"amount": 0, "currency": "CAD", "formatted": "$0.00"}}'
),
(
    '54fd5730-20d9-42fd-9572-d432bf1ee855',
    'bd80faff-e9a7-4798-9432-bda31883a970',
    '投资物业咨询',
    'Investment Property Consultation',
    null,
    null,
    20000,
    'CAD',
    'per session',
    0,
    'FIXED',
    'AVAILABLE',
    4,
    '{"model": "FIXED", "unit": "per session", "price": {"amount": 20000, "currency": "CAD", "formatted": "$200.00"}}'
),
(
    'a60a34ac-64cf-47a9-9edc-460ceae73bb4',
    '60b69518-a369-4e9c-90ce-c9ac61be84e6',
    '凝胶美甲',
    'Gel Manicure',
    null,
    null,
    4500,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 4500, "currency": "CAD", "formatted": "$45.00"}}'
),
(
    '10a4b90c-e14a-48f7-a7f6-1f6697df1932',
    '60b69518-a369-4e9c-90ce-c9ac61be84e6',
    '睫毛嫁接',
    'Lash Extensions',
    null,
    null,
    12000,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 12000, "currency": "CAD", "formatted": "$120.00"}}'
),
(
    '80e64706-b1f6-4f3c-bdd8-ce1a0bb48fc4',
    '60b69518-a369-4e9c-90ce-c9ac61be84e6',
    '半永久眉毛',
    'Semi-Permanent Eyebrows',
    null,
    null,
    35000,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 35000, "currency": "CAD", "formatted": "$350.00"}}'
),
(
    'cbf36723-a97e-49a3-a72d-915dbe423383',
    '60b69518-a369-4e9c-90ce-c9ac61be84e6',
    '修甲+护理套餐',
    'Manicure + Care Package',
    null,
    null,
    6500,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    4,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 6500, "currency": "CAD", "formatted": "$65.00"}}'
),
(
    'd711bca0-5251-4b98-b546-b885d1bc9560',
    '41fdc8a4-3aff-4791-a1c2-df1b67fdcd4a',
    '男士剪发',
    'Men's Haircut',
    null,
    null,
    2500,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 2500, "currency": "CAD", "formatted": "$25.00"}}'
),
(
    '73ec2117-3fe9-4463-a56b-42bf72e28ac6',
    '41fdc8a4-3aff-4791-a1c2-df1b67fdcd4a',
    '女士剪发',
    'Women's Haircut',
    null,
    null,
    4500,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 4500, "currency": "CAD", "formatted": "$45.00"}}'
),
(
    '1a4f4179-6241-41e7-a43c-431c23b406d7',
    '41fdc8a4-3aff-4791-a1c2-df1b67fdcd4a',
    '染发服务',
    'Hair Coloring',
    null,
    null,
    8500,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 8500, "currency": "CAD", "formatted": "$85.00"}}'
),
(
    '6ad44477-b0fe-4fd9-9664-2978c49de0ee',
    '41fdc8a4-3aff-4791-a1c2-df1b67fdcd4a',
    '烫发造型',
    'Hair Perm',
    null,
    null,
    12000,
    'CAD',
    'per service',
    0,
    'FIXED',
    'AVAILABLE',
    4,
    '{"model": "FIXED", "unit": "per service", "price": {"amount": 12000, "currency": "CAD", "formatted": "$120.00"}}'
),
(
    '79bc1565-5273-4755-ac61-874f835f37d9',
    '646b69dc-15e6-444a-adc1-9ace72160842',
    '单程 (渥太华→多伦多)',
    'One-Way (Ottawa→Toronto)',
    null,
    null,
    5500,
    'CAD',
    'per person',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "per person", "price": {"amount": 5500, "currency": "CAD", "formatted": "$55.00"}}'
),
(
    '97d969ab-bc51-4344-9a98-9d117e91b457',
    '646b69dc-15e6-444a-adc1-9ace72160842',
    '往返优惠套票',
    'Round Trip Package',
    null,
    null,
    10000,
    'CAD',
    'per person',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "per person", "price": {"amount": 10000, "currency": "CAD", "formatted": "$100.00"}}'
),
(
    'c5fec016-b92b-4d03-a484-37864b862025',
    '646b69dc-15e6-444a-adc1-9ace72160842',
    '包车服务 (4人以下)',
    'Private Charter (Up to 4)',
    null,
    null,
    25000,
    'CAD',
    'per trip',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "per trip", "price": {"amount": 25000, "currency": "CAD", "formatted": "$250.00"}}'
),
(
    'caf8445a-5d26-4fde-b88a-46598cc78a76',
    '0a5b1fac-1ab4-408b-9fb5-9d7ab84acc5c',
    '往返T&T (Gloucester)',
    'Round Trip to T&T (Gloucester)',
    null,
    null,
    1500,
    'CAD',
    'per person',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "per person", "price": {"amount": 1500, "currency": "CAD", "formatted": "$15.00"}}'
),
(
    '2243c286-015b-42e5-9a07-66238bb01f17',
    '0a5b1fac-1ab4-408b-9fb5-9d7ab84acc5c',
    '往返大统华 (Hunt Club)',
    'Round Trip to 大统华 (Hunt Club)',
    null,
    null,
    1500,
    'CAD',
    'per person',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "per person", "price": {"amount": 1500, "currency": "CAD", "formatted": "$15.00"}}'
),
(
    '1cbe5abb-3693-486a-a0e7-681c39144f3c',
    '0a5b1fac-1ab4-408b-9fb5-9d7ab84acc5c',
    '市区华人超市购物游',
    'Asian Market Shopping Tour',
    null,
    null,
    2000,
    'CAD',
    'per person',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "per person", "price": {"amount": 2000, "currency": "CAD", "formatted": "$20.00"}}'
),
(
    'be5eb5b6-6a87-400e-9e14-4c9da2d294c3',
    'ca41fe29-264d-481a-a9c5-092a949d54cf',
    '市区往返机场 (Lees/Downtown)',
    'Airport Transfer (Lees/Downtown)',
    null,
    null,
    4500,
    'CAD',
    'one-way',
    0,
    'FIXED',
    'AVAILABLE',
    1,
    '{"model": "FIXED", "unit": "one-way", "price": {"amount": 4500, "currency": "CAD", "formatted": "$45.00"}}'
),
(
    '499fc575-a111-41e3-b9bc-783dfc4b0316',
    'ca41fe29-264d-481a-a9c5-092a949d54cf',
    'Kanata/Barrhaven往返机场',
    'Airport Transfer (Kanata/Barrhaven)',
    null,
    null,
    6500,
    'CAD',
    'one-way',
    0,
    'FIXED',
    'AVAILABLE',
    2,
    '{"model": "FIXED", "unit": "one-way", "price": {"amount": 6500, "currency": "CAD", "formatted": "$65.00"}}'
),
(
    '4eeb2c1a-205a-4845-8f11-2e1f9c2f0206',
    'ca41fe29-264d-481a-a9c5-092a949d54cf',
    'Orleans往返机场',
    'Airport Transfer (Orleans)',
    null,
    null,
    5500,
    'CAD',
    'one-way',
    0,
    'FIXED',
    'AVAILABLE',
    3,
    '{"model": "FIXED", "unit": "one-way", "price": {"amount": 5500, "currency": "CAD", "formatted": "$55.00"}}'
),
(
    'c4f969f9-7502-43fd-b011-ac631ba8f35d',
    'ca41fe29-264d-481a-a9c5-092a949d54cf',
    '深夜/凌晨加急服务',
    'Late Night/Early Morning Rush',
    null,
    null,
    8000,
    'CAD',
    'one-way',
    0,
    'FIXED',
    'AVAILABLE',
    4,
    '{"model": "FIXED", "unit": "one-way", "price": {"amount": 8000, "currency": "CAD", "formatted": "$80.00"}}'
)
;

-- ==========================================
-- 插入完成统计
-- ==========================================
-- 总计插入:
-- - 5 个社区节点 (Nodes)
-- - 8 个服务提供者 (Provider Profiles)
-- - 8 个服务主表 (Listing Masters)
-- - 30 个服务明细 (Listing Items)
--
-- 涵盖类别:
-- - 持证电工 (Electrician)
-- - 持证水工 (Plumber)
-- - 房地产经纪 (Real Estate Agent)
-- - 美业服务 (Beauty Services) - 美甲美睫 + 理发
-- - 顺风车 (Carpool) - 渥太华-多伦多 + T&T购物
-- - 机场接送 (Airport Transportation)




🍁 Gigbridge development seed data1: Eagleson Coin Wash (Final Production-Ready Version)
-- Structure: 1 Master (Recharge Card) + 3 Items ($50/$100/$200)
-- UUIDs: Fully random V4 UUIDs to ensure uniqueness and professionalism
-- User: Locked to ID 'e1507f9e-7343-4474-a1da-301a213943ec'

DO $$
DECLARE
    -- 1. Targeted User ID
    target_user_id UUID := 'e1507f9e-7343-4474-a1da-301a213943ec';
    
    -- 2. Professional Random UUIDs
    provider_id UUID := '0588656d-2305-4f40-9669-026815ec5521'; 
    master_card UUID := 'b4c91350-13f5-4309-84d7-40097f486241';
    
    item_50 UUID   := 'f3327699-0785-4b18-a612-452936780352';
    item_100 UUID  := '21647754-0824-4f06-9051-177395027583';
    item_200 UUID  := '78239015-3215-4687-9540-523689401562';
    
    timestamp_now TIMESTAMPTZ := now();
BEGIN
    -- Validation: Ensure user exists to avoid silent FK errors
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE NOTICE '⚠️ Target user % not found. Script might fail on FK constraint.', target_user_id;
    END IF;

    -- ==========================================
    -- 1. Provider Profile
    -- ==========================================
    INSERT INTO "public"."provider_profiles" (
        "id", "user_id", "business_name_zh", "business_name_en", 
        "description_zh", "description_en", 
        "identity", "is_verified", "badges", "stats", 
        "location_address", "location_coords", "service_radius_km", 
        "created_at", "updated_at", "verification_level", 
        "insurance_summary_en", "license_info", "status"
    ) VALUES (
        provider_id, 
        target_user_id, 
        'Eagleson Coin Wash (Official)', 
        'Eagleson Coin Wash', 
        '24小时自助洗车。高压温水、肥皂水、打蜡。多车位免排队。', 
        '24/7 Self-service car wash. High-pressure hot water, soap & wax. No waiting in line.', 
        'MERCHANT', 
        true, 
        ARRAY['top_rated', 'verified', 'fast_response'], 
        '{"totalOrders": 128, "averageRating": 4.9, "reviewCount": 85}', -- Realistic stats
        '650A Eagleson Rd, Kanata, ON K2M 1H4', 
        NULL, 
        15, 
        timestamp_now, 
        timestamp_now, 
        3, 
        'Liability Insurance Included (Policy #998877)', 
        'Business License #BL-2025-888', 
        'ACTIVE'
    )
    ON CONFLICT ("id") DO UPDATE SET
        "user_id" = EXCLUDED."user_id",
        "business_name_zh" = EXCLUDED."business_name_zh",
        "updated_at" = now();

    -- ==========================================
    -- 2. Listing Master (Single Entry)
    -- ==========================================
    INSERT INTO "public"."listing_masters" (
        "id", "provider_id", "title_zh", "title_en", 
        "description_zh", "description_en", 
        "images", "type", "category_id", "tags", 
        "status", "location_address", "location_coords", 
        "rating", "review_count", "is_promoted", "metadata", 
        "created_at", "updated_at", "embedding", "node_id", 
        "location", "latitude", "longitude"
    ) VALUES (
        master_card, 
        provider_id, 
        '自助洗车充值卡 (多面额可选)', 
        'Self-Service Wash Recharge Card', 
        '官方充值卡，余额永久有效。每笔充值均有不同程度的赠送优惠。支持扫码即用。', 
        'Official recharge card with permanent balance validity. Bonus credits included with every tier. Scan to use instantly.', 
        ARRAY['https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=600'], 
        'GOODS', 
        '1040400', 
        ARRAY['car_wash', 'recharge', 'promotion', 'gift_card'], 
        'PUBLISHED', 
        'Kanata Lakes, Ottawa', 
        NULL, 
        4.9, 85, true, 
        '{"is_serialized": true, "fulfillment_config": {"auto_notify": true}}'::jsonb, 
        timestamp_now, timestamp_now, NULL, 'NODE_KANATA', 
        NULL, 45.3, -75.9
    ) ON CONFLICT ("id") DO NOTHING;

    -- ==========================================
    -- 3. Listing Items (3 Variants)
    -- ==========================================
    
    -- Variant A: $50
    INSERT INTO "public"."listing_items" (
        "id", "master_id", "name_zh", "name_en", 
        "description_zh", "description_en", 
        "images", "price_amount", "price_currency", "price_unit", 
        "deposit_amount", "pricing_model", "status", "sort_order", 
        "attributes", "parent_item_id", "created_at", "updated_at", "pricing"
    ) VALUES (
        item_50, master_card, 
        '标准卡 ($50)', 'Standard Card ($50)', 
        '充$50，送10分钟免费时长', 'Load $50, get 10 min bonus', 
        NULL, 5000, 'CAD', 'card', 
        0, 'FIXED', 'AVAILABLE', 1, 
        '{"bonus_minutes": 10, "credit_value": 50}'::jsonb, 
        NULL, timestamp_now, timestamp_now, 
        '{"model": "FIXED", "unit": "card", "price": {"amount": 5000, "currency": "CAD", "formatted": "$50.00"}}'
    ) ON CONFLICT ("id") DO NOTHING;

    -- Variant B: $100
    INSERT INTO "public"."listing_items" (
        "id", "master_id", "name_zh", "name_en", 
        "description_zh", "description_en", 
        "images", "price_amount", "price_currency", "price_unit", 
        "deposit_amount", "pricing_model", "status", "sort_order", 
        "attributes", "parent_item_id", "created_at", "updated_at", "pricing"
    ) VALUES (
        item_100, master_card, 
        '金卡 ($100)', 'Gold Card ($100)', 
        '充$100，送25分钟免费时长', 'Load $100, get 25 min bonus', 
        NULL, 10000, 'CAD', 'card', 
        0, 'FIXED', 'AVAILABLE', 2, 
        '{"bonus_minutes": 25, "credit_value": 100}'::jsonb, 
        NULL, timestamp_now, timestamp_now, 
        '{"model": "FIXED", "unit": "card", "price": {"amount": 10000, "currency": "CAD", "formatted": "$100.00"}}'
    ) ON CONFLICT ("id") DO NOTHING;

    -- Variant C: $200
    INSERT INTO "public"."listing_items" (
        "id", "master_id", "name_zh", "name_en", 
        "description_zh", "description_en", 
        "images", "price_amount", "price_currency", "price_unit", 
        "deposit_amount", "pricing_model", "status", "sort_order", 
        "attributes", "parent_item_id", "created_at", "updated_at", "pricing"
    ) VALUES (
        item_200, master_card, 
        '白金卡 ($200)', 'Platinum Card ($200)', 
        '充$200，送40分钟 + 免费换胎', 'Load $200, 40 min bonus + Tire Change', 
        NULL, 20000, 'CAD', 'card', 
        0, 'FIXED', 'AVAILABLE', 3, 
        '{"bonus_minutes": 40, "credit_value": 200, "includes_service": "TIRE_CHANGE"}'::jsonb, 
        NULL, timestamp_now, timestamp_now, 
        '{"model": "FIXED", "unit": "card", "price": {"amount": 20000, "currency": "CAD", "formatted": "$200.00"}}'
    ) ON CONFLICT ("id") DO NOTHING;

    -- ==========================================
    -- 4. Inventory (Serialized Assets)
    -- ==========================================
    -- Using status 'available' (lowercase) per schema constraint
    FOR i IN 1..5 LOOP
        -- $50 Cards
        INSERT INTO public.listing_inventory (provider_id, listing_item_id, serial_number, secret_code, status)
        VALUES (provider_id, item_50, 'CW-50-' || floor(random() * 89999 + 10000)::text, 'PIN-' || floor(random()*9000 + 1000)::text, 'available')
        ON CONFLICT DO NOTHING;
        
        -- $100 Cards
        INSERT INTO public.listing_inventory (provider_id, listing_item_id, serial_number, secret_code, status)
        VALUES (provider_id, item_100, 'CW-100-' || floor(random() * 89999 + 10000)::text, 'PIN-' || floor(random()*9000 + 1000)::text, 'available')
        ON CONFLICT DO NOTHING;
        
        -- $200 Cards
        INSERT INTO public.listing_inventory (provider_id, listing_item_id, serial_number, secret_code, status)
        VALUES (provider_id, item_200, 'CW-200-' || floor(random() * 89999 + 10000)::text, 'PIN-' || floor(random()*9000 + 1000)::text, 'available')
        ON CONFLICT DO NOTHING;
    END LOOP;

END $$;


======
--- Gigbridge development seed data2：
----在 Supabase SQL Editor 中运行：

-- 1. 创建演示订单
INSERT INTO public.orders (
    id, buyer_id, provider_id, status, payment_status,
    amount_base, amount_total, currency, snapshot, actual_transaction_model
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,  -- Demo buyer (will create below)
    (SELECT id FROM public.provider_profiles WHERE business_name_en = 'Eagleson Coin Wash' LIMIT 1),
    'PENDING_PAYMENT', 'UNPAID', 0, 0, 'CAD', '{}'::JSONB, 'DEMO'
)
ON CONFLICT (id) DO NOTHING;

-- 2. 创建匿名购买者用户记录（新增）
-- Create anonymous buyer user profile for demo purchases 创建一个专门的"匿名购买者"用户记录 所有演示购买都使用这
-- 缺点：无法区分不同的匿名买家

INSERT INTO auth.users ( id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_anonymous ) VALUES ( '00000000-0000-0000-0000-000000000002'::uuid, 'authenticated', 'authenticated', 'anonymous@demo.gigneighbor.ca [blocked]', now(), '{}'::jsonb, '{"name":"Anonymous Buyer (Demo)"}'::jsonb, now(), now(), true ) 

INSERT INTO public.user_profiles (
    id,
    email,
    name,
    phone,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000002'::UUID,  -- Fixed demo buyer UUID
    'anonymous@demo.gigneighbor.ca',
    'Anonymous Buyer (Demo)',
    '+1-000-000-0000',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;



-- ============================================================================
-- 3. SYSTEM USERS (Guest Checkout Support)
-- ============================================================================
INSERT INTO public.user_profiles (id, full_name, email, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'Guest User', 'guest@hanghand.ca', 'BUYER')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. DEMO DATA: Eagleson Coin Wash (Scan-to-Buy Pilot)
-- ============================================================================
INSERT INTO "public"."provider_profiles" ("id", "user_id", "business_name_zh", "business_name_en", "identity", "is_verified", "status") 
VALUES ('0588656d-2305-4f40-9669-026815ec5521', 'e1507f9e-7343-4474-a1da-301a213943ec', '壹狗剩自助洗车行', 'Eagleson Coin Wash', 'MERCHANT', true, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."listing_masters" ("id", "provider_id", "title_zh", "title_en", "type", "category_id", "status", "node_id")
VALUES ('b4c91350-13f5-4309-84d7-40097f486241', '0588656d-2305-4f40-9669-026815ec5521', '自助洗车充值卡', 'Self-Service Wash Card', 'GOODS', '1040400', 'PUBLISHED', 'NODE_KANATA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."listing_items" ("id", "master_id", "name_zh", "name_en", "price_amount", "price_currency", "pricing_model", "status") 
VALUES 
('f3327699-0785-4b18-a612-452936780352', 'b4c91350-13f5-4309-84d7-40097f486241', '标准卡 ($50)', 'Standard Card ($50)', 5000, 'CAD', 'FIXED', 'AVAILABLE'),
('21647754-0824-4f06-9051-177395027583', 'b4c91350-13f5-4309-84d7-40097f486241', '金卡 ($100)', 'Gold Card ($100)', 10000, 'CAD', 'FIXED', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- Seed initial inventory for item_50
INSERT INTO public.listing_inventory (provider_id, listing_item_id, serial_number, secret_code, status)
SELECT '0588656d-2305-4f40-9669-026815ec5521', 'f3327699-0785-4b18-a612-452936780352', 'CW-50-' || i, 'PIN-' || i, 'available'
FROM generate_series(1, 10) s(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. GEOSPATIAL TEST MARKERS (For Phase 10 Validation)
-- ============================================================================
-- Ottawa Center Marker
UPDATE public.listing_masters
SET latitude = 45.4215, longitude = -75.6972
WHERE title_en LIKE '%Airport%' OR title_en LIKE '%Downtown%';

-- Kanata Lakes Cluster
UPDATE public.listing_masters
SET latitude = 45.3334, longitude = -75.9050
WHERE node_id = 'NODE_KANATA';

-- Lees Ave Cluster
UPDATE public.listing_masters
SET latitude = 45.4215, longitude = -75.6819
WHERE node_id = 'NODE_LEES';

-- Final Sync
UPDATE public.listing_masters
SET location_coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
