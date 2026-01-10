# 渥帮战略级框架：GigBridge (扫码即买/无人售卖) 全域方案

本文件为 **GigBridge** 框架的唯一权威文档，涵盖产品愿景、业务逻辑、底层架构及技术落地细节。后续所有关于“扫码即买”场景（如洗车卡、自助洗衣、社区团购）的开发与迭代均以此为准。

---

## 一、 产品愿景与核心卖点 (Strategy & Vision)

**定位**：连接物理世界与数字资产的枢纽。

### 1. 核心卖点 (Unique Selling Points)
*   **Storefront Everywhere (处处皆店)**：将物理空间的任一平面（海报、密码箱、设备）转化为即时满足的数字店面。
*   **Zero-Friction Conversion (零摩擦转化)**：无需 App，无感注册。在用户需求爆发的瞬间完成支付。
*   **Low-Cost Vending (极轻量售卖)**：为商家取代数万元的自动售货机，仅需一张二维码贴纸实现 24/7 无人售货。

### 2. 增长引擎 (Growth Logic)
*   **注册转化钩子**：利用“新用户购买即送 5 金豆 (≈1元)”的获得感，在发放资产的瞬间将“游客”转化为“渥帮实名用户”。

---

## 二、 现有系统逻辑复用 (Infrastructure Reuse)

GigBridge 并非独立系统，而是深度集成在渥帮现有模型中，复用以下成熟模块：

| 模块 | 对应现有表 | 复用逻辑 |
| :--- | :--- | :--- |
| **服务商** | `provider_profiles` | 洗车场作为 Provider 录入，关联 `business_name` 和 `location`。 |
| **商品/SKU** | `listing_masters` / `items` | 洗车卡作为一种 `listing`。60/120/240 元卡对应不同的 `listing_items` (SKUs)。 |
| **用户体系** | `user_profiles` | 整合现有 Auth 流程。支付后引导注册直接更新 `user_profiles`。 |
| **交易记录** | `orders` | 买卡即下单。通过 `orders.snapshot` 存储当时的卡片信息。 |
| **奖励系统** | `bean_transactions` | 注册赠送的 5 金豆直接记入金豆账本，实现资产统一管理。 |
| **支付跟踪** | `orders` (Payment fields) | 复用现有 `payment_intent_id` 和 `payment_status` 跟踪 Stripe 状态。 |

---

## 三、 业务场景抽象 (Business Modeling)

我们将所有此类需求抽象为：**“带序列号的库存商品分发”**。

### 1. 典型流程
1.  **扫码**：用户扫描物理终端上的唯一二维码。
2.  **选购**：进入极简 H5 详情页，选择规格（如洗车卡 60/120/240 元）。
3.  **支付**：手机一键支付（Stripe/Apple Pay）。
4.  **获码**：后端自动分配物理资产序列号，并通过短信展示给用户。
5.  **履约**：用户根据页面指引，在柜台/密码箱拿取对应编号的实体。

---

## 三、 数据架构 (Technical Architecture)

### 1. 核心数据模型 (Database)

#### A. 商品元数据 (`listing_masters` 增强)
*   `is_serialized` (BOOLEAN): 开启序列号分发模式。
*   `fulfillment_config` (JSONB): 存储取货点地址、引导文案模板等。

#### B. 序列号资源池 (`listing_inventory`) —— [生产环境增强版]
这是整个框架的核心，设计上必须兼容从“洗车卡”到“柜子密码”的所有物理/数字资产。

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | UUID | 主键 |
| `listing_item_id` | UUID | 关联具体的 SKU |
| `provider_id` | UUID | **[新增]** 关联服务商，方便按门店对账和库存查询 |
| `serial_number` | TEXT | **核心标识**：卡号、激活码、或柜门号 (UNIQUE 约束) |
| `secret_code` | TEXT | **加密信息**：如密码、动态 PIN |
| `status` | TEXT | 枚举：`available`, `reserved`, `sold`, `defective`, `expired`, `archived` |
| `valid_from` | TIMESTAMP | 资产生效时间 |
| `valid_until` | TIMESTAMP | 资产失效时间 |
| `metadata` | JSONB | **万能扩展槽**：存放如 `{ "locker_pos": "A-12", "remaining_uses": 10 }` |
| `order_id` | UUID | 关联订单 |
| `buyer_id` | UUID | 关联买家 |
| `created_at` | TIMESTAMP | 入库时间 |
| `updated_at` | TIMESTAMP | 最后变更时间 |

