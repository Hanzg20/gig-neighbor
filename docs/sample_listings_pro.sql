-- ============================================================================
-- ADDITIONAL SAMPLE LISTINGS - PROFESSIONAL & TRANSPORTATION SERVICES
-- ============================================================================
-- Purpose: Add professional services, beauty, and transportation listings
-- Execute this AFTER sample_listings.sql
-- Date: 2026-01-06

-- ============================================================================
-- STEP 1: ADDITIONAL PROVIDER PROFILES
-- ============================================================================

INSERT INTO public.provider_profiles (
  id,
  user_id,
  identity,
  business_name_zh,
  business_name_en,
  bio_zh,
  bio_en,
  service_areas,
  level,
  badges,
  kyc_status,
  created_at
) VALUES
-- Provider 5: Jennifer Zhang - Real Estate Agent
('e5555555-5555-5555-5555-55555555555e',
 'e5555555-5555-5555-5555-55555555555e',
 'MERCHANT',
 '张洁 - RE/MAX地产经纪',
 'Jennifer Zhang - RE/MAX Realtor',
 '持牌地产经纪，RECO认证。专注渥太华东区，熟悉Lees、Alta Vista、Riverside。10年经验，中英双语服务。',
 'Licensed Real Estate Broker (RECO). Specializing in Ottawa East - Lees, Alta Vista, Riverside. 10+ years experience. Bilingual CN/EN.',
 ARRAY['NODE_LEES', 'NODE_KANATA'],
 5,
 ARRAY['VERIFIED_PRO', 'LICENSED', 'TOP_RATED'],
 'APPROVED',
 NOW() - INTERVAL '5 years'
),

-- Provider 6: David Chen - Immigration Lawyer
('f6666666-6666-6666-6666-66666666666f',
 'f6666666-6666-6666-6666-66666666666f',
 'MERCHANT',
 '陈律师 - 移民法律咨询',
 'David Chen Law - Immigration',
 '持牌移民律师，安省律师协会成员。专注家庭团聚、工签、PR申请。免费初次咨询30分钟。',
 'Licensed Immigration Lawyer, Law Society of Ontario. Family sponsorship, work permits, PR applications. Free 30min initial consultation.',
 ARRAY['NODE_LEES', 'NODE_KANATA'],
 5,
 ARRAY['VERIFIED_PRO', 'LICENSED', 'LAW_SOCIETY'],
 'APPROVED',
 NOW() - INTERVAL '8 years'
),

-- Provider 7: Lily Beauty Studio
('a7777777-7777-7777-7777-77777777777a',
 'a7777777-7777-7777-7777-77777777777a',
 'MERCHANT',
 'Lily美业工作室',
 'Lily Beauty Studio',
 '专业美甲、美睫、皮肤管理。使用日本进口产品。预约制，工作室位于Lees地铁站附近。',
 'Professional nails, lashes, skin care. Japanese imported products. By appointment. Studio near Lees station.',
 ARRAY['NODE_LEES'],
 4,
 ARRAY['VERIFIED_NEIGHBOR', 'BEAUTY_CERTIFIED'],
 'APPROVED',
 NOW() - INTERVAL '2 years'
),

-- Provider 8: Kevin Driver - Airport & Carpool
('b8888888-8888-8888-8888-88888888888b',
 'b8888888-8888-8888-8888-88888888888b',
 'NEIGHBOR',
 '凯文接送服务',
 'Kevin Driver Service',
 '专业接送服务。机场接送、顺风车、长途拼车。车况良好，驾龄15年。可帮忙搬行李。',
 'Professional driver service. Airport pickup, carpools, long-distance rides. 15 years driving experience. Luggage assistance.',
 ARRAY['NODE_LEES', 'NODE_KANATA'],
 4,
 ARRAY['VERIFIED_NEIGHBOR', 'BACKGROUND_CHECK'],
 'APPROVED',
 NOW() - INTERVAL '3 years'
),

-- Provider 9: Sophie Hair Salon
('c9999999-9999-9999-9999-99999999999c',
 'c9999999-9999-9999-9999-99999999999c',
 'MERCHANT',
 'Sophie发型设计',
 'Sophie Hair Design',
 '专业发型师，10年经验。擅长染发、烫发、修剪。使用欧莱雅专业线产品。',
 'Professional hairstylist, 10 years experience. Coloring, perming, cutting specialist. L\'Oréal Professional products.',
 ARRAY['NODE_LEES'],
 5,
 ARRAY['VERIFIED_PRO', 'BEAUTY_CERTIFIED', 'TOP_RATED'],
 'APPROVED',
 NOW() - INTERVAL '6 years'
)
ON CONFLICT (id) DO UPDATE SET
  business_name_zh = EXCLUDED.business_name_zh,
  business_name_en = EXCLUDED.business_name_en;

