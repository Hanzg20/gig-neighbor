# 📄 JUSTWEDO - Product Requirements Document (PRD)
## 🍁 Canadian Community Services Platform

## 1. Product Definition
**JUSTWEDO** is a **community-based gig economy platform** designed for the Canadian market, combining trusted neighbor-to-neighbor connections with professional service marketplace features. It competes with TaskRabbit and Thumbtack while addressing uniquely Canadian needs: seasonal services, provincial licensing compliance, and multicultural accessibility.

### Core Values
- **Trust & Safety**: Background checks, license verification, insurance validation
- **Seasonal Adaptability**: Built-in support for weather-dependent services (snow removal, yard work)
- **Regulatory Compliance**: Automated verification for provincially-regulated trades
- **Community-First**: Hyperlocal focus aligned with Canadian neighborhood culture

---

## 2. Target Market & Users

### Geographic Focus
- **Primary**: Greater Toronto Area (GTA), Ontario
- **Phase 2**: Vancouver (BC), Montreal (QC), Calgary (AB)

### User Roles

| Role | Definition | Requirements |
|------|------------|--------------|
| **Consumer** | Community residents | Browse, book, review. Can post free items/tasks. No verification needed. |
| **Service Provider** | Non-licensed service professionals | Background check + liability insurance recommended |
| **Verified Professional** | Licensed tradespeople | Provincial license (ECRA/TSSA/RMT) + $2M insurance + criminal record check |
| **Admin** | Platform operators | KYC approval, license verification, moderation |

---

## 3. Core Business Logic

### 3.1 Master-Detail Listing Model
Supports complex service offerings with multiple tiers:
- **ListingMaster**: The service "cover" visible in search (e.g., "House Cleaning")
- **ListingItem**: Specific packages (e.g., "2-Hour Basic", "4-Hour Deep Clean")
- **Benefits**: Multi-SKU selection, tier pricing, seasonal variations

### 3.2 Bilingual Support Strategy
- **Database**: All fields have `zh_name` and `en_name` for future expansion
- **UI Phase 1**: English primary, French for Quebec
- **Architecture**: i18n-ready infrastructure

### 3.3 Ref-Code Taxonomy System
Platform categories driven by `ref_codes` table:
- Unlimited hierarchy depth
- Categories include metadata: icons, colors, licensing requirements, seasonality
- Ensures platform-wide terminology consistency

---

## 4. Core Business Domains

### 4.1 Home Services (Non-Licensed)
**Target Market**: DIY homeowners, busy professionals  
**Subcategories**: House Cleaning, Lawn Mowing, Junk Removal, Furniture Assembly, Gutter Cleaning, Interior Painting, Handyman

**Pricing Models**: 
- Hourly: $25-80/hr
- Flat Rate
- Per Room/Area

**Requirements**:
- Liability insurance recommended
- Police record check for in-home services
- No provincial licensing required

### 4.2 Skilled Trades ⚠️ (LICENSE REQUIRED)
**Target Market**: Homeowners needing certified work  
**Subcategories**: 
- Licensed Electrician (ECRA - Ontario)
- Licensed Plumber (OPMCA - Ontario)
- HVAC Technician (TSSA Gas Fitter)
- Appliance Repair

**Pricing Models**: $80-150/hr + service call

**Mandatory Requirements**:
- Valid provincial license verification
- $2M+ liability insurance
- Platform validates credentials before listing approval
- License # and expiry displayed on profile

### 4.3 Personal Services
**Target Market**: Families, pet owners, students  
**Subcategories**: Pet Sitting/Dog Walking, Tutoring, Personal Training, Massage Therapy (RMT), House Sitting, Event Help

**Pricing Models**:
- Per Visit: $20-50
- Hourly: $30-100
- Per Session

**Requirements**:
- Background check (childcare/pet care)
- RMT license for massage therapy
- First Aid certification recommended

### 4.4 Community Marketplace
**Target Market**: Sustainability-minded neighbors  
**Subcategories**: Free & Share, Furniture & Decor, Tools & Equipment Rental, Kids & Baby Gear, Sports Equipment

---

## 5. Trust & Verification (Canadian Standards)

