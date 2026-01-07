-- ============================================================================
-- SAMPLE LISTINGS DATA FOR HANGHAND PLATFORM
-- ============================================================================
-- Purpose: Populate listing_masters and listing_items with diverse test data
-- Execute this after seed_data.sql
-- Date: 2026-01-06

-- ============================================================================
-- STEP 1: CREATE MOCK PROVIDER PROFILES
-- ============================================================================

-- Note: These UUIDs are static for dev/testing purposes
-- In production, these would come from actual registered users

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
-- Provider 1: Lao Wang - Handyman & Home Services
('11111111-1111-1111-1111-111111111110',
 'a1111111-1111-1111-1111-11111111111a',
 'NEIGHBOR',
 '老王师傅',
 'Mr. Wang',
 '社区邻居，擅长家具组装、水电维修。10年经验。',
 'Experienced handyman, 10+ years in home maintenance and furniture assembly.',
 ARRAY['NODE_LEES', 'NODE_KANATA'],
 3,
 ARRAY['VERIFIED_NEIGHBOR', 'TOP_RATED'],
 'APPROVED',
 NOW() - INTERVAL '3 months'
),
-- Provider 2: Emma Chen - Food & Marketplace
('22222222-2222-2222-2222-222222222220',
 'b2222222-2222-2222-2222-22222222222b',
 'NEIGHBOR',
 '陈阿姨私房菜',
 'Emma Home Kitchen',
 '地道川菜，每周三、五供应。可预订。',
 'Authentic Sichuan cuisine. Available Wed & Fri. Pre-order only.',
 ARRAY['NODE_LEES'],
 5,
 ARRAY['VERIFIED_NEIGHBOR', 'COMMUNITY_FAVORITE', 'TOP_RATED'],
 'APPROVED',
 NOW() - INTERVAL '6 months'
),
-- Provider 3: Mike Tools - Rentals
('c3333333-3333-3333-3333-33333333333c',
 'c3333333-3333-3333-3333-33333333333c',
 'NEIGHBOR',
 '迈克工具租赁',
 'Mike Tool Rental',
 '专业工具出租，按天计费。包含割草机、钻机、梯子等。',
 'Professional tool rental service. Lawnmowers, drills, ladders, and more.',
 ARRAY['NODE_KANATA'],
 4,
 ARRAY['VERIFIED_NEIGHBOR'],
 'APPROVED',
 NOW() - INTERVAL '1 year'
),
-- Provider 4: Sarah Pets - Pet Care
('d4444444-4444-4444-4444-44444444444d',
 'd4444444-4444-4444-4444-44444444444d',
 'NEIGHBOR',
 '莎拉宠物之家',
 'Sarah Pet Care',
 '宠物寄养、遛狗服务。家中有院子，适合中小型犬。',
 'Pet boarding and dog walking. Fenced backyard, suitable for small-medium dogs.',
 ARRAY['NODE_LEES'],
 4,
 ARRAY['VERIFIED_NEIGHBOR', 'PET_FRIENDLY'],
 'APPROVED',
 NOW() - INTERVAL '8 months'
)
ON CONFLICT (id) DO UPDATE SET
  business_name_zh = EXCLUDED.business_name_zh,
  business_name_en = EXCLUDED.business_name_en;

-- ============================================================================
-- STEP 2: LISTING_MASTERS (Diverse Types)
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
-- TYPE: SERVICE (生活服务) - 6 items
-- ============================================================================

-- 1. Deep Cleaning Service
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'a1111111-1111-1111-1111-11111111111a',
 '深度保洁服务 - 整屋清洁',
 'Deep Cleaning - Whole Home',
 '专业保洁团队，提供全屋深度清洁。包括厨房油污、卫生间除垢、窗户清洁等。使用环保清洁剂。',
 'Professional cleaning team. Includes kitchen degreasing, bathroom descaling, window cleaning. Eco-friendly products.',
 ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952'],
 'SERVICE',
 '1010100',
 'NODE_LEES',
 ARRAY['cleaning', 'deep-clean', 'eco-friendly'],
 'PUBLISHED',
 'Lees Ave, Ottawa',
 4.8,
 23,
 true,
 NOW() - INTERVAL '2 months'
),