#### C. 资产使用流水表 (`inventory_usage_logs`) —— [新增]
用于支持“多次使用”场景（如 10 次洗车卡、余额卡）。
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | UUID | 主键 |
| `inventory_id` | UUID | 关联 `listing_inventory` |
| `action_type` | TEXT | `USE`, `RECHAGE`, `VOID` |
| `amount` | INTEGER | 变更数值（如 `-1` 次，或金额） |
| `location_id` | TEXT | 使用的具体物理位置/机器 ID |
| `created_at` | TIMESTAMP | 发生时间 |

### 2. 技术护城河 (Technical Guardrails)
*   **并发安全**：分配时必须使用 `SELECT ... FOR UPDATE SKIP LOCKED`。这能保证在高并发扫码时，数据库层面绝对不会把同一个序列号发给两个人。
*   **物理隔离**：虽然 `metadata` 很灵活，但 `provider_id` 被提升为一级字段，以支撑百万级数据下的多店性能索引。
*   **软删策略**：严禁物理删除资产。失效后状态变为 `archived`，确保财务对账和法律合规的溯源性。

### 3. 场景兼容性分析 (Extensibility Case Studies)
该模型如何适配不同无人场景：
*   **洗车实体卡**：`serial_number` 为卡面号，`metadata` 存格子位，“领取后”状态变 `sold`。
*   **格口取货 (Locker)**：`serial_number` 为柜号，`secret_code` 为一次性取货码。
*   **数字会员/充值码**：`serial_number` 为激活码，`valid_until` 限制使用期限。
*   **共享充电宝/器材**：`metadata` 记录物理位置，`status` 随借随还逻辑更新。
*   **[新增] P2P 邻里路边摊 (Porch Pickup)**：
    *   **业务描述**：邻居 A 出门了，在路边旧家具上贴个码，行人 B 扫码支付后直接搬走。
    *   **实现细节**：
        1.  此类商品不关联 `listing_inventory` 的序列号池（因为就是物品本身）。
        2.  扫码后进入 **极简支付页**，显示物品照片与价格。
        3.  支付成功后，无需分配 `serial_number`。
        4.  系统立即通过推送通知卖家（邻居 A）：“您的商品已被邻居 B 买走并取货”。
        5.  `listing_masters.status` 直接变更为 `SOLD`。
    *   **特点**：极致信任，利用“扫码即付”完成物理所有权的瞬间转移。
*   **[扩展] 共享社区器材 (Shared Tools)**：
    *   **描述**：邻里间共享梯子、除雪机。
    *   **逻辑**：扫码支付押金 + 租金，`secret_code` 提供密码锁密码，`valid_until` 限制归还时间。
*   **[扩展] 共享空间准入 (Space Access)**：
    *   **描述**：社区小健身房、自习室、琴房。
    *   **逻辑**：扫码支付时段费用，`secret_code` 作为该时段的门禁 PIN 码。
*   **[扩展] 轻量级市集/快闪店 (Pop-up Market)**：
    *   **描述**：地摊、农贸市场，无需 POS 机。
    *   **逻辑**：每个摊位贴不同价格的码。买家扫码支付，卖家收到通知即交货，省去硬件成本。
*   **[扩展] 社区活动门票 (Event Ticketing)**：
    *   **描述**：社区电影晚会、邻里烧烤聚会。
    *   **逻辑**：海报扫码，支付后 `serial_number` 作为入场凭证，入场时核销。

### 4. 公共服务模块 (Shared Modules)

*   **分配器 (Allocator)**：采用 `SKIP LOCKED` 原子操作，确保高并发下卡号不重发。
*   **通知总线 (Notifier)**：整合 Twilio 短信，确保卡号在网页关闭后依然能触达用户。
*   **影子账户处理器 (Shadow Identity)**：支持匿名会话到实名账号的静默合并。

---

## 四、 入口与体验差异 (Entrance & UX)