- **ID Verification**: Mandatory for all providers using third-party KYC.
- **Background Checks (CPIC)**: Required for all in-home service providers.
- **Insurance Validation**: Verified professionals must provide proof of liability insurance ($2M minimum).
- **Proactive Monitoring**: Platform periodically re-verifies licenses with provincial registries.

---

## 6. Mobile & Cross-Platform UX
- **Mobile-First Indexing**: Listings optimized for mobile viewing and booking.
- **Bilingual Interface**: Seamless switching between English and Chinese.
- **Messenger-Led Interaction**: Direct messaging focus for consultation services.

---

## 7. Roadmap & Future Expansion
- **Pilot Phase**: Ottawa (Kanata Lakes & Lees Ave).
- **Expansion Phase**: GTA (Toronto, Markham, Richmond Hill).
- **Feature Roadmap**: AI price guiding, natural language posting, and cross-platform App/Mini-Program launch.



# 📄 JUSTWEDO (恒帮) - 详细产品需求说明书 (PRD)

## 1. 产品定义 (Product Definition)
**JUSTWEDO (恒帮)** 是一个定位为“邻里互助 + 零工经济”的社区综合服务平台。它结合了 **Fiverr** 的专业服务颗粒度、**美团** 的本地生活便利性以及 **Yelp** 的高度信任评价体系。

### 核心价值 (Core Values)
- **信任 (Trust)**: 通过实名认证、邻里评价构建信任背书。
- **颗粒化 (Granularity)**: 通过 Master-Detail 模型支持复杂且灵活的服务规格。
- **无国界 (International)**: 架构上支持多语言，服务于多元文化社区。

---

## 2. 目标用户 (Target Users)
| 角色 | 定义 | 权限与限制 |
| :--- | :--- | :--- |
| **买家/邻居 (Buyer/Neighbor)** | 社区普通居民 | **权限**: 下单、评价、即时沟通。**新增**: 可发布“邻里好物”(闲置)及“需求发布”(悬赏任务)。不需要深度认证。 |
| **服务者/商家 (Provider)** | 具备专业技能的人员或商户 | **权限**: 发布所有类目（含专业服务、租赁、咨询）。**要求**: 必须完成实名认证 (KYC) 或企业认证。 |
| **管理员 (Admin)** | 平台运营人员 | 审核实名、处理投诉、管理类目。 |

---

## 3. 核心业务逻辑 (Core Business Logic)

### 3.1 主从发布模型 (Master-Detail Model)
为了支持复杂的业务场景（如：同一保洁服务有 2小时、4小时不同规格），平台采用 **Master-Detail** 结构：
- **ListingMaster (展示主项)**: 用户在搜索列表看到的“封面”。包含标题、总述、位置、服务商信息。
- **ListingItem (具体规格/SKU)**: 进入详情页后可选的“套餐”。包含具体定价周期、单位、是否有押金。
- **优势**: 支持一次勾选多个规格，支持阶梯定价。

### 3.2 国际化策略 (i18n Strategy)
- **数据层**: 数据库中所有公共字段（标题、描述、规格名）必须包含 `zh_name` 和 `en_name`。
- **视图层**: 前期为了极致的加载速度和简洁性，**UI 默认硬编码为中文**。仅在检测到极高需求时切换语言路由。

### 3.3 参考码系统 (JinBean Ref-Code System)
平台类目、行业、状态机全部通过 `ref_codes` 表驱动：
- 支持无限级分类。
- 分类自带 `ExtraData`（图标、颜色、特定行业预设字段）。
- 确保全平台术语统一。

---

## 4. 功能模块划分 (Functional Modules)

### 4.1 发布与探索 (Discovery)
- **多维度推荐**: 根据地理位置 (PostGIS) 和好评度推荐。
- **行业过滤**: 生活服务、共享租赁、专家咨询、邻里好物、悬赏任务。
- **卡片展示**: 智能计算各规格中最低价格（Starting Price）显示。

### 4.2 信任与安全 (Trust & Safety)
- **实名认证 (KYC)**: 服务者必须上传证件，经人工审核后打上“已认证”勋章。
- **身份区分子**: 明确标记“个人邻居”与“专业商家”。
- **评价体系**: 只有完成订单的用户可以评价，支持多语言追加评论。