-- 2. Handyman - General Repairs
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'a1111111-1111-1111-1111-11111111111a',
 '居家维修服务 - 水电木工',
 'Handyman - Plumbing & Electrical',
 '小型水电维修、墙面补洞、门锁更换、家具组装等。10年经验，工具齐全。',
 'Minor plumbing & electrical repairs, drywall patching, lock replacement, furniture assembly. 10+ years experience.',
 ARRAY['https://images.unsplash.com/photo-1581092921461-eab62e97a780'],
 'SERVICE',
 '1010400',
 'NODE_KANATA',
 ARRAY['handyman', 'repair', 'plumbing', 'electrical'],
 'PUBLISHED',
 'Kanata Lakes, Ottawa',
 4.9,
 45,
 false,
 NOW() - INTERVAL '3 months'
),

-- 3. Moving Help
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 'a1111111-1111-1111-1111-11111111111a',
 '搬家互助 - 同城搬运',
 'Moving Help - Local Moves',
 '提供搬家打包、搬运服务。有小货车，适合公寓、townhouse搬迁。按小时计费。',
 'Packing and moving services. Small truck available. Perfect for apartments & townhouses. Hourly rate.',
 ARRAY['https://images.unsplash.com/photo-1600880292203-757bb62b4baf'],
 'SERVICE',
 '1010500',
 'NODE_LEES',
 ARRAY['moving', 'truck', 'local'],
 'PUBLISHED',
 'Ottawa South',
 4.7,
 18,
 false,
 NOW() - INTERVAL '1 month'
),

-- 4. Dog Walking & Pet Sitting
('dddddddd-dddd-dddd-dddd-dddddddddddd',
 'd4444444-4444-4444-4444-44444444444d',
 '宠物寄养 + 遛狗服务',
 'Pet Boarding & Dog Walking',
 '温馨家庭环境，有围栏院子。可接受中小型犬寄养。每日2次遛狗，提供照片更新。',
 'Cozy home with fenced yard. Small-medium dogs welcome. 2 daily walks, photo updates provided.',
 ARRAY['https://images.unsplash.com/photo-1548199973-03cce0bbc87b'],
 'SERVICE',
 '1030100',
 'NODE_LEES',
 ARRAY['pet-care', 'dog-walking', 'boarding'],
 'PUBLISHED',
 'Alta Vista, Ottawa',
 5.0,
 31,
 true,
 NOW() - INTERVAL '8 months'
),

-- 5. After-School Childcare
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 'd4444444-4444-4444-4444-44444444444d',
 '课后托管 - 接放学 + 作业辅导',
 'After-School Care - Pickup + Homework Help',
 '可接送孩子放学，提供作业辅导和课后照看。有急救证书和无犯罪记录。',
 'School pickup, homework help, and supervision. First Aid certified with clean background check.',
 ARRAY['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9'],
 'SERVICE',
 '1030600',
 'NODE_KANATA',
 ARRAY['childcare', 'tutoring', 'pickup'],
 'PUBLISHED',
 'Kanata South',
 4.9,
 12,
 false,
 NOW() - INTERVAL '4 months'
),

-- 6. Private Chef - Meal Prep
('ffffffff-ffff-ffff-ffff-ffffffffffff',
 'b2222222-2222-2222-2222-22222222222b',
 '上门做饭 - 川菜私厨',
 'Private Chef - Sichuan Cuisine',
 '提供上门做饭服务。擅长川菜、家常菜。可按周订餐（4-6人份）。食材新鲜，口味地道。',
 'In-home cooking service. Specializes in Sichuan & home-style dishes. Weekly meal prep available (4-6 servings).',
 ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d'],
 'SERVICE',
 '1010700',
 'NODE_LEES',
 ARRAY['cooking', 'sichuan', 'meal-prep'],
 'PUBLISHED',
 'Lees Ave',
 4.8,
 27,
 true,
 NOW() - INTERVAL '5 months'
),

-- ============================================================================
-- TYPE: GOODS (美食市集) - 6 items
-- ============================================================================

