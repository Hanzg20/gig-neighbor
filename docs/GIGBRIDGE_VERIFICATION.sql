-- ==========================================
-- GigBridge 部署验证脚本
-- Verification Script for GigBridge Deployment
-- ==========================================
-- 在 Supabase SQL Editor 中运行此脚本来验证部署是否成功
-- Run this script in Supabase SQL Editor to verify deployment

-- ==========================================
-- 1. 验证表结构 (Verify Table Structure)
-- ==========================================
SELECT
    'Tables Created' as check_type,
    COUNT(*) as count,
    STRING_AGG(table_name, ', ') as tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('listing_inventory', 'inventory_usage_logs');
-- 预期结果: count = 2

-- ==========================================
-- 2. 验证 RPC 函数 (Verify RPC Functions)
-- ==========================================
SELECT
    'RPC Functions' as check_type,
    COUNT(*) as count,
    STRING_AGG(routine_name, ', ') as functions
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('allocate_inventory_item', 'handle_order_fulfillment');
-- 预期结果: count = 2

-- ==========================================
-- 3. 验证触发器 (Verify Triggers)
-- ==========================================
SELECT
    'Triggers' as check_type,
    COUNT(*) as count,
    STRING_AGG(trigger_name, ', ') as triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'listing_inventory';
-- 预期结果: count >= 1 (set_timestamp_inventory)

-- ==========================================
-- 4. 验证 RLS 策略 (Verify RLS Policies)
-- ==========================================
SELECT
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('listing_inventory', 'inventory_usage_logs');
-- 预期结果: 至少 2 条策略

-- ==========================================
-- 5. 验证索引 (Verify Indexes)
-- ==========================================
SELECT
    'Indexes' as check_type,
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'listing_inventory'
  AND indexname = 'idx_inventory_alloc';
-- 预期结果: 1 条记录

-- ==========================================
-- 6. 验证 Provider 数据 (Verify Provider Data)
-- ==========================================
SELECT
    '✅ Provider: Eagleson Coin Wash' as check_type,
    id,
    business_name_zh,
    business_name_en,
    is_verified,
    verification_level,
    badges
FROM provider_profiles
WHERE business_name_en = 'Eagleson Coin Wash';
-- 预期结果: 1 行，is_verified = true, verification_level = 3

-- ==========================================
-- 7. 验证 Listing Master (Verify Listing Master)
-- ==========================================
SELECT
    '✅ Master: Recharge Card' as check_type,
    id,
    title_zh,
    title_en,
    type,
    status,
    metadata->>'is_serialized' as is_serialized,
    metadata->'fulfillment_config'->>'auto_notify' as auto_notify
FROM listing_masters
WHERE title_en = 'Self-Service Wash Recharge Card';
-- 预期结果: 1 行，is_serialized = 'true', auto_notify = 'true'

-- ==========================================
-- 8. 验证 Listing Items (3 SKUs)
-- ==========================================
SELECT
    '✅ Items: 3 SKUs' as check_type,
    id,
    name_zh,
    name_en,
    price_amount / 100.0 as price_cad,
    pricing->'price'->>'formatted' as formatted_price,
    status
FROM listing_items
WHERE master_id IN (
    SELECT id FROM listing_masters
    WHERE title_en = 'Self-Service Wash Recharge Card'
)
ORDER BY price_amount;
-- 预期结果: 3 行 ($50, $100, $200)

-- ==========================================
-- 9. 验证库存 (15 张卡) - 核心验证
-- ==========================================
SELECT
    '✅ Inventory: 15 Cards' as check_type,
    status,
    COUNT(*) as count,
    STRING_AGG(DISTINCT SUBSTRING(serial_number, 1, 6), ', ') as serial_prefixes
FROM listing_inventory
WHERE provider_id IN (
    SELECT id FROM provider_profiles
    WHERE business_name_en = 'Eagleson Coin Wash'
)
GROUP BY status;
-- 预期结果: status = 'available', count = 15

-- ==========================================
-- 10. 按规格统计库存 (Inventory by SKU)
-- ==========================================
SELECT
    '✅ Inventory Distribution' as check_type,
    li.name_zh,
    li.price_amount / 100.0 as price_cad,
    COUNT(inv.id) as inventory_count,
    SUM(CASE WHEN inv.status = 'available' THEN 1 ELSE 0 END) as available_count,
    SUM(CASE WHEN inv.status = 'sold' THEN 1 ELSE 0 END) as sold_count
