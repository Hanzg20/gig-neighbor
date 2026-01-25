# 优惠券系统设计文档

> 版本: 1.0
> 日期: 2026-01-24
> 状态: 设计阶段

---

## 1. 概述

### 1.1 目标

为商家(Provider)提供创建和管理优惠券的能力，支持：
- 创建优惠码 (Coupon Code)
- 生成带二维码的优惠券图片
- 用户扫码或输入优惠码享受折扣
- 商家扫码核销优惠券

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **复用优先** | 复用现有 QrCodeGenerator、PrintableQrTemplate 组件 |
| **最小改动** | 数据库只新增2张表，API只新增2个端点 |
| **无缝集成** | 与现有 QuickScanCheckout 结账流程无缝衔接 |
| **双入口** | 支持手动输入优惠码 + 扫码自动填入 |

---

## 2. 业界参考

### 2.1 主流平台对比

| 平台 | 优惠券类型 | 核心特点 |
|------|-----------|---------|
| **Shopify** | 折扣码 + 自动折扣 | 单码/批量码、叠加规则、使用次数限制 |
| **Stripe Coupons** | Coupon + Promotion Code | Coupon定义规则，Code是用户输入的字符串 |
| **美团/饿了么** | 平台券 + 商家券 + 红包 | 分层发放、满减/折扣/立减、新客专享 |
| **拼多多** | 限时券 + 拼单券 | 强时间限制、社交裂变 |

### 2.2 本系统采用模式

采用 **Stripe 风格** 的简化模型：
- `provider_coupons` = 优惠规则 + 优惠码 (合并为一张表，简化设计)
- `coupon_redemptions` = 使用记录

---

## 3. 系统架构

### 3.1 整体流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          优惠券完整生命周期                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. 商家创建优惠券                                                       │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  设置折扣规则 → 输入/生成券码 → 预览优惠券图片 → 保存           │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    ▼                                    │
│  2. 分发优惠券                                                          │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  • 下载PNG图片 → 发送给用户 (微信/短信/邮件)                   │    │
│     │  • 复制优惠码 → 用户手动输入                                   │    │
│     │  • 打印优惠券 → 线下派发                                       │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    ▼                                    │
│  3. 用户使用                                                            │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  方式A: 扫商品码结账 → 输入优惠码 → 验证 → 抵扣 → 支付         │    │
│     │  方式B: 扫优惠券码 → 自动填入优惠码 → 选商品 → 支付             │    │
│     │  方式C: 线下出示 → 商家扫码核销 → 确认使用                      │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    ▼                                    │
│  4. 数据追踪                                                            │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  创建数量 → 使用次数 → 抵扣金额 → 剩余可用                      │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 技术架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                           前端组件                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  CreateCoupon    │  │   CouponCard     │  │  CouponManager   │  │
│  │  Dialog          │  │   (图片生成)      │  │  (列表管理)       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │             │
│           └─────────────────────┼─────────────────────┘             │
│                                 │                                   │
│                    ┌────────────┴────────────┐                      │
│                    │    QrCodeGenerator      │  ← 复用现有组件       │
│                    │    (带Logo二维码)        │                      │
│                    └─────────────────────────┘                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           后端服务                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  validate-coupon │  │  redeem-coupon   │  │ create-checkout  │  │
│  │  (验证优惠码)     │  │  (核销优惠券)     │  │ (支付时应用折扣)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           数据库                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────┐        │
│  │    provider_coupons      │  │   coupon_redemptions     │        │
│  │    (优惠券定义)           │  │   (使用记录)              │        │
│  └──────────────────────────┘  └──────────────────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. 数据库设计

### 4.1 表结构

#### provider_coupons (优惠券表)

```sql
CREATE TABLE provider_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id),

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
    UNIQUE(provider_id, code),

    CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT valid_discount_value CHECK (discount_value > 0),
    CONSTRAINT valid_date_range CHECK (valid_until > valid_from)
);

-- 索引
CREATE INDEX idx_coupons_provider ON provider_coupons(provider_id);
CREATE INDEX idx_coupons_code ON provider_coupons(code);
CREATE INDEX idx_coupons_active ON provider_coupons(is_active, valid_from, valid_until);
```

#### coupon_redemptions (使用记录表)

```sql
CREATE TABLE coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES provider_coupons(id),
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
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),

    -- 防重复
    UNIQUE(coupon_id, order_id)
);

-- 索引
CREATE INDEX idx_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_redemptions_user ON coupon_redemptions(user_id);
CREATE INDEX idx_redemptions_phone ON coupon_redemptions(user_phone);
CREATE INDEX idx_redemptions_order ON coupon_redemptions(order_id);
```