-- 7. Homemade Dumplings
('10101010-1010-1010-1010-101010101010',
 'b2222222-2222-2222-2222-22222222222b',
 '手工水饺 - 猪肉白菜 / 韭菜鸡蛋',
 'Homemade Dumplings - Pork & Cabbage / Leek & Egg',
 '纯手工包制，皮薄馅大。猪肉白菜 $18/50个，韭菜鸡蛋 $16/50个。需提前1天预订。可冷冻保存。',
 'Handmade dumplings, thin skin & generous filling. Pork $18/50pcs, Leek $16/50pcs. 1-day advance order. Freezable.',
 ARRAY['https://images.unsplash.com/photo-1496116218417-1a781b1c416c'],
 'GOODS',
 '1040600',
 'NODE_LEES',
 ARRAY['food', 'dumplings', 'chinese', 'frozen'],
 'PUBLISHED',
 'Lees Station Area',
 4.9,
 56,
 true,
 NOW() - INTERVAL '6 months'
),

-- 8. Fresh Sourdough Bread
('11111110-1111-1111-1111-111111111110',
 'b2222222-2222-2222-2222-22222222222b',
 '天然酵母面包 - 每周三、五供应',
 'Artisan Sourdough - Wed & Fri Only',
 '100%天然酵母发酵，长时间低温发酵。外脆内软，麦香浓郁。每个 $8，需提前预订。',
 '100% natural sourdough starter, slow-fermented. Crispy crust, soft interior. $8/loaf. Pre-order required.',
 ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff'],
 'GOODS',
 '1040600',
 'NODE_LEES',
 ARRAY['food', 'bread', 'sourdough', 'organic'],
 'PUBLISHED',
 'Lees Community',
 5.0,
 42,
 false,
 NOW() - INTERVAL '7 months'
),

-- 9. Used Kids Bike - Like New
('12121212-1212-1212-1212-121212121212',
 'd4444444-4444-4444-4444-44444444444d',
 '儿童自行车 - 95新 - 适合5-7岁',
 'Kids Bike - Like New - Ages 5-7',
 '孩子长大了不骑了。95新，无划痕。16寸轮，带辅助轮和车铃。原价$150，现售$50。',
 'Outgrown. Excellent condition, no scratches. 16" wheels with training wheels & bell. Orig $150, now $50.',
 ARRAY['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91'],
 'GOODS',
 '1040200',
 'NODE_KANATA',
 ARRAY['kids', 'bike', 'used', 'outdoor'],
 'PUBLISHED',
 'Kanata Lakes',
 4.5,
 3,
 false,
 NOW() - INTERVAL '2 weeks'
),

-- 10. Free Moving Boxes
('13131313-1313-1313-1313-131313131313',
 'a1111111-1111-1111-1111-11111111111a',
 '免费纸箱 - 搬家用 - 自取',
 'Free Moving Boxes - Pickup Only',
 '刚搬完家，有20多个干净纸箱。大中小都有。免费送，先到先得。需自取。',
 'Just moved. 20+ clean boxes in various sizes. Free! First come first served. Must pick up.',
 ARRAY['https://images.unsplash.com/photo-1565689157206-0fddef7589a2'],
 'GOODS',
 '1040100',
 'NODE_LEES',
 ARRAY['free', 'boxes', 'moving'],
 'PUBLISHED',
 'Lees Area',
 0,
 0,
 false,
 NOW() - INTERVAL '3 days'
),

-- 11. Hockey Equipment - Youth
('14141414-1414-1414-1414-141414141414',
 'c3333333-3333-3333-3333-33333333333c',
 '冰球装备 - 青少年款 - 整套出售',
 'Hockey Gear - Youth Size - Full Set',
 '孩子转项了，整套冰球装备出售。头盔、护具、冰鞋(Size 5)、球杆。8成新，$200整套。',
 'Kid switched sports. Full hockey set: helmet, pads, skates (Size 5), stick. Good condition. $200 complete.',
 ARRAY['https://images.unsplash.com/photo-1515703407324-5f753afd8be8'],
 'GOODS',
 '1040400',
 'NODE_KANATA',
 ARRAY['sports', 'hockey', 'used', 'youth'],
 'PUBLISHED',
 'Kanata North',
 4.0,
 2,
 false,
 NOW() - INTERVAL '1 week'
),