-- ============================================================================
-- STEP 2: PROFESSIONAL & TRANSPORTATION LISTINGS
-- ============================================================================

INSERT INTO public.listing_masters (
  id,
  provider_id,
  title_zh,
  title_en,
  description_zh,
  description_en,
  images,
  type,
  category_id,
  node_id,
  tags,
  status,
  location_address,
  rating,
  review_count,
  is_promoted,
  created_at
) VALUES

-- ============================================================================
-- PROFESSIONAL SERVICES - 专业人士
-- ============================================================================

-- 21. Real Estate Agent - Buyer/Seller Services
('50505050-5050-5050-5050-505050505050',
 'e5555555-5555-5555-5555-55555555555e',
 '买房卖房专业服务 - 渥太华东区',
 'Real Estate Services - Ottawa East',
 '持牌RECO地产经纪。提供买房、卖房全程服务。市场分析、房源搜索、谈判、过户协助。中英双语，熟悉华人社区需求。首次咨询免费。',
 'Licensed RECO Realtor. Full-service buying/selling. Market analysis, property search, negotiation, closing support. Bilingual CN/EN. First consultation free.',
 ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa'],
 'CONSULTATION',
 '1020500',
 'NODE_LEES',
 ARRAY['real-estate', 'reco', 'licensed', 'bilingual'],
 'PUBLISHED',
 'Ottawa East',
 5.0,
 89,
 true,
 NOW() - INTERVAL '5 years'
),

-- 22. Immigration Lawyer Consultation
('51515151-5151-5151-5151-515151515151',
 'f6666666-6666-6666-6666-66666666666f',
 '移民法律咨询 - 工签/PR/团聚',
 'Immigration Law - Work Permit/PR/Sponsorship',
 '持牌移民律师，安省律师协会成员。专注加拿大移民法。提供工签申请、PR申请、家庭团聚、上诉等服务。免费评估30分钟，后续按小时收费。',
 'Licensed Immigration Lawyer, LSO member. Work permits, PR applications, family sponsorship, appeals. Free 30min assessment, then hourly rate.',
 ARRAY['https://images.unsplash.com/photo-1589829545856-d10d557cf95f'],
 'CONSULTATION',
 '1020500',
 'NODE_LEES',
 ARRAY['immigration', 'lawyer', 'licensed', 'lso', 'legal'],
 'PUBLISHED',
 'Downtown Ottawa',
 4.9,
 67,
 true,
 NOW() - INTERVAL '8 years'
),

-- ============================================================================
-- BEAUTY SERVICES - 美业
-- ============================================================================

-- 23. Nail & Lash Studio
('52525252-5252-5252-5252-525252525252',
 'a7777777-7777-7777-7777-77777777777a',
 '专业美甲美睫 - 日式风格',
 'Professional Nails & Lashes - Japanese Style',
 '专业美甲师，日本进修归来。提供光疗甲、手绘美甲、日式美睫。使用OPI、CND等品牌。环境整洁，预约制。Lees地铁站步行5分钟。',
 'Professional nail artist, trained in Japan. Gel nails, nail art, Japanese lash extensions. OPI, CND brands. Clean studio, by appointment. 5min walk from Lees station.',
 ARRAY['https://images.unsplash.com/photo-1604654894610-df63bc536371'],
 'SERVICE',
 '1020600',
 'NODE_LEES',
 ARRAY['beauty', 'nails', 'lashes', 'japanese'],
 'PUBLISHED',
 'Lees Station Area',
 4.9,
 124,
 true,
 NOW() - INTERVAL '2 years'
),

-- 24. Hair Salon - Coloring & Styling
('53535353-5353-5353-5353-535353535353',
 'c9999999-9999-9999-9999-99999999999c',
 '专业染发烫发 - 韩式/日式风格',
 'Hair Coloring & Perming - Korean/Japanese Style',
 '10年经验发型师。擅长韩式染发、日式烫发、层次修剪。使用欧莱雅专业线产品。提供护发建议。预约制，周二至周日营业。',
 '10-year experienced stylist. Korean coloring, Japanese perming, layered cuts. L\'Oréal Professional products. Hair care consultation. By appointment, Tue-Sun.',
 ARRAY['https://images.unsplash.com/photo-1562322140-8baeececf3df'],
 'SERVICE',
 '1020600',
 'NODE_LEES',
 ARRAY['beauty', 'hair', 'coloring', 'korean', 'japanese'],
 'PUBLISHED',
 'Lees Community',
 5.0,
 156,
 true,
 NOW() - INTERVAL '6 years'
),