### 4.2 RLS 策略

```sql
-- provider_coupons RLS
ALTER TABLE provider_coupons ENABLE ROW LEVEL SECURITY;

-- 商家可以管理自己的优惠券
CREATE POLICY "Providers can manage own coupons" ON provider_coupons
    FOR ALL USING (
        provider_id IN (
            SELECT id FROM provider_profiles WHERE user_id = auth.uid()
        )
    );

-- 所有人可以查看有效的优惠券 (用于验证)
CREATE POLICY "Anyone can view active coupons" ON provider_coupons
    FOR SELECT USING (is_active = true);

-- coupon_redemptions RLS
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- 商家可以查看自己优惠券的使用记录
CREATE POLICY "Providers can view own coupon redemptions" ON coupon_redemptions
    FOR SELECT USING (
        coupon_id IN (
            SELECT id FROM provider_coupons WHERE provider_id IN (
                SELECT id FROM provider_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 系统可以插入使用记录 (通过 service role)
CREATE POLICY "Service can insert redemptions" ON coupon_redemptions
    FOR INSERT WITH CHECK (true);
```

---

## 5. API 设计

### 5.1 验证优惠码

**Endpoint:** `POST /functions/v1/validate-coupon`

**Request:**
```json
{
  "code": "SUMMER20",
  "provider_id": "uuid",
  "amount": 50.00,
  "user_id": "uuid",        // 可选
  "user_phone": "1234567890" // 可选
}
```

**Response (成功):**
```json
{
  "valid": true,
  "coupon_id": "uuid",
  "discount_type": "percentage",
  "discount_value": 20,
  "discount_amount": 10.00,
  "final_amount": 40.00,
  "message": "优惠码有效，已优惠 $10.00"
}
```

**Response (失败):**
```json
{
  "valid": false,
  "error": "coupon_expired",
  "message": "优惠码已过期"
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| `invalid_code` | 优惠码不存在 |
| `coupon_inactive` | 优惠券已停用 |
| `coupon_expired` | 优惠券已过期 |
| `coupon_not_started` | 优惠券未开始 |
| `coupon_exhausted` | 优惠券已用完 |
| `user_limit_exceeded` | 用户已达使用上限 |
| `min_purchase_not_met` | 未达最低消费 |

### 5.2 核销优惠券 (线下)

**Endpoint:** `POST /functions/v1/redeem-coupon`

**Request:**
```json
{
  "code": "SUMMER20",
  "provider_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "redemption_id": "uuid",
  "coupon_name": "夏日特惠",
  "discount_type": "percentage",
  "discount_value": 20,
  "message": "核销成功"
}
```

### 5.3 支付集成

在现有 `create-checkout-session` 中添加优惠码支持：

**新增参数:**
```json
{
  "coupon_code": "SUMMER20",  // 可选
  "coupon_id": "uuid"         // 可选 (验证后传入)
}
```

**处理逻辑:**
1. 如果传入 `coupon_code`，验证优惠码
2. 计算折扣后金额
3. 创建 Stripe Checkout Session (使用折扣后金额)
4. 在 metadata 中记录优惠券信息
5. 支付成功后在 webhook 中记录使用

---

## 6. 前端组件设计

### 6.1 组件结构

```
src/components/coupon/
├── CouponCard.tsx           # 优惠券图片卡片 (含二维码)
├── CreateCouponDialog.tsx   # 创建优惠券弹窗
├── CouponManager.tsx        # 优惠券列表管理
├── CouponCodeInput.tsx      # 结账页优惠码输入框
└── RedeemCouponPage.tsx     # 线下核销页面
```

### 6.2 CouponCard 组件

生成可下载的优惠券图片，包含：

```
┌─────────────────────────────────────────────────────────────┐
│                     优惠券图片布局                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○   ← 锯齿边缘          │
│   ┌─────────────────────────────────┐                       │
│   │         🏪 商家名称              │   ← Logo + 名称       │
│   │                                 │                       │
│   │         20% OFF                 │   ← 折扣金额 (大字)    │
│   │         夏日特惠                 │   ← 优惠券名称         │
│   │         满$50可用                │   ← 使用条件           │
│   │                                 │                       │
│   │        ┌─────────┐              │                       │
│   │        │ QR Code │              │   ← 二维码 (含Logo)    │
│   │        │  +Logo  │              │                       │
│   │        └─────────┘              │                       │
│   │                                 │                       │
│   │       [ SUMMER20 ]              │   ← 优惠码             │
│   │                                 │                       │
│   │    有效期至 2024.02.20          │   ← 有效期             │
│   └─────────────────────────────────┘                       │
│    ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○   ← 锯齿边缘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**二维码内容:**
```
https://justwedo.com/scan/{listing_master_id}?coupon={code}
```