GigBridge 支持两种订单入口，它们在表现层有所不同，但共享同一套后端履约逻辑。

| 特性 | **极简落地页 (Quick-Scan)** | **标准 Web 详情页 (Web Store)** |
| :--- | :--- | :--- |
| **触发场景** | 物理现场扫码 (如站立洗车房前) | 用户在平台内浏览、搜索 |
| **首要目标** | **支付转化率** (30秒内完成) | **信息完整度** (对比、评价、收藏) |
| **导航/UI** | 隐藏 Header/Footer，全屏聚焦支付 | 标准平台顶部导航，SEO 友好 |
| **身份逻辑** | **影子账号优先** (先付后注册) | **登录账号优先** (已有 Token) |
| **推荐支付** | Apple/Google Pay (一键唤起) | Stripe Elements (列表选择/绑卡) |

### 核心关联：
*   **路由分发**：`/scan/:listing_id` 路由渲染极简模式；`/listings/:listing_id` 渲染详情模式。
*   **逻辑闭环**：无论哪种入口，最终都会生成一条 `order_type = 'SERIALIZED'` 的订单，并调用同一个 `Fulfillment Engine` 进行发码。

---

## 五、 核心设计方案 (Core Design)

### 1. 二维码方案：静态路由 + 动态下单 (Static-Mirror Mode)
为了降低商家的运维难度，我们不采用“一个码对应一个订单”的模式，而是：
*   **物理层**：商家下载并打印对应 SKU (如 CW-60) 的 **静态二维码**。
*   **编码内容**：`https://gig-neighbor.com/scan/:listing_id?node=NODE_LEES`
*   **逻辑流**：
    1.  用户扫码进入通用的 **极简落地页**。
    2.  落地页实时从 `listing_masters` 获取最新价格和商家信息。
    3.  用户确认后，在页面内触发“影子账户”创建并 **即时生成 Order ID**。
*   **卖点**：码贴上去就不用管了，价格调整或说明变更直接在渥帮后台修改，物理二维码永久有效。

### 2. 支付方案：双轨并行 (Dual-Track Payment)
针对加拿大市场，提供“极速”与“传统”两种支付路径：

*   **路径 A：Stripe (极速路径)**
    *   **适用**：追求即时拿卡的用户。
    *   **实现**：Stripe Checkout (Apple/Google Pay)。
    *   **优势**：**秒级自动发码**。
*   **路径 B：Interac E-transfer (本地化路径)**
    *   **适用**：不愿输入卡号或额度受限的用户。
    *   **实现逻辑**：
        1. 用户选择 E-transfer，点击“生成交易”。
        2. 页面展示 **Interac 接收信息** (Email: `pay@gig-neighbor.com`, 备注码: `ORDER_123`)。
        3. 同时发送一条 **“指令短信”** 到用户手机，包含支付说明链接。
        4. 用户手动完成银行转账。
        5. 用户点击页面上的“我已支付”。
    *   **履约触发**：由系统后台判定（或前期人工审核）到账后，点击“确认”，系统自动补发卡号短信。

---

## 五、 支付与集成细节 (Integration)

### 1. E-transfer 通知与引导
*   **实时指令页**：支付页需清晰展示“复制 Email”和“复制订单备注”按钮。
*   **状态追踪**：订单状态设为 `PENDING_E_TRANSFER`。
*   **兜底通知**：如果用户支付后关闭了网页，订单关联的“指令短信”中包含一个持久化链接，用户随时可以回来查看取卡进度。

---

## 五、 演进路线 (Roadmap)

1.  **Phase 1 (MVP)**：完成 `listing_inventory` 表结构，实现洗车卡的手动导入与自动发码。
2.  **Phase 2 (UX)**：优化影子账户逻辑，上线“注册领 5 金豆”自动化奖励。
3.  **Phase 3 (Scale)**：开放给所有商家使用，支持商家自主配置多种物理资产分发逻辑。

---

> [!IMPORTANT]
> **设计准则**：
> 1. 尽量减少用户点击次数，点击越少，钱进来得越快。
> 2. 数据库事务必须涵盖“付款确认 - 扣减库存 - 分配卡号”的全过程，不容马虎。