### 4.3 交易与订单 (Transactions)
- **标准状态机**: 待支付 -> 待接单 -> 进行中 -> 待评价 -> 已完成。
- **多项结算**: 用户可以将同一 Master 下的多个 Item 加入购物车统一结算。
- **金豆系统**: 平台内部虚拟积分，用于小额支付或任务激励。

### 4.4 消息系统 (Messaging)
- **交易上下文**: 聊天室自动关联当前的 listing 或 order。
- **实时沟通**: 支持文字、图片，为订单意向提供即时确认渠道。

---

## 5. 权限管理 (RBAC & Role Boundaries)

为降低参与门槛，平台对“邻里好物”和“任务”实行“发布即准入”逻辑：

| 功能 | 普通邻居 (Buyer) | 专业服务者 (Provider) |
| :--- | :--- | :--- |
| **购买/下单** | ✅ | ✅ |
| **发布邻里好物 (闲置)** | ✅ (无需认证) | ✅ |
| **发布悬赏任务 (求助)** | ✅ (无需认证) | ✅ |
| **发布生活服务/租赁** | ❌ (引导认证) | ✅ |
| **发布专业咨询** | ❌ (引导认证) | ✅ |

- **界限**: 一旦用户发布了除“好物”和“任务”之外的项，系统自动触发向 `ProviderProfile` 状态的迁移流程。

---

## 6. 技术架构规范 (Architecture)
- **Repository Pattern**: UI 层不直接调用 API，通过仓库层屏蔽后端差异（Mock/Supabase）。
- **Mobile-First**: 所有页面必须完美适配竖屏，操作重心在屏幕下半部。
- **DDD 设计**: 路由与业务逻辑按领域划（Listing, Order, Profile, Social）。

---

## 8. 页面级详细需求 (Page-Level Requirements)

### 8.1 首页 (Home - 发现广场)
- **Top Bar**: 城市定位切换、全局搜索框、消息/个人中心入口。
- **Hero Section**: 动态分类金刚区（基于 `ref_codes`），每个分类带颜色属性。
- **动态发现流**: 
    - “猜你喜欢”：基于当前经纬度推荐。
    - “最新求助”：展示 `TASK` 类型的实时 FEED。
- **组件规范**: 必须包含 `ListingCard`，显示 Master 级别的评分和 Item 级别的起步价。

### 8.2 详情页 (Service Detail - 决策中心)
- **顶部多态展示**: 自动轮播图 + 类型标签 (RENTAL/SERVICE/etc.)。
- **规格选择区 (Items Selection)**: 
    - 列表展现所有 `ListingItem`，点击切换主价格。
    - 显示规格名称、规格描述、单位定价。
- **交互动作**: 
    - 预约/下单：根据类型变化文案（如租箱子显示“预订租期”，找律师显示“咨询预约”）。
    - 沟通入口：直达与该服务者的 IM 页面。

### 8.3 发布向导 (Post a Gig - 服务商生产力)
- **Step 1: 行业选择**: 级联选择分类。
- **Step 2: 主体信息**: 上传题图、主标题、长描述、位置。
- **Step 3: 规格定价**: 动态增加 Item 规格。每个规格单独设定 `Money` 结构（金额、单位、押金）。
- **Step 4: 标签与状态**: 设定 SEO 标签，选择草稿或直接发布。

### 8.4 个人中心与实名 (Profile & Identity)
- **多重身份视图**: 
    - 买家模式：收藏、足迹、我的订单、收货地址管理。
    - 服务商模式（需置换开关）：我的发布、订单管理（待确认/进行中）、收益统计。
- **KYC 入口**: 引导用户上传身份证件/营业执照，展示审核进度条。

### 8.5 订单中心 (Order Management - 交易追踪)
- **多维度视图**: 
    - 买家：展示服务进度条（从下单到确认收货）。
    - 服务商：展示订单各阶段状态（待处理 -> 已接受 -> 服务中 -> 待评价）。
- **核销系统**: 服务商侧生成或扫描核销码（适用于线下到家服务），触发订单状态流转。

### 8.6 消息中心 (Messaging Center - 沟通枢纽)
- **会话侧边栏**: 最近联系人、分类（系统通知/交易沟通）。
- **聊天窗格**: 
    - 顶部固定显示关联的 listing 信息。
    - 支持快速发送预置消息（快捷回复，如“我在路上”、“预计 30 分钟到达”）。