扫描后自动跳转结账页，优惠码自动填入。

### 6.3 CreateCouponDialog 组件

创建优惠券的表单流程：

**Step 1: 填写信息**
```
┌─────────────────────────────────────────────────────────────┐
│  创建优惠券                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  优惠码 *                                                   │
│  ┌───────────────────────────────┐ ┌──────────┐            │
│  │ SUMMER20                      │ │ 随机生成  │            │
│  └───────────────────────────────┘ └──────────┘            │
│                                                             │
│  优惠券名称 *                                                │
│  ┌─────────────────────────────────────────────┐            │
│  │ 夏日特惠                                     │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  折扣类型 *                                                  │
│  ● 百分比折扣    ○ 固定金额                                  │
│                                                             │
│  折扣数值 *                    最低消费                       │
│  ┌──────────────┐             ┌──────────────┐              │
│  │ 20           │ %           │ 50           │ $            │
│  └──────────────┘             └──────────────┘              │
│                                                             │
│  使用次数上限                   有效天数                      │
│  ┌──────────────┐             ┌──────────────┐              │
│  │ 100          │             │ 30           │              │
│  └──────────────┘             └──────────────┘              │
│                                                             │
│                              ┌──────────┐ ┌──────────────┐  │
│                              │   取消   │ │ 下一步: 预览  │  │
│                              └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Step 2: 预览并确认**
```
┌─────────────────────────────────────────────────────────────┐
│  预览优惠券                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│               ┌─────────────────────┐                       │
│               │                     │                       │
│               │   [优惠券图片预览]   │                       │
│               │                     │                       │
│               └─────────────────────┘                       │
│                                                             │
│               ┌──────────┐ ┌──────────┐                     │
│               │ 返回修改  │ │ 确认创建  │                     │
│               └──────────┘ └──────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 结账页集成

在 `QuickScanCheckout.tsx` 中添加优惠码输入：

```
┌─────────────────────────────────────────────────────────────┐
│                      快速购买                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  选择规格                                                   │
│  ┌─────────────────────────────────────────────┐            │
│  │ ● 标准洗车卡 - $50.00                        │            │
│  │ ○ 豪华洗车卡 - $80.00                        │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  优惠码                                     ← 新增          │
│  ┌───────────────────────────────┐ ┌────────┐              │
│  │ SUMMER20                      │ │  验证  │              │
│  └───────────────────────────────┘ └────────┘              │
│  ✓ 已优惠 $10.00                            ← 验证成功      │
│                                                             │
│  手机号码                                                   │
│  ┌─────────────────────────────────────────────┐            │
│  │ 1234567890                                  │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  ─────────────────────────────────────────────              │
│  商品金额                                   $50.00          │
│  优惠券抵扣                                -$10.00  ← 新增  │
│  ─────────────────────────────────────────────              │
│  应付金额                                   $40.00          │
│                                                             │
│            ┌─────────────────────────────┐                  │
│            │         去支付 $40.00        │                  │
│            └─────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 核销流程

### 7.1 线上核销 (自动)

```
用户扫商品码 → 输入/自动填入优惠码 → 验证 → 支付 → Stripe Webhook → 记录使用
```

### 7.2 线下核销 (手动)

```
用户出示优惠券 → 商家扫描二维码 → 打开核销页 → 确认核销 → 标记已使用
```

**核销页面 UI:**

```
┌─────────────────────────────────────────────────────────────┐
│                      核销优惠券                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌──────────┐                             │
│                    │    ✓     │   ← 绿色对勾                │
│                    └──────────┘                             │
│                                                             │
│                   优惠券有效                                 │
│                                                             │
│                   20% OFF                                   │
│                   夏日特惠                                   │
│                                                             │
│  ─────────────────────────────────────────────              │
│  券码                              SUMMER20                 │
│  最低消费                          $50.00                   │
│  有效期至                          2024.02.20               │
│  ─────────────────────────────────────────────              │
│                                                             │
│            ┌─────────────────────────────┐                  │
│            │         确认核销             │                  │
│            └─────────────────────────────┘                  │
│                                                             │
│  核销后优惠券将立即失效，请确认用户已完成消费                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 实施计划

### 8.1 Phase 1: 基础功能 (MVP)