-- 12. Homemade Kimchi
('15151515-1515-1515-1515-151515151515',
 'b2222222-2222-2222-2222-22222222222b',
 '自制韩式泡菜 - 辣白菜 500g',
 'Homemade Kimchi - Spicy Cabbage 500g',
 '传统韩式发酵泡菜，发酵7-10天。辣度适中，开胃下饭。$12/瓶(500g)。',
 'Traditional fermented kimchi, 7-10 days fermentation. Medium spice. Perfect side dish. $12/jar (500g).',
 ARRAY['https://images.unsplash.com/photo-1589621316382-008455b857cd'],
 'GOODS',
 '1040500',
 'NODE_LEES',
 ARRAY['food', 'kimchi', 'korean', 'fermented'],
 'PUBLISHED',
 'Lees Community',
 4.7,
 15,
 false,
 NOW() - INTERVAL '2 months'
),

-- ============================================================================
-- TYPE: RENTAL (共享租赁) - 4 items
-- ============================================================================

-- 13. Lawn Mower Rental
('20202020-2020-2020-2020-202020202020',
 'c3333333-3333-3333-3333-33333333333c',
 '割草机出租 - 汽油动力 - 按天计费',
 'Lawn Mower Rental - Gas Powered - Daily Rate',
 '21寸自走式割草机，状态良好。$30/天，$80/周末(周五-周日)。包含汽油。需押金$100。',
 '21" self-propelled mower, excellent condition. $30/day, $80/weekend (Fri-Sun). Gas included. $100 deposit.',
 ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64'],
 'RENTAL',
 '1040300',
 'NODE_KANATA',
 ARRAY['tools', 'lawn', 'outdoor', 'seasonal'],
 'PUBLISHED',
 'Kanata Lakes',
 4.8,
 34,
 true,
 NOW() - INTERVAL '1 year'
),

-- 14. Pressure Washer Rental
('21212121-2121-2121-2121-212121212121',
 'c3333333-3333-3333-3333-33333333333c',
 '高压清洗机 - 洗车/洗外墙',
 'Pressure Washer - Car/House Exterior',
 '2000 PSI电动高压清洗机。适合洗车、清洁车道、外墙。$40/天。需押金$150。',
 '2000 PSI electric pressure washer. Great for cars, driveways, siding. $40/day. $150 deposit required.',
 ARRAY['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39'],
 'RENTAL',
 '1040300',
 'NODE_KANATA',
 ARRAY['tools', 'cleaning', 'outdoor'],
 'PUBLISHED',
 'Kanata South',
 4.6,
 22,
 false,
 NOW() - INTERVAL '8 months'
),

-- 15. Camping Tent - 4 Person
('22222221-2222-2222-2222-222222222221',
 'c3333333-3333-3333-3333-33333333333c',
 '4人帐篷出租 - 适合家庭露营',
 '4-Person Tent Rental - Family Camping',
 'Coleman 4人帐篷，防水性能好。适合家庭周末露营。$25/周末(2晚)，$40/周。',
 'Coleman 4-person tent, waterproof. Perfect for family weekend camping. $25/weekend (2 nights), $40/week.',
 ARRAY['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d'],
 'RENTAL',
 '1040400',
 'NODE_KANATA',
 ARRAY['camping', 'outdoor', 'family', 'summer'],
 'PUBLISHED',
 'Kanata',
 4.7,
 18,
 false,
 NOW() - INTERVAL '5 months'
),

-- 16. Drill & Tool Kit
('23232323-2323-2323-2323-232323232323',
 'c3333333-3333-3333-3333-33333333333c',
 '电钻工具套装 - DeWalt 20V无线',
 'Drill & Tool Set - DeWalt 20V Cordless',
 'DeWalt 20V无线电钻 + 常用工具套装(螺丝刀、锤子、扳手等)。$20/天，$50/周。',
 'DeWalt 20V cordless drill + basic tool set (screwdrivers, hammer, wrenches). $20/day, $50/week.',
 ARRAY['https://images.unsplash.com/photo-1530124566582-a618bc2615dc'],
 'RENTAL',
 '1040300',
 'NODE_KANATA',
 ARRAY['tools', 'drill', 'dewalt', 'diy'],
 'PUBLISHED',
 'Kanata Lakes',
 4.9,
 41,
 true,
 NOW() - INTERVAL '1 year'
),