-- 25. Facial & Skin Care
('54545454-5454-5454-5454-545454545454',
 'a7777777-7777-7777-7777-77777777777a',
 '皮肤管理 - 深层清洁/补水/抗衰',
 'Facial & Skin Care - Deep Cleanse/Hydration/Anti-aging',
 '专业皮肤管理师。提供深层清洁、补水护理、抗衰疗程。使用韩国进口仪器和产品。首次体验8折优惠。',
 'Professional skin therapist. Deep cleansing, hydration, anti-aging treatments. Korean imported equipment & products. 20% off first visit.',
 ARRAY['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881'],
 'SERVICE',
 '1020600',
 'NODE_LEES',
 ARRAY['beauty', 'facial', 'skincare', 'korean'],
 'PUBLISHED',
 'Lees Station',
 4.8,
 78,
 false,
 NOW() - INTERVAL '1 year'
),

-- ============================================================================
-- TRANSPORTATION SERVICES - 接送服务
-- ============================================================================

-- 26. Ottawa Airport Pickup/Dropoff
('60606060-6060-6060-6060-606060606060',
 'b8888888-8888-8888-8888-88888888888b',
 '渥太华机场接送 - YOW机场专线',
 'Ottawa Airport Transfer - YOW Pickup/Dropoff',
 '专业机场接送服务。SUV车型，可坐4人+行李。从Lees/Kanata到YOW机场约20-30分钟。提前预约享优惠。接机免费等待30分钟。',
 'Professional airport transfer. SUV seats 4 + luggage. Lees/Kanata to YOW ~20-30mins. Advance booking discount. Free 30min wait for arrivals.',
 ARRAY['https://images.unsplash.com/photo-1436491865332-7a61a109cc05'],
 'SERVICE',
 '1050700',
 'NODE_LEES',
 ARRAY['airport', 'yow', 'transfer', 'reliable'],
 'PUBLISHED',
 'Ottawa (Lees/Kanata)',
 4.9,
 234,
 true,
 NOW() - INTERVAL '3 years'
),

-- 27. Carpool to T&T Supermarket
('61616161-6161-6161-6161-616161616161',
 'b8888888-8888-8888-8888-88888888888b',
 '顺风车去 T&T 超市 - 每周六上午',
 'Carpool to T&T Supermarket - Saturday Morning',
 '每周六上午10点从Lees出发去Merivale T&T，12点返回。可带3人。车费$5/人（往返）。帮忙搬重物。需提前1天预约。',
 'Every Saturday 10am from Lees to T&T Merivale, return 12pm. Seats 3 passengers. $5/person round trip. Help with heavy items. Book 1 day ahead.',
 ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
 'SERVICE',
 '1050600',
 'NODE_LEES',
 ARRAY['carpool', 'tnt', 'grocery', 'weekly'],
 'PUBLISHED',
 'Lees to T&T Merivale',
 4.8,
 67,
 false,
 NOW() - INTERVAL '1 year'
),

-- 28. Carpool to Toronto - Weekend Trips
('62626262-6262-6262-6262-626262626262',
 'b8888888-8888-8888-8888-88888888888b',
 '渥太华-多伦多 顺风车 - 周末往返',
 'Ottawa-Toronto Carpool - Weekend Round Trip',
 '周末往返多伦多顺风车。周五晚出发，周日晚返回。可带3人。车费$40/人（单程）。高速直达，约4.5小时。可商量时间。',
 'Weekend carpool Ottawa-Toronto. Depart Fri evening, return Sun evening. Seats 3. $40/person (one way). Highway direct, ~4.5hrs. Flexible timing.',
 ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
 'SERVICE',
 '1050600',
 'NODE_LEES',
 ARRAY['carpool', 'toronto', 'long-distance', 'weekend'],
 'PUBLISHED',
 'Ottawa to Toronto',
 4.7,
 45,
 false,
 NOW() - INTERVAL '2 years'
),

-- 29. Montreal Airport Transfer (YUL)
('63636363-6363-6363-6363-636363636363',
 'b8888888-8888-8888-8888-88888888888b',
 '蒙特利尔机场接送 - YUL机场',
 'Montreal Airport Transfer - YUL Pickup/Dropoff',
 '提供渥太华到蒙特利尔机场(YUL)的接送服务。SUV车型，约2小时车程。适合早班机或晚班机。需提前3天预约。',
 'Ottawa to Montreal Airport (YUL) transfer. SUV, ~2hr drive. Perfect for early/late flights. Book 3 days ahead.',
 ARRAY['https://images.unsplash.com/photo-1436491865332-7a61a109cc05'],
 'SERVICE',
 '1050700',
 'NODE_KANATA',
 ARRAY['airport', 'yul', 'montreal', 'long-distance'],
 'PUBLISHED',
 'Ottawa to Montreal',
 4.6,
 28,
 false,
 NOW() - INTERVAL '1 year'
),

