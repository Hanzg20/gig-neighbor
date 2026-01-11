# GigBridge 部署指南 (Deployment Guide)

本指南将引导您完成 GigBridge 扫码即买系统的数据库部署和联调测试。

---

## 📋 前置条件 (Prerequisites)

### 1. Supabase 项目设置
- ✅ 已创建 Supabase 项目
- ✅ 已获取项目凭证：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- ✅ 已在 `.env.local` 中配置

### 2. 测试用户准备
需要一个真实的 Supabase Auth 用户作为 Provider（商家）：
- 用户 ID: `e1507f9e-7343-4474-a1da-301a213943ec` (Eagleson Wash)
- 或使用您自己的用户 ID（需修改 `SEED_EAGLESON_WASH.sql` 第 9 行）

---

## 🚀 步骤 1: 部署数据库 Schema

### 方法 A: 通过 Supabase Dashboard (推荐)

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择您的项目
3. 进入 **SQL Editor**
4. 打开 `docs/supabase_schema.sql` 文件
5. 复制完整内容并粘贴到 SQL Editor
6. 点击 **Run** 执行

**预期结果**:
```
✅ Tables created: listing_inventory, inventory_usage_logs
✅ Functions created: allocate_inventory_item, handle_order_fulfillment
✅ Triggers created: set_timestamp_inventory
✅ Policies created: RLS for inventory management
```

### 方法 B: 通过 psql 命令行

```bash
# 获取 Supabase 数据库连接信息
# Dashboard > Project Settings > Database > Connection string

psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f docs/supabase_schema.sql
```

### 验证部署成功

在 Supabase SQL Editor 中运行：

```sql
-- 验证表存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('listing_inventory', 'inventory_usage_logs');

-- 验证 RPC 函数存在
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'allocate_inventory_item';
```

**预期输出**:
```
table_name
------------------------
listing_inventory
inventory_usage_logs

routine_name
------------------------
allocate_inventory_item
```

---

## 🌱 步骤 2: 导入种子数据 (Eagleson Coin Wash)

### 2.1 检查用户 ID

**重要**: 确保目标用户存在于 `auth.users` 表中！

在 SQL Editor 中运行：

```sql
-- 检查用户是否存在
SELECT id, email FROM auth.users
WHERE id = 'e1507f9e-7343-4474-a1da-301a213943ec';
```

**如果用户不存在**:
1. 在应用中注册一个新用户
2. 从 `auth.users` 获取真实的 `id`
3. 修改 `docs/SEED_EAGLESON_WASH.sql` 第 9 行：
   ```sql
   target_user_id UUID := '你的用户ID';
   ```

### 2.2 执行种子数据脚本

#### 方法 A: Supabase Dashboard

1. 打开 `docs/SEED_EAGLESON_WASH.sql`
2. 复制完整内容
3. 粘贴到 SQL Editor
4. 点击 **Run**

#### 方法 B: psql 命令行

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f docs/SEED_EAGLESON_WASH.sql
```

### 2.3 验证种子数据

```sql
-- 1. 验证 Provider 创建成功
SELECT id, business_name_zh, business_name_en, is_verified
FROM provider_profiles
WHERE business_name_en = 'Eagleson Coin Wash';

-- 2. 验证 Listing Master
SELECT id, title_zh, title_en, status, metadata->'is_serialized' as is_serialized
FROM listing_masters
WHERE title_en = 'Self-Service Wash Recharge Card';

-- 3. 验证 Listing Items (3 SKUs)
SELECT id, name_zh, name_en, price_amount/100.0 as price_cad
FROM listing_items
WHERE master_id IN (
    SELECT id FROM listing_masters WHERE title_en = 'Self-Service Wash Recharge Card'
)
ORDER BY price_amount;

-- 4. 验证库存 (应有 15 张卡)
SELECT
    status,
    COUNT(*) as count,
    STRING_AGG(DISTINCT SUBSTRING(serial_number, 1, 6), ', ') as serial_prefixes
FROM listing_inventory
WHERE provider_id = (
    SELECT id FROM provider_profiles WHERE business_name_en = 'Eagleson Coin Wash'
)
GROUP BY status;
```

**预期输出**:
```
status       | count | serial_prefixes
-------------|-------|------------------
available    | 15    | CW-50-, CW-100-, CW-200-
```

---

## 🧪 步骤 3: 测试库存管理流程

### 3.1 访问 Provider 工作台

1. 确保已登录为 Eagleson Wash 的用户（e1507f9e-...）
2. 访问: `http://localhost:5173/provider-dashboard`
3. 应该看到：
   - ✅ 营业中/休息中 切换开关
   - ✅ 快捷库存卡片（显示 $50/$100/$200 规格）