-- ============================================================================
-- TYPE: TASK (附近任务 - Buyer Posts) - 4 items
-- ============================================================================

-- 17. Snow Clearing Needed
('30303030-3030-3030-3030-303030303030',
 'd4444444-4444-4444-4444-44444444444d',
 '需要帮忙铲雪 - 车道 + 人行道',
 'Snow Clearing Needed - Driveway + Walkway',
 '今天下了大雪，需要有人帮忙清理车道和门前人行道。约1小时工作量。急需！',
 'Heavy snowfall today. Need help clearing driveway and front walkway. About 1 hour work. Urgent!',
 ARRAY['https://images.unsplash.com/photo-1483664852095-d6cc6870702d'],
 'TASK',
 '1050100',
 'NODE_LEES',
 ARRAY['snow', 'winter', 'urgent', 'outdoor'],
 'PUBLISHED',
 'Lees Ave',
 0,
 0,
 true,
 NOW() - INTERVAL '2 hours'
),

-- 18. Lawn Mowing Needed
('31313131-3131-3131-3131-313131313131',
 'a1111111-1111-1111-1111-11111111111a',
 '周末需要割草 - 中等院子',
 'Weekend Lawn Mowing - Medium Yard',
 '周末有空的话帮忙割一下草。院子不大，约30分钟。工具我有，也可以用你的。',
 'Need lawn mowing this weekend. Medium yard, ~30 mins. I have tools but you can bring yours too.',
 ARRAY['https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5'],
 'TASK',
 '1050200',
 'NODE_KANATA',
 ARRAY['lawn', 'summer', 'outdoor'],
 'PUBLISHED',
 'Kanata South',
 0,
 0,
 false,
 NOW() - INTERVAL '1 day'
),

-- 19. Grocery Shopping Help
('32323232-3232-3232-3232-323232323232',
 'd4444444-4444-4444-4444-44444444444d',
 '帮忙代购 - Costco + 中超',
 'Grocery Shopping Help - Costco + Asian Market',
 '腿受伤了不方便出门。需要有人帮忙去Costco和中超买菜。有购物清单。可补贴油费。',
 'Injured leg, cant go out. Need someone to shop at Costco & Asian market. Shopping list ready. Gas money included.',
 ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e'],
 'TASK',
 '1010600',
 'NODE_LEES',
 ARRAY['errands', 'shopping', 'groceries'],
 'PUBLISHED',
 'Lees Station',
 0,
 0,
 false,
 NOW() - INTERVAL '3 hours'
),

-- 20. Furniture Assembly Needed
('33333332-3333-3333-3333-333333333332',
 'a1111111-1111-1111-1111-11111111111a',
 'IKEA家具组装 - 书柜 + 床架',
 'IKEA Assembly - Bookshelf + Bed Frame',
 '买了IKEA书柜和床架，需要有人帮忙组装。有工具更好，没有的话我有。预计2-3小时。',
 'Bought IKEA bookshelf & bed frame. Need assembly help. Tools preferred but I have some. Est. 2-3 hours.',
 ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
 'TASK',
 '1010300',
 'NODE_KANATA',
 ARRAY['furniture', 'ikea', 'assembly', 'indoor'],
 'PUBLISHED',
 'Kanata North',
 0,
 0,
 false,
 NOW() - INTERVAL '6 hours'
);

-- ============================================================================
-- STEP 3: LISTING_ITEMS (Sample Items for Each Master)
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