---

## 9. 核心功能级详细说明 (Functional Features)

### 9.1 智能搜索与过滤 (Search Engine)
- **空间搜索**: 调用 PostGIS 进行 `ST_Distance` 排序，显示“距离我 X.X km”。
- **行业过滤**: 根据 `industry_id` 动态调整侧边筛选属性（例如：租赁类可选“免押金”）。

### 9.2 订单状态机 (Order State Machine)
- **自动逻辑**: 
    - **预授权**: 支付后进入 `PENDING_CONFIRMATION`，锁定金豆。
    - **延时确认**: 完成服务后 48 小时自动转入 `COMPLETED`。
    - **快照记录**: 订单生成时必须将 `ListingItem` 内容深拷贝入 `snapshot` 字段。

### 9.3 消息与 IM 系统 (Real-time Messaging)
- **引用机制**: 对话框支持“发送该服务卡片”，方便买卖双方确认意向规格。
- **通知推送**: 订单状态变更实时触达聊天窗口。

## 11. 核心业务域明细 (Business Domains Detail)

本平台通过 `ref_codes` 动态定义的四大业务支柱，各具独特的元数据需求与交易规则：

### 11.1 生活服务 (Life Services)
- **子项**: 家政保洁、管道疏通、搬家拉货、上门美容、宠物代喂。
- **价格单位**: 元/小时、元/次、元/平米。
- **特定需求**:
    - 支持“加急费”作为 Add-on Item。
    - 服务商需关联“健康证”或“行业技能证书”。
    - 订单需包含“预约上门具体时间段”。

### 11.2 共享租赁 (Rental & Sharing)
- **子项**: 专业相机、露营装备、高端服饰、梯子/电钻、闲置车位。
- **价格单位**: 元/天、元/周、元/小时。
- **特定需求**:
    - **必须包含押金 (Deposit)** 逻辑。
    - `ListingItem` 需记录“器材新旧程度”与“取货/归还方式”。
    - 支持“免押金”标签（需信用评分或特定平台保费抵扣）。

### 11.3 专业咨询 (Expert Consultation)
- **子项**: 法律咨询、考研辅导、技术Debug、翻译服务、理财建议。
- **价格单位**: 元/30分钟、元/次、元/项目。
- **特定需求**:
    - **强认证 (High-Trust)**: 必须上传执业证或行业背景证明。
    - 交付物分多阶段：支持“意向金 + 尾款”的多次支付模式。
    - 集成“在线文档/音视频链接”作为订单交付快照。

### 11.4 邻里好物 (Neighborhood Goods)
- **子项**: 二手闲置、自制美食、多余食材、花卉绿植。
- **发布者**: **买家/普通邻居即可发布**。
- **价格单位**: 一口价、元/件、免费(赠予)。
- **特定需求**:
    - **极简发布**: 只需 1 张图 + 标题 + 价格。
    - 针对自制美食，平台保留抽查环境的权利。

### 11.5 需求发布/悬赏 (Tasks/Demands)
- **子项**: 代取快递、代扔垃圾、排队代办、紧急求助。
- **发布者**: **买家/普通邻居即可发布**。
- **特定需求**:
    - **时效性**: 必须点击设定“有效期”。
    - **安全性**: 涉及入户或私密信息的任务建议选用“已认证”服务者响应。

---

## 12. 演进路线 (Roadmap)
1.  **Phase 1**: 确立 Master-Detail UI 规范，完成 Mock 闭环。
2.  **Phase 2**: 接入 Supabase 实现持久化，集成实名认证流。
3.  **Phase 3**: 接入地理位置感知，实现真正的小区级服务。
4.  **Phase 4**: 跨端封装，发布微信小程序与原生双端 App。

 
Supabase  Project  API：Jinbeanart

update
Project URL https://fvjgmydkxklqclcyhuvl.supabase.co

Publishable API Key：sb_publishable_Bw8nRiGMo0oGJ52pvsNJSw_JAQJI6Ih

现在启用 pgvector（如果需要 AI 搜索）：
Dashboard → Database → Extensions → 启用 "vector"