### 3.2 访问完整库存管理

点击 "进入完整库存管理" 或访问:
```
http://localhost:5173/provider/{provider-id}?tab=inventory
```

**测试清单**:
- [ ] 看到 15 条库存记录
- [ ] 搜索框可以按序列号筛选（输入 "CW-50"）
- [ ] 状态筛选器工作正常（Available/Sold/Reserved）
- [ ] 点击"眼睛"图标可以显示/隐藏密钥
- [ ] "添加库存"按钮打开对话框

### 3.3 测试添加库存

#### 单条录入:
1. 点击 "添加库存"
2. 选择规格: "金卡 ($100)"
3. 输入序列号: `CW-100-99999`
4. 输入密钥: `PIN-9999`
5. 点击 "确认添加"
6. 刷新页面，应看到新记录

#### 批量导入:
1. 点击 "添加库存" > "批量导入" Tab
2. 粘贴以下内容:
   ```
   CW-50-88888, PIN-8888
   CW-50-88889, PIN-8889
   CW-50-88890, PIN-8890
   ```
3. 点击 "确认添加"
4. 应添加 3 条新记录

### 3.4 测试二维码打印 (可选)

1. 点击 "打印二维码" 按钮
2. 预览应显示 3x3 网格布局
3. 每个卡片包含：
   - 商品名称
   - 二维码 (指向 `/scan/:listing_id`)
   - 序列号
   - "Scan to Buy" 文字

---

## 💳 步骤 4: 测试扫码购买流程 (模拟支付)

### 4.1 获取 Listing ID

```sql
-- 获取 Master ID（用于生成扫码链接）
SELECT id FROM listing_masters
WHERE title_en = 'Self-Service Wash Recharge Card';
```

假设得到: `b4c91350-13f5-4309-84d7-40097f486241`

### 4.2 访问扫码购买页面

在浏览器中访问:
```
http://localhost:5173/scan/b4c91350-13f5-4309-84d7-40097f486241
```

**应该看到**:
- ✅ 商品标题（中英文）
- ✅ 3 个规格选项（$50/$100/$200）
- ✅ 手机号输入框
- ✅ "去支付" 按钮

### 4.3 模拟购买流程

1. 选择规格: "标准卡 ($50)"
2. 输入手机号: `+1-613-555-0123`
3. 点击 "去支付"
4. 等待 2 秒（模拟支付处理）
5. **预期结果**:
   - ✅ 页面显示 "支付成功！"
   - ✅ 展示分配的卡号（如 `CW-50-12345`）
   - ✅ 显示 "恭喜获得 5 金豆！" 引导注册
   - ✅ Console 输出: `[NotificationService] Sending SMS to +1-613-555-0123...`

### 4.4 验证库存扣减

在 SQL Editor 中运行：

```sql
-- 查看已售出的卡
SELECT serial_number, secret_code, status, order_id, buyer_id, updated_at
FROM listing_inventory
WHERE status = 'sold'
ORDER BY updated_at DESC
LIMIT 5;
```

**预期输出**:
```
serial_number   | status | order_id        | buyer_id
----------------|--------|-----------------|------------------
CW-50-12345     | sold   | dummy-order-id  | anonymous-buyer
```

---

## ⚠️ 常见问题排查 (Troubleshooting)

### 问题 1: "NO_AVAILABLE_INVENTORY" 错误

**症状**: 点击支付后提示 "该规格暂时缺货"

**原因**:
- 所选 SKU 的库存已全部售出
- 或数据库中该 SKU 没有库存

**解决**:
```sql
-- 检查可用库存数量
SELECT
    li.name_zh,
    COUNT(*) as available_count
FROM listing_inventory inv
JOIN listing_items li ON li.id = inv.listing_item_id
WHERE inv.status = 'available'
GROUP BY li.id, li.name_zh;
```

手动添加库存:
```sql
INSERT INTO listing_inventory (provider_id, listing_item_id, serial_number, secret_code, status)
VALUES (
    '0588656d-2305-4f40-9669-026815ec5521', -- provider_id
    'f3327699-0785-4b18-a612-452936780352', -- item_50 ID
    'CW-50-' || floor(random() * 89999 + 10000)::text,
    'PIN-' || floor(random()*9000 + 1000)::text,
    'available'
);
```

### 问题 2: RPC 函数调用失败

**症状**: Console 错误: `function allocate_inventory_item does not exist`

**原因**: Schema 未正确部署

**解决**:
```sql
-- 检查函数是否存在
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%inventory%';
```