-- Items for SERVICE listings
('item-aaaa-0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '标准清洁 - 2房2卫', 'Standard Clean - 2BR/2BA', '约3-4小时', 'Approx 3-4 hours', 12000, 'CAD', '/job', 0, 'FIXED', 'AVAILABLE', 1),
('item-aaaa-0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '深度清洁 - 3房3卫', 'Deep Clean - 3BR/3BA', '约5-6小时', 'Approx 5-6 hours', 18000, 'CAD', '/job', 0, 'FIXED', 'AVAILABLE', 2),

('item-bbbb-0001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '小型维修', 'Minor Repair', '简单维修任务', 'Simple repair tasks', 6000, 'CAD', '/hour', 0, 'HOURLY', 'AVAILABLE', 1),
('item-bbbb-0002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '家具组装', 'Furniture Assembly', '按小时计费', 'Hourly rate', 5000, 'CAD', '/hour', 0, 'HOURLY', 'AVAILABLE', 2),

('item-cccc-0001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '搬家服务 - 基础', 'Moving - Basic', '2人 + 小货车', '2 movers + small truck', 8000, 'CAD', '/hour', 5000, 'HOURLY', 'AVAILABLE', 1),
('item-cccc-0002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '搬家服务 - 全包', 'Moving - Full Service', '打包 + 搬运', 'Packing + moving', 10000, 'CAD', '/hour', 5000, 'HOURLY', 'AVAILABLE', 2),

('item-dddd-0001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '遛狗服务 - 单次', 'Dog Walk - Single', '30-45分钟', '30-45 minutes', 2000, 'CAD', '/walk', 0, 'FIXED', 'AVAILABLE', 1),
('item-dddd-0002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '宠物寄养 - 每晚', 'Pet Boarding - Per Night', '包含2次遛狗', 'Includes 2 walks', 4500, 'CAD', '/night', 0, 'FIXED', 'AVAILABLE', 2),

('item-eeee-0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '课后托管 - 单日', 'After-School - Single Day', '3pm-6pm', '3pm-6pm', 3500, 'CAD', '/day', 0, 'FIXED', 'AVAILABLE', 1),
('item-eeee-0002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '课后托管 - 包周', 'After-School - Weekly', '周一至周五', 'Mon-Fri', 15000, 'CAD', '/week', 0, 'FIXED', 'AVAILABLE', 2),

('item-ffff-0001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '上门做饭 - 4人份', 'Private Chef - 4 Servings', '3菜1汤', '3 dishes + soup', 8000, 'CAD', '/meal', 0, 'FIXED', 'AVAILABLE', 1),
('item-ffff-0002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '上门做饭 - 6人份', 'Private Chef - 6 Servings', '4菜1汤', '4 dishes + soup', 12000, 'CAD', '/meal', 0, 'FIXED', 'AVAILABLE', 2),

-- Items for GOODS listings
('item-1010-0001', '10101010-1010-1010-1010-101010101010', '猪肉白菜水饺 50个', 'Pork & Cabbage Dumplings 50pcs', '经典口味', 'Classic flavor', 1800, 'CAD', '/pack', 0, 'FIXED', 'AVAILABLE', 1),
('item-1010-0002', '10101010-1010-1010-1010-101010101010', '韭菜鸡蛋水饺 50个', 'Leek & Egg Dumplings 50pcs', '素食选择', 'Vegetarian option', 1600, 'CAD', '/pack', 0, 'FIXED', 'AVAILABLE', 2),

('item-1111-0001', '11111110-1111-1111-1111-111111111110', '天然酵母面包 - 原味', 'Sourdough - Original', '经典原味', 'Classic', 800, 'CAD', '/loaf', 0, 'FIXED', 'AVAILABLE', 1),
('item-1111-0002', '11111110-1111-1111-1111-111111111110', '天然酵母面包 - 全麦', 'Sourdough - Whole Wheat', '健康选择', 'Healthy option', 900, 'CAD', '/loaf', 0, 'FIXED', 'AVAILABLE', 2),

('item-1212-0001', '12121212-1212-1212-1212-121212121212', '儿童自行车 16寸', 'Kids Bike 16"', '含辅助轮', 'With training wheels', 5000, 'CAD', '/unit', 0, 'FIXED', 'AVAILABLE', 1),

('item-1313-0001', '13131313-1313-1313-1313-131313131313', '纸箱 - 大号', 'Large Box', '免费', 'Free', 0, 'CAD', '/box', 0, 'FIXED', 'AVAILABLE', 1),
('item-1313-0002', '13131313-1313-1313-1313-131313131313', '纸箱 - 中号', 'Medium Box', '免费', 'Free', 0, 'CAD', '/box', 0, 'FIXED', 'AVAILABLE', 2),

('item-1414-0001', '14141414-1414-1414-1414-141414141414', '冰球装备全套', 'Full Hockey Set', '含头盔、护具、冰鞋、球杆', 'Helmet, pads, skates, stick', 20000, 'CAD', '/set', 0, 'FIXED', 'AVAILABLE', 1),

('item-1515-0001', '15151515-1515-1515-1515-151515151515', '韩式泡菜 500g', 'Kimchi 500g', '传统发酵', 'Traditional fermented', 1200, 'CAD', '/jar', 0, 'FIXED', 'AVAILABLE', 1),

-- Items for RENTAL listings
('item-2020-0001', '20202020-2020-2020-2020-202020202020', '割草机租赁 - 日租', 'Mower - Daily', '包含汽油', 'Gas included', 3000, 'CAD', '/day', 10000, 'FIXED', 'AVAILABLE', 1),
('item-2020-0002', '20202020-2020-2020-2020-202020202020', '割草机租赁 - 周末', 'Mower - Weekend', '周五-周日', 'Fri-Sun', 8000, 'CAD', '/weekend', 10000, 'FIXED', 'AVAILABLE', 2),

('item-2121-0001', '21212121-2121-2121-2121-212121212121', '高压清洗机 - 日租', 'Pressure Washer - Daily', '2000 PSI', '2000 PSI', 4000, 'CAD', '/day', 15000, 'FIXED', 'AVAILABLE', 1),

('item-2222-0001', '22222221-2222-2222-2222-222222222221', '4人帐篷 - 周末', 'Tent - Weekend', '2晚', '2 nights', 2500, 'CAD', '/weekend', 5000, 'FIXED', 'AVAILABLE', 1),
('item-2222-0002', '22222221-2222-2222-2222-222222222221', '4人帐篷 - 周租', 'Tent - Weekly', '7天', '7 days', 4000, 'CAD', '/week', 5000, 'FIXED', 'AVAILABLE', 2),

('item-2323-0001', '23232323-2323-2323-2323-232323232323', '电钻套装 - 日租', 'Drill Set - Daily', 'DeWalt 20V', 'DeWalt 20V', 2000, 'CAD', '/day', 5000, 'FIXED', 'AVAILABLE', 1),
('item-2323-0002', '23232323-2323-2323-2323-232323232323', '电钻套装 - 周租', 'Drill Set - Weekly', 'DeWalt 20V', 'DeWalt 20V', 5000, 'CAD', '/week', 5000, 'FIXED', 'AVAILABLE', 2),

-- Items for TASK listings (Quote-based, so placeholder prices)
('item-3030-0001', '30303030-3030-3030-3030-303030303030', '铲雪服务', 'Snow Clearing', '根据工作量报价', 'Quote based on scope', 0, 'CAD', '/quote', 0, 'QUOTE_BASED', 'AVAILABLE', 1),

('item-3131-0001', '31313131-3131-3131-3131-313131313131', '割草服务', 'Lawn Mowing', '根据院子大小报价', 'Quote based on yard size', 0, 'CAD', '/quote', 0, 'QUOTE_BASED', 'AVAILABLE', 1),

('item-3232-0001', '32323232-3232-3232-3232-323232323232', '代购服务', 'Shopping Service', '含油费补贴', 'Gas money included', 0, 'CAD', '/quote', 0, 'QUOTE_BASED', 'AVAILABLE', 1),

('item-3333-0001', '33333332-3333-3333-3333-333333333332', '家具组装', 'Furniture Assembly', '按时间和难度报价', 'Quote based on time & complexity', 0, 'CAD', '/quote', 0, 'QUOTE_BASED', 'AVAILABLE', 1);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the data was inserted correctly:

-- Count listings by type:
-- SELECT type, COUNT(*) FROM public.listing_masters GROUP BY type;

-- Count items per master:
-- SELECT master_id, COUNT(*) FROM public.listing_items GROUP BY master_id;

-- Check a random listing with its items:
-- SELECT lm.title_en, li.name_en, li.price_amount
-- FROM public.listing_masters lm
-- JOIN public.listing_items li ON lm.id = li.master_id
-- LIMIT 10;