FROM listing_items li
LEFT JOIN listing_inventory inv ON inv.listing_item_id = li.id
WHERE li.master_id IN (
    SELECT id FROM listing_masters
    WHERE title_en = 'Self-Service Wash Recharge Card'
)
GROUP BY li.id, li.name_zh, li.price_amount
ORDER BY li.price_amount;
-- 预期结果: 每个 SKU 5 张卡，available_count = 5

-- ==========================================
-- 11. 样本库存详情 (Sample Inventory Details)
-- ==========================================
SELECT
    '✅ Sample Inventory' as check_type,
    inv.serial_number,
    inv.secret_code,
    inv.status,
    li.name_zh as product_name,
    inv.created_at
FROM listing_inventory inv
JOIN listing_items li ON li.id = inv.listing_item_id
WHERE inv.provider_id IN (
    SELECT id FROM provider_profiles
    WHERE business_name_en = 'Eagleson Coin Wash'
)
ORDER BY inv.created_at DESC
LIMIT 5;
-- 预期结果: 5 条记录，serial_number 格式为 CW-{amount}-{5位数}

-- ==========================================
-- 12. 验证序列号唯一性 (Verify Serial Uniqueness)
-- ==========================================
SELECT
    '⚠️ Duplicate Serials (Should be 0)' as check_type,
    listing_item_id,
    serial_number,
    COUNT(*) as duplicate_count
FROM listing_inventory
GROUP BY listing_item_id, serial_number
HAVING COUNT(*) > 1;
-- 预期结果: 0 行（无重复）

-- ==========================================
-- 13. 测试 RPC 函数 (Test Allocation Function)
-- ==========================================
-- ⚠️ 注意：此查询会实际分配一张卡，仅用于测试！
-- WARNING: This will actually allocate a card, for testing only!

-- 首先获取一个可用的 item_id
DO $$
DECLARE
    v_test_item_id UUID;
    v_test_result RECORD;
BEGIN
    -- 获取 $50 卡的 ID
    SELECT id INTO v_test_item_id
    FROM listing_items
    WHERE master_id IN (
        SELECT id FROM listing_masters
        WHERE title_en = 'Self-Service Wash Recharge Card'
    )
    AND price_amount = 5000
    LIMIT 1;

    -- 尝试分配
    BEGIN
        SELECT * INTO v_test_result
        FROM allocate_inventory_item(
            v_test_item_id,
            'test-order-' || gen_random_uuid()::text,
            'test-buyer-' || gen_random_uuid()::text
        );

        RAISE NOTICE '✅ Allocation Test PASSED - Serial: %, Status: %',
            v_test_result.serial_number,
            v_test_result.status;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Allocation Test Result: %', SQLERRM;
    END;
END $$;

-- ==========================================
-- 14. 查看刚才分配的测试卡 (View Test Allocation)
-- ==========================================
SELECT
    '✅ Recently Allocated Cards' as check_type,
    serial_number,
    status,
    order_id,
    buyer_id,
    updated_at
FROM listing_inventory
WHERE status = 'sold'
  AND order_id LIKE 'test-order-%'
ORDER BY updated_at DESC
LIMIT 1;

-- ==========================================
-- 15. 最终统计 (Final Statistics)
-- ==========================================
SELECT
    'Final Summary' as summary,
    (SELECT COUNT(*) FROM listing_inventory WHERE status = 'available') as available_inventory,
    (SELECT COUNT(*) FROM listing_inventory WHERE status = 'sold') as sold_inventory,
    (SELECT COUNT(*) FROM listing_inventory WHERE status = 'reserved') as reserved_inventory,
    (SELECT COUNT(*) FROM listing_items WHERE master_id IN (
        SELECT id FROM listing_masters WHERE title_en = 'Self-Service Wash Recharge Card'
    )) as total_skus,
    (SELECT COUNT(*) FROM provider_profiles WHERE business_name_en = 'Eagleson Coin Wash') as providers;
-- 预期结果: available_inventory = 14 (分配了1张), sold_inventory = 1, total_skus = 3, providers = 1

-- ==========================================
-- 16. 清理测试数据 (Cleanup Test Data - Optional)
-- ==========================================
-- 如果需要清理刚才的测试分配，运行以下语句：
-- UPDATE listing_inventory
-- SET status = 'available', order_id = NULL, buyer_id = NULL
-- WHERE order_id LIKE 'test-order-%';

-- ==========================================
-- 验证完成！(Verification Complete!)
-- ==========================================
-- 如果以上所有查询都返回预期结果，说明 GigBridge 部署成功！
-- If all queries above return expected results, GigBridge deployment is successful!