如果不存在，重新执行步骤 1。

### 问题 3: 库存管理页面显示空白

**症状**: 访问 `/provider/{id}?tab=inventory` 看不到数据

**原因**:
- Provider ID 不匹配
- Repository 连接问题

**解决**:
1. 打开浏览器 DevTools > Network
2. 查看 API 请求是否返回错误
3. 检查 Console 是否有错误日志

---

## 🎯 步骤 5: 准备生产部署

### 5.1 环境变量检查

确保 `.env.local` 包含：

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (待集成)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Twilio (待集成)
VITE_TWILIO_ACCOUNT_SID=AC...
VITE_TWILIO_AUTH_TOKEN=...
VITE_TWILIO_PHONE_NUMBER=+1...
```

### 5.2 下一步集成任务

#### Task 1: Stripe Checkout 集成
**文件**: `src/pages/QuickScanCheckout.tsx`
**位置**: Line 103-105
**任务**: 替换模拟支付为真实 Stripe Checkout Session

```typescript
// 替换此处:
await new Promise(r => setTimeout(r, 2000));

// 改为:
const session = await createCheckoutSession({
    itemId: selectedItem.id,
    phoneNumber,
    successUrl: `${window.location.origin}/scan/${id}/success`,
    cancelUrl: window.location.href,
});
window.location.href = session.url;
```

#### Task 2: SMS 通知集成
**文件**: `src/services/NotificationService.ts`
**位置**: Line 13-23
**任务**: 实现真实的 SMS 发送

**选项 A**: Supabase Edge Function + Twilio
```typescript
await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        to: phone,
        message: `Your ${title} code: ${serial}. Register at wobang.ca to claim 5 JinBeans!`
    })
});
```

**选项 B**: 直接调用 Twilio API (不推荐，暴露凭证)

#### Task 3: 影子账户系统
**位置**: `QuickScanCheckout.tsx` Line 120
**任务**: 生成唯一匿名 ID

```typescript
// 替换:
"anonymous-buyer"

// 改为:
const anonymousId = await generateAnonymousUserId(); // 基于 device fingerprint
```

#### Task 4: 订单创建集成
**位置**: `QuickScanCheckout.tsx` Line 119
**任务**: 创建真实订单记录

```typescript
const order = await orderRepo.create({
    buyerId: anonymousId,
    providerId: listing.providerId,
    masterId: listing.id,
    itemId: selectedItem.id,
    status: 'PENDING_PAYMENT',
    pricing: { /* ... */ }
});

// 然后使用真实 order.id
const res = await inventoryRepo.allocateSerialNumber(
    selectedItem.id,
    order.id, // 真实 Order ID
    anonymousId
);
```

---

## ✅ 部署验证清单 (Deployment Checklist)

### 数据库层
- [ ] `listing_inventory` 表已创建
- [ ] `inventory_usage_logs` 表已创建
- [ ] `allocate_inventory_item()` 函数可调用
- [ ] `handle_order_fulfillment()` 触发器已激活
- [ ] RLS 策略已启用
- [ ] Eagleson Wash 种子数据已导入

### 应用层
- [ ] Provider Dashboard 显示正常
- [ ] 库存管理页面可访问
- [ ] 添加库存功能正常
- [ ] 二维码打印功能正常
- [ ] 扫码购买页面可访问
- [ ] 模拟支付流程成功
- [ ] 库存自动扣减生效
- [ ] Console 输出 SMS 日志

### 待完成集成
- [ ] Stripe Checkout 真实支付
- [ ] SMS 通知真实发送
- [ ] 影子账户系统
- [ ] 订单完整记录
- [ ] 注册领金豆逻辑

---

## 📞 支持与反馈

如果在部署过程中遇到问题：

1. 检查 Browser Console 的错误日志
2. 检查 Supabase Dashboard > Logs
3. 参考 `docs/system_design_document.md` 第 19.6 节
4. 查看 GitHub Issues: https://github.com/Hanzg20/gig-neighbor/issues

---

## 🎉 成功标志

当您看到以下所有内容时，说明 GigBridge 部署成功：

✅ 数据库表和函数全部就绪
✅ 种子数据导入完成（15 张洗车卡）
✅ Provider 可以管理库存（添加、查看、打印）
✅ 用户可以扫码查看商品并选择规格
✅ 模拟支付后自动分配序列号
✅ Console 输出 SMS 发送日志

**下一步**: 集成真实支付和通知，即可上线 MVP！

---

**Last Updated**: 2026-01-10
**GigBridge Version**: v1.0.0-beta
**Database Schema Version**: v4.2 (with GigBridge extensions)