-- 30. Daily Carpool - Carling/Kanata to Downtown
('64646464-6464-6464-6464-646464646464',
 'b8888888-8888-8888-8888-88888888888b',
 '通勤顺风车 - Kanata到市中心',
 'Daily Commute Carpool - Kanata to Downtown',
 '工作日通勤顺风车。早上7:30从Kanata出发到市中心，下午5:30返回。固定路线经过Carling/Baseline。月票$100。',
 'Weekday commute carpool. 7:30am Kanata to downtown, 5:30pm return. Fixed route via Carling/Baseline. Monthly pass $100.',
 ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
 'SERVICE',
 '1050600',
 'NODE_KANATA',
 ARRAY['carpool', 'commute', 'daily', 'downtown'],
 'PUBLISHED',
 'Kanata to Downtown Ottawa',
 4.9,
 89,
 true,
 NOW() - INTERVAL '4 years'
);

-- ============================================================================
-- STEP 3: LISTING_ITEMS FOR NEW LISTINGS
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
  sort_order
) VALUES

-- Real Estate Agent Services
('item-5050-0001', '50505050-5050-5050-5050-505050505050', '买房服务', 'Buyer Service', '全程协助买房', 'Full buyer assistance', 0, 'CAD', '/consultation', 0, 'COMMISSION', 'AVAILABLE', 1),
('item-5050-0002', '50505050-5050-5050-5050-505050505050', '卖房服务', 'Seller Service', '全程协助卖房', 'Full seller assistance', 0, 'CAD', '/consultation', 0, 'COMMISSION', 'AVAILABLE', 2),
('item-5050-0003', '50505050-5050-5050-5050-505050505050', '市场分析报告', 'Market Analysis', '免费评估房产价值', 'Free property valuation', 0, 'CAD', '/report', 0, 'FREE', 'AVAILABLE', 3),

-- Immigration Lawyer
('item-5151-0001', '51515151-5151-5151-5151-515151515151', '免费咨询 30分钟', 'Free Consultation 30min', '案件评估', 'Case assessment', 0, 'CAD', '/session', 0, 'FREE', 'AVAILABLE', 1),
('item-5151-0002', '51515151-5151-5151-5151-515151515151', '律师咨询 - 按小时', 'Legal Consultation - Hourly', '深度法律咨询', 'In-depth legal advice', 25000, 'CAD', '/hour', 0, 'HOURLY', 'AVAILABLE', 2),
('item-5151-0003', '51515151-5151-5151-5151-515151515151', '工签申请全程代理', 'Work Permit Full Service', '包括文件准备、递交、跟进', 'Document prep, submission, follow-up', 150000, 'CAD', '/case', 0, 'FIXED', 'AVAILABLE', 3),
('item-5151-0004', '51515151-5151-5151-5151-515151515151', 'PR申请全程代理', 'PR Application Full Service', 'EE/PNP/家庭团聚', 'Express Entry/PNP/Sponsorship', 300000, 'CAD', '/case', 0, 'FIXED', 'AVAILABLE', 4),

-- Nail & Lash Studio
('item-5252-0001', '52525252-5252-5252-5252-525252525252', '基础美甲', 'Basic Manicure', '修型+涂油', 'Shape + polish', 3500, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 1),
('item-5252-0002', '52525252-5252-5252-5252-525252525252', '光疗美甲', 'Gel Manicure', '持久2-3周', 'Lasts 2-3 weeks', 5500, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 2),
('item-5252-0003', '52525252-5252-5252-5252-525252525252', '手绘美甲', 'Nail Art Design', '个性设计', 'Custom design', 7500, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 3),
('item-5252-0004', '52525252-5252-5252-5252-525252525252', '日式美睫', 'Japanese Lash Extension', '自然/浓密可选', 'Natural/volume options', 12000, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 4),