| 任务 | 说明 | 优先级 |
|------|------|--------|
| 数据库迁移 | 创建 `provider_coupons` 和 `coupon_redemptions` 表 | P0 |
| validate-coupon API | 验证优惠码端点 | P0 |
| CouponCard 组件 | 优惠券图片生成 (复用 QrCodeGenerator) | P0 |
| CreateCouponDialog | 商家创建优惠券表单 | P0 |
| 结账页集成 | QuickScanCheckout 添加优惠码输入 | P0 |
| create-checkout 修改 | 支持折扣金额计算 | P0 |
| stripe-webhook 修改 | 记录优惠券使用 | P0 |

### 8.2 Phase 2: 管理功能

| 任务 | 说明 | 优先级 |
|------|------|--------|
| CouponManager 组件 | 优惠券列表、启用/停用、删除 | P1 |
| Provider Dashboard | 新增"优惠券"Tab | P1 |
| 使用记录查看 | 显示优惠券使用历史 | P1 |
| 批量打印 | 复用 PrintableQrTemplate | P1 |

### 8.3 Phase 3: 高级功能

| 任务 | 说明 | 优先级 |
|------|------|--------|
| 线下核销页面 | 商家扫码核销 | P2 |
| 用户限制 | 每用户使用次数限制 | P2 |
| 数据分析 | 使用率、转化率统计 | P2 |
| 批量生成唯一码 | 一次性优惠码批量生成 | P3 |

---

## 9. 技术依赖

### 9.1 新增依赖

```json
{
  "dependencies": {
    "html-to-image": "^1.11.11"  // 用于导出优惠券图片
  }
}
```

### 9.2 复用现有组件

| 组件 | 用途 |
|------|------|
| `QrCodeGenerator` | 生成带Logo的二维码 |
| `PrintableQrTemplate` | 批量打印优惠券 |
| `QuickScanCheckout` | 结账页集成优惠码 |
| `ProviderInventoryDashboard` | 参考样式添加优惠券Tab |

---

## 10. 安全考虑

| 风险 | 措施 |
|------|------|
| 优惠码猜测 | 使用8位以上随机码，限制验证频率 |
| 重复使用 | 数据库唯一约束 + 原子操作 |
| 跨商家使用 | 验证时检查 provider_id 匹配 |
| 过期券使用 | 服务端验证有效期 |

---

## 附录 A: 优惠码格式建议

| 类型 | 格式 | 示例 |
|------|------|------|
| 公开码 | 易记单词+数字 | `SUMMER20`, `WELCOME10` |
| 随机码 | 8位字母数字 | `X7K9M2P4`, `AB3DEF78` |

**随机码生成算法:**
```typescript
function generateCouponCode(): string {
  // 排除易混淆字符: 0, O, I, L, 1
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

## 附录 B: 国际化文案

```typescript
const couponI18n = {
  zh: {
    createCoupon: '创建优惠券',
    couponCode: '优惠码',
    couponName: '优惠券名称',
    discountType: '折扣类型',
    percentage: '百分比折扣',
    fixedAmount: '固定金额',
    discountValue: '折扣数值',
    minPurchase: '最低消费',
    maxUses: '使用次数上限',
    validDays: '有效天数',
    unlimited: '不限',
    preview: '预览',
    confirm: '确认创建',
    download: '下载图片',
    share: '分享',
    validate: '验证',
    applied: '已优惠',
    validUntil: '有效期至',
    redeem: '核销',
    redeemSuccess: '核销成功',
    errors: {
      invalid_code: '优惠码不存在',
      coupon_expired: '优惠码已过期',
      coupon_exhausted: '优惠码已用完',
      min_purchase_not_met: '未达最低消费'
    }
  },
  en: {
    createCoupon: 'Create Coupon',
    couponCode: 'Coupon Code',
    couponName: 'Coupon Name',
    discountType: 'Discount Type',
    percentage: 'Percentage',
    fixedAmount: 'Fixed Amount',
    discountValue: 'Discount Value',
    minPurchase: 'Minimum Purchase',
    maxUses: 'Max Uses',
    validDays: 'Valid Days',
    unlimited: 'Unlimited',
    preview: 'Preview',
    confirm: 'Confirm',
    download: 'Download Image',
    share: 'Share',
    validate: 'Apply',
    applied: 'Saved',
    validUntil: 'Valid until',
    redeem: 'Redeem',
    redeemSuccess: 'Redeemed successfully',
    errors: {
      invalid_code: 'Invalid coupon code',
      coupon_expired: 'Coupon has expired',
      coupon_exhausted: 'Coupon is fully redeemed',
      min_purchase_not_met: 'Minimum purchase not met'
    }
  }
};
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-01-24 | 初始设计文档 |
