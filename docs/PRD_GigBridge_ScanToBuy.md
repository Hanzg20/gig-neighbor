# 渥帮战略级框架：GigBridge (扫码即买/无人售卖) 全域方案

本文件为 **GigBridge** 框架的唯一权威文档，整合了产品愿景、市场策略、底层架构及技术落地细节。所有关于“扫码即买”场景的开发、设计与迭代均以此为准。

---

## 一、 产品愿景与战略定位 (Strategy & Vision)

**核心卖点：赋予物理空间数字化交互的能力。每一个贴在墙上的二维码，都是一个渥帮的入口。**

### 1. 核心定位
*   **Storefront Everywhere (处处皆店)**：将物理空间的任一平面（海报、密码箱、设备）转化为即时满足的数字店面。在需求的发生地，即刻满足。
*   **Zero-Friction Conversion (零摩擦转化)**：无需 App，利用“影子账户”与极简网页流，将支付前置。
*   **Low-Cost Vending (极轻量售卖)**：为商家取代昂贵的自动售货机，仅需一张二维码贴纸实现 24/7 无人售货。

### 2. 增长引擎 (Growth Logic)
*   **新用户转化钩子**：利用“新用户购买即送 5 金豆 (≈1元)”的获得感，在发放资产的瞬间将“游客”转化为“实名用户”。
*   **动态定价 (Dynamic Pricing)**：同一个物理码，白天原价，晚上可根据客流量或时段在后台动态调整价格，这是传统实体码无法实现的。

---

## 二、 现有系统集成 (Infrastructure Reuse)

GigBridge 深度复用渥帮现有成熟模块，确保资产与交易的一致性：

| 模块 | 对应现有表 | 复用逻辑 |
27: | **服务商** | `provider_profiles` | 商家作为 Provider 录入，管理其专属库存。 |
28: | **商品/SKU** | `listing_masters` / `items` | 售卖项（如洗车卡）作为 listing 录入，开启序列号模式。 |
29: | **用户体系** | `user_profiles` | 支持影子账号，支付成功后引导设置密码完成实名转化。 |
30: | **奖励系统** | `bean_transactions` | 奖励的金豆直接记入用户账本。 |
32: | **支付跟踪** | `orders` | 复用现有支付网关逻辑与状态跟踪。 |

---

## 三、 数据架构与技术细节 (Technical Architecture)

### 1. 核心数据模型

#### A. 商品元数据 (`listing_masters` 增强)
*   `is_serialized` (BOOLEAN): 标识该商品是否需要从库存池中提取唯一标识符。
*   `fulfillment_config` (JSONB): 取货引导模板、通知文案等。

#### B. 序列号资源池 (`listing_inventory`)
| 字段 | 说明 |
| :--- | :--- |
| `serial_number` | **核心标识**：卡号、激活码、或柜门号 (UNIQUE)。 |
| `secret_code` | **加密/隐私信息**：如开锁密码、动态 PIN。 |
| `status` | `available`, `sold`, `reserved`, `defective`, `expired`, `archived`。 |
| `metadata` | **万能扩展槽**：存放如 `{ "locker_pos": "A-12", "remaining_uses": 10 }`。 |

#### C. 资产使用流水 (`inventory_usage_logs`)
用于追踪“多次使用”或“余额类”资产，支持 `USE`, `RECHARGE`, `VOID` 等操作。

### 2. 技术护城河 (Technical Guardrails)
*   **原子化分配 (Atomic Allocation)**：宣称“百万并发无重号”。通过后端 `SELECT ... FOR UPDATE SKIP LOCKED` 技术，确保在高并发扫码时，数据库层面绝对不会重复发放。
*   **软删与溯源**：严禁物理删除资产。失效后状态变为 `archived`，确保财务对账和审计合规。

---

## 四、 核心业务逻辑与流程 (Core Logic & Data Flow)

### 1. 数据流图 (Data Flow)

```mermaid
sequenceDiagram
    participant U as 用户 (手机)
    participant Q as 二维码 (静态码)
    participant FE as 极简收银页 (Scan-to-Buy H5)
    participant BE as 后端 (Supabase/Auth)
    participant DB as 数据库 (Inventory Pool)

    U->>Q: 1. 扫码 (带 listing_id & node_id)
    Q->>FE: 2. 唤起 H5 落地页
    FE->>U: 3. 展示极致支付 UI (无感注册)
    U->>FE: 4. Click One-tap Pay (Stripe/Apple)
    FE->>BE: 5. 支付确认回调
    BE->>DB: 6. 原子锁定并扣减库存 (FOR UPDATE SKIP LOCKED)
    DB-->>BE: 7. 返回 Serial (如 CW-60-001)
    BE->>BE: 8. 创建新用户资产 & 触发 +5金豆奖励
    BE->>U: 9. 即时发送短信 (卡号 + 领豆链接)
    FE->>U: 10. 全屏展示成功卡片 + 引导设密领豆
```

### 2. 原子分配 SQL 代码参考
```sql
UPDATE listing_inventory 
SET status = 'sold', order_id = ?, buyer_id = ?, updated_at = NOW()
WHERE id = (
  SELECT id FROM public.listing_inventory 
  WHERE listing_item_id = ? AND status = 'available' 
  LIMIT 1 FOR UPDATE SKIP LOCKED
)
RETURNING serial_number, secret_code;
```

---

## 五、 入口与体验差异 (Entrance & UX)

| 特性 | **极简落地页 (Quick-Scan)** | **标准 Web 详情页 (Web Store)** |
| :--- | :--- | :--- |
| **场景** | 物理现场扫码 (如站立洗车房前) | 用户在平台内浏览、搜索 |
| **首要目标** | **支付转化率** (30秒内完成) | **信息完整度** (对比、评价、收藏) |
| **身份逻辑** | **影子账号优先** (先付后注册) | **登录账号优先** |
| **支付方式** | Apple/Google Pay (一键唤起) | Stripe Elements (列表选择) |

---

## 六、 场景兼容性集锦 (Extensibility)

*   **物理实体卡**：`serial_number` = 卡面号，`metadata` = 格子位。
*   **格口取货 (Locker)**：`serial_number` = 柜号，`secret_code` = 取货码。
*   **数字会员/授权码**：`serial_number` = 激活码，`valid_until` 限制期限。
*   **P2P 邻里路边摊 (Porch Pickup)**：无需分配 serial，支付触发卖家通知并标记 listing 为 SOLD。
*   **共享器材/空间**：扫码付押金/租金，`secret_code` 提供密码锁密码。

---

## 七、 演进路线 (Roadmap)

1.  **Phase 1 (MVP)**：完成资产管理架构，实现洗车卡的手动导入与自动发码。
2.  **Phase 2 (Experience)**：上线“注册领金豆”自动化奖励，优化影子账户逻辑。
3.  **Phase 3 (Scale)**：开放商家端库存管理工具，支持全物理场景接入。

---

> [!IMPORTANT]
> **设计准则**：
> 1. 尽量减少用户点击次数，点击越少，钱进来得越快。
> 2. 每一个二维码都是一个潜在的“地推员”，必须保证落地页的加载速度和视觉溢价。