-- Hair Salon
('item-5353-0001', '53535353-5353-5353-5353-535353535353', '女士剪发', 'Women Haircut', '洗剪吹', 'Wash, cut, blow-dry', 4500, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 1),
('item-5353-0002', '53535353-5353-5353-5353-535353535353', '男士剪发', 'Men Haircut', '洗剪吹', 'Wash, cut, blow-dry', 3500, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 2),
('item-5353-0003', '53535353-5353-5353-5353-535353535353', '全头染发', 'Full Color', '含护理', 'Includes treatment', 12000, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 3),
('item-5353-0004', '53535353-5353-5353-5353-535353535353', '烫发造型', 'Perm Styling', '韩式/日式', 'Korean/Japanese style', 18000, 'CAD', '/service', 0, 'FIXED', 'AVAILABLE', 4),

-- Facial & Skin Care
('item-5454-0001', '54545454-5454-5454-5454-545454545454', '深层清洁面部护理', 'Deep Cleansing Facial', '60分钟', '60 minutes', 8000, 'CAD', '/session', 0, 'FIXED', 'AVAILABLE', 1),
('item-5454-0002', '54545454-5454-5454-5454-545454545454', '补水保湿护理', 'Hydration Treatment', '90分钟', '90 minutes', 12000, 'CAD', '/session', 0, 'FIXED', 'AVAILABLE', 2),
('item-5454-0003', '54545454-5454-5454-5454-545454545454', '抗衰老疗程', 'Anti-Aging Treatment', '120分钟', '120 minutes', 18000, 'CAD', '/session', 0, 'FIXED', 'AVAILABLE', 3),

-- Airport Transfer YOW
('item-6060-0001', '60606060-6060-6060-6060-606060606060', 'Lees到YOW机场 - 单程', 'Lees to YOW - One Way', '约20分钟', '~20 minutes', 4500, 'CAD', '/trip', 0, 'FIXED', 'AVAILABLE', 1),
('item-6060-0002', '60606060-6060-6060-6060-606060606060', 'Kanata到YOW机场 - 单程', 'Kanata to YOW - One Way', '约25分钟', '~25 minutes', 5500, 'CAD', '/trip', 0, 'FIXED', 'AVAILABLE', 2),
('item-6060-0003', '60606060-6060-6060-6060-606060606060', '往返套票 - 8折', 'Round Trip - 20% Off', '提前预约优惠', 'Book both ways', 8000, 'CAD', '/trip', 0, 'FIXED', 'AVAILABLE', 3),

-- Carpool to T&T
('item-6161-0001', '61616161-6161-6161-6161-616161616161', 'T&T购物顺风车 - 往返', 'T&T Shopping Trip - Round', '周六上午', 'Saturday morning', 500, 'CAD', '/person', 0, 'FIXED', 'AVAILABLE', 1),

-- Carpool to Toronto
('item-6262-0001', '62626262-6262-6262-6262-626262626262', '渥太华到多伦多 - 单程', 'Ottawa to Toronto - One Way', '周五晚或周日晚', 'Fri/Sun evening', 4000, 'CAD', '/person', 0, 'FIXED', 'AVAILABLE', 1),
('item-6262-0002', '62626262-6262-6262-6262-626262626262', '往返套票', 'Round Trip Package', '周末往返', 'Weekend round trip', 7000, 'CAD', '/person', 0, 'FIXED', 'AVAILABLE', 2),

-- Montreal Airport YUL
('item-6363-0001', '63636363-6363-6363-6363-636363636363', 'Ottawa到YUL机场 - 单程', 'Ottawa to YUL - One Way', '约2小时', '~2 hours', 15000, 'CAD', '/trip', 0, 'FIXED', 'AVAILABLE', 1),

-- Daily Commute Carpool
('item-6464-0001', '64646464-6464-6464-6464-646464646464', '通勤顺风车 - 单日', 'Commute - Single Day', '往返', 'Round trip', 1000, 'CAD', '/day', 0, 'FIXED', 'AVAILABLE', 1),
('item-6464-0002', '64646464-6464-6464-6464-646464646464', '通勤顺风车 - 月票', 'Commute - Monthly Pass', '工作日往返', 'Weekdays round trip', 10000, 'CAD', '/month', 0, 'FIXED', 'AVAILABLE', 2);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check new listings count:
-- SELECT type, category_id, COUNT(*)
-- FROM public.listing_masters
-- WHERE id IN ('50505050-5050-5050-5050-505050505050', '51515151-5151-5151-5151-515151515151',
--              '52525252-5252-5252-5252-525252525252', '53535353-5353-5353-5353-535353535353',
--              '60606060-6060-6060-6060-606060606060', '61616161-6161-6161-6161-616161616161')
-- GROUP BY type, category_id;

-- View all professional services:
-- SELECT title_zh, type, category_id FROM public.listing_masters
-- WHERE category_id IN ('1020500', '1020600', '1050600', '1050700');
