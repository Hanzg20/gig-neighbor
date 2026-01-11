-- 🍁 SEED DATA: Eagleson Coin Wash (Final Production-Ready Version)
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
