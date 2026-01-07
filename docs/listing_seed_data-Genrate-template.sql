参考以下分类：
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


--需要用到以下四条的user ID

| id                                   | email                      | name           |
| ------------------------------------ | -------------------------- | -------------- |
| 16d48e8f-0952-4193-ab73-9e7f512b2996 | jinbeanart@gmail.com       | Neighbor       |
| 90a959d2-9b40-4848-a16c-8113a4598ec7 | han00137@algonquinlive.com | buyer-han00137 |
| 4ccc08eb-263b-4f40-9f44-5a5d1f1d44c1 | hanzhg@qq.com              | Andy           |
| e1507f9e-7343-4474-a1da-301a213943ec | hanzg2020@gmail.com        | Provider-Hang  |



----根据以下最新的数据结构和示例 生成 provider_profiles


create table public.provider_profiles (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  business_name_zh text not null,
  business_name_en text null,
  description_zh text null,
  description_en text null,
  identity public.provider_identity null default 'NEIGHBOR'::provider_identity,
  is_verified boolean null default false,
  badges text[] null,
  stats jsonb null default '{"total_income": 0, "total_orders": 0, "average_rating": 0}'::jsonb,
  location_address text null,
  location_coords geography null,
  service_radius_km numeric null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  verification_level integer null default 1,
  insurance_summary_en text null,
  license_info text null,
  status text null default 'ACTIVE'::text,
  constraint provider_profiles_pkey primary key (id),
  constraint provider_profiles_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger set_timestamp_providers BEFORE
update on provider_profiles for EACH row
execute FUNCTION trigger_set_timestamp ();


INSERT INTO "public"."provider_profiles" ("id", "user_id", "business_name_zh", "business_name_en", "description_zh", "description_en", "identity", "is_verified", "badges", "stats", "location_address", "location_coords", "service_radius_km", "created_at", "updated_at", "verification_level", "insurance_summary_en", "license_info", "status")
 VALUES ('10f3a1d2-9f4b-4e74-8a2e-1c2b3d4e5f60', '4ccc08eb-263b-4f40-9f44-5a5d1f1d44c1', '', 'Kanata Home Care', null, null, 'NEIGHBOR', 'true', null, '{"reviewCount":8,"totalOrders":12,"averageRating":4.9}', null, null, null, '2026-01-05 17:50:30.254396+00', '2026-01-05 17:50:30.254396+00', '3', null, null, 'ACTIVE')


----根据以下最新的数据结构和示例 生成 listing_master ，embedding 字段可以忽略

create table public.listing_masters (
  id uuid not null default extensions.uuid_generate_v4 (),
  provider_id uuid not null,
  title_zh text not null,
  title_en text null,
  description_zh text null,
  description_en text null,
  images text[] null,
  type public.listing_type not null,
  category_id text null,
  tags text[] null,
  status text null default 'PUBLISHED'::text,
  location_address text null,
  location_coords geography null,
  rating numeric null default 0,
  review_count integer null default 0,
  is_promoted boolean null default false,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  embedding public.vector null,
  node_id text null,
  location jsonb null,
  latitude double precision null,
  longitude double precision null,
  constraint listing_masters_pkey primary key (id),
  constraint listing_masters_category_id_fkey foreign KEY (category_id) references ref_codes (code_id),
  constraint listing_masters_provider_id_fkey foreign KEY (provider_id) references provider_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists listing_masters_embedding_idx on public.listing_masters using hnsw (embedding vector_cosine_ops) TABLESPACE pg_default;

create trigger generate_listing_embedding BEFORE INSERT
or
update OF title_zh,
title_en,
description_zh on listing_masters for EACH row
execute FUNCTION generate_embedding_for_listing ();

create trigger set_timestamp_masters BEFORE
update on listing_masters for EACH row
execute FUNCTION trigger_set_timestamp ();


INSERT INTO "public"."listing_masters" ("id", "provider_id", "title_zh", "title_en", "description_zh", "description_en", "images", "type", "category_id", "tags", "status", "location_address", "location_coords", "rating", "review_count", "is_promoted", "metadata", "created_at", "updated_at", "embedding", "node_id", "location", "latitude", "longitude")
VALUES ('30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80', ''10f3a1d2-9f4b-4e74-8a2e-1c2b3d4e5f60', '手工水饺 - 猪肉白菜 / 韭菜鸡蛋', 'Homemade Dumplings - Pork & Cabbage / Leek & Egg', '纯手工包制，皮薄馅大。猪肉白菜 $18/50个，韭菜鸡蛋 $16/50个。需提前1天预订。可冷冻保存。', 'Handmade dumplings, thin skin & generous filling. Pork $18/50pcs, Leek $16/50pcs. 1-day advance order. Freezable.', ARRAY["https://images.unsplash.com/photo-1496116218417-1a781b1c416c"], 'GOODS', '1040600', ARRAY["food","dumplings","chinese","frozen"], 'PUBLISHED', 'Lees Station Area', null, '4.9', '56', 'true', '{}', '2025-07-06 05:42:13.670053+00', '2026-01-06 05:42:13.670053+00', '[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]', 'NODE_LEES', null, null, null), 




----根据以下最新的数据结构和示例 生成 listing_items  
create table public.listing_items (
  id uuid not null default extensions.uuid_generate_v4 (),
  master_id uuid not null,
  name_zh text not null,
  name_en text null,
  description_zh text null,
  description_en text null,
  images text[] null,
  price_amount integer not null,
  price_currency text null default 'CNY'::text,
  price_unit text null,
  deposit_amount integer null default 0,
  pricing_model text null default 'FIXED'::text,
  status text null default 'AVAILABLE'::text,
  sort_order integer null default 0,
  attributes jsonb null default '{}'::jsonb,
  parent_item_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  pricing jsonb null,
  constraint listing_items_pkey primary key (id),
  constraint listing_items_master_id_fkey foreign KEY (master_id) references listing_masters (id) on delete CASCADE,
  constraint listing_items_parent_item_id_fkey foreign KEY (parent_item_id) references listing_items (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger set_timestamp_items BEFORE
update on listing_items for EACH row
execute FUNCTION trigger_set_timestamp ();


INSERT INTO "public"."listing_items" ("id", "master_id", "name_zh", "name_en", "description_zh", "description_en", "images", "price_amount", "price_currency", "price_unit", "deposit_amount", "pricing_model", "status", "sort_order", "attributes", "parent_item_id", "created_at", "updated_at", "pricing") 
VALUES ('50d7e5f6-5a6b-4c83-7e6f-5a6b7c8d9e00', '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80', 'Standard Driveway (2-Car)', 'Standard Driveway (2-Car)', null, 'Full cleaning of a standard family driveway.', null, '8500', 'CAD', 'per service', '0', 'FIXED', 'AVAILABLE', '0', '{}', null, '2026-01-05 18:19:17.680509+00', '2026-01-05 18:19:17.680509+00', '{"unit":"per service","model":"FIXED","price":{"amount":8500,"currency":"CAD","formatted":"$85.00"}}'), ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '定制砖石修复', 'Custom Interlocking Repair', null, 'Requires on-site assessment for accurate quote.', null, '0', 'CNY', 'per project', '0', 'QUOTE', 'AVAILABLE', '0', '{}', null, '2026-01-05 05:24:13.576118+00', '2026-01-05 05:24:13.576118+00', null), ('60e8f6a7-4b5c-4d94-6f7a-6b7c8d9e0f10', '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80', 'Large Driveway (4-Car+)', 'Large Driveway (4-Car+)', null, 'Specialized for larger properties or interlocking stone.', null, '15000', 'CAD', 'per service', '0', 'FIXED', 'AVAILABLE', '0', '{}', null, '2026-01-05 18:19:17.680509+00', '2026-01-05 18:19:17.680509+00', '{"unit":"per service","model":"FIXED","price":{"amount":15000,"currency":"CAD","formatted":"$150.00"}}'), ('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '上门评估', 'On-Site Assessment', null, 'Professional visit to inspect property and provide detailed quote.', null, '5000', 'CNY', 'per visit', '0', 'VISIT_FEE', 'AVAILABLE', '0', '{}', null, '2026-01-05 05:24:13.576118+00', '2026-01-05 05:24:13.576118+00', null), ('70f9a7b8-3c4d-4e05-5a6b-7c8d9e0f1a20', '40c6d4e5-6f7a-4b72-8d5e-4f5a6b7c8d90', 'Daily Rental-zh', 'Daily Rental', null, 'Includes drill, 2 batteries, and hard case.', null, '1500', 'CAD', 'per day', '10000', 'DAILY', 'AVAILABLE', '0', '{}', null, '2026-01-05 18:19:17.680509+00', '2026-01-05 18:19:17.680509+00', '{"unit":"per day","model":"DAILY","price":{"amount":1500,"currency":"CAD","formatted":"$15.00"},"deposit":{"amount":10000,"currency":"CAD","formatted":"$100.00"}}'), ('80a0b8c9-2d3e-4f16-4b5c-8d9e0f1a2b30', '40c6d4e5-6f7a-4b72-8d5e-4f5a6b7c8d90', 'Weekend Special (3 Days)-zh', 'Weekend Special (3 Days)', null, 'Pick up Friday, return Monday.', null, '3500', 'CAD', 'per weekend', '10000', 'FIXED', 'AVAILABLE', '0', '{}', null, '2026-01-05 18:19:17.680509+00', '2026-01-05 18:19:17.680509+00', '{"unit":"per weekend","model":"FIXED","price":{"amount":3500,"currency":"CAD","formatted":"$35.00"},"deposit":{"amount":10000,"currency":"CAD","formatted":"$100.00"}}'), ('90b1c9da-1e2f-4a27-3c4d-9e0f1a2b3c40', '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80', 'Custom Interlocking Repair-zh', 'Custom Interlocking Repair', null, 'Requires on-site assessment for accurate quote.', null, '0', 'CAD', 'per project', '0', 'QUOTE', 'AVAILABLE', '0', '{}', null, '2026-01-05 18:19:17.680509+00', '2026-01-05 18:19:17.680509+00', '{"unit":"per project","model":"QUOTE","price":{"amount":0,"currency":"CAD","formatted":"$0.00"}}'), ('a0c2dab1-0f1e-4b38-2d3e-0f1a2b3c4d50', '30b5c3d4-7f8e-4a61-9c4d-3e4f5a6b7c80', 'On-Site Assessment-zh', 'On-Site Assessment', null, 'Professional visit to inspect property and provide detailed quote.', null, '5000', 'CAD', 'per visit', '0', 'VISIT_FEE', 'AVAILABLE', '0', '{}', null, '2026-01-05 18:19:17.680509+00', '2026-01-05 18:19:17.680509+00', '{"unit":"per visit","model":"VISIT_FEE","price":{"amount":5000,"currency":"CAD","formatted":"$50.00"}}'), ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '标准车道', 'Standard (2-Car)', null, 'Full cleaning.', null, '8500', 'CNY', 'service', '0', 'FIXED', 'AVAILABLE', '0', '{}', null, '2026-01-05 03:56:45.710326+00', '2026-01-05 05:24:13.576118+00', null), ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '日租', 'Daily Rental', null, 'Includes drill/case.', null, '1500', 'CNY', 'day', '10000', 'DAILY', 'AVAILABLE', '0', '{}', null, '2026-01-05 04:56:45.710326+00', '2026-01-05 03:56:45.710326+00', null);