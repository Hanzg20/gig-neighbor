# 统一发布流程设计文档 v2.0

## 目录
1. [发布类型全景图](#发布类型全景图)
2. [详细字段矩阵](#详细字段矩阵)
3. [动态表单系统](#动态表单系统)
4. [信息完整度评分](#信息完整度评分)
5. [UI/UX设计规范](#uiux设计规范)

---

## 发布类型全景图

### 1. 核心分流决策 (Channel Selection Strategy)

作为系统分析师，我们将“发布”入口根据其商业价值和流程复杂度，拆分为两个并行系统：

| 维度 | **� 交易发布中心 (Marketplace)** | **💬 社区生活中心 (Community Forum)** |
| :--- | :--- | :--- |
| **产品入口** | 统一发布 `/publish` (侧重商业化/服务) | 社区各版块 `/forum` (侧重邻里互动) |
| **包含版块** | **专业服务 (SERVICE)**、**任务/派遣 (TASK)**、**商家供货 (GOODS-Pro)** | **二手跳蚤 (GOODS-C2C)**、**求购需求 (WANTED)**、**邻里互助 (HELP)**、**社区活动 (EVENT)** |
| **底层逻辑** | **SKU化/订单驱动**: 必须生成 Order。 | **帖子驱动**: 侧重 IM/评论 沟通，不强制下单。 |
| **用户体验** | 严谨、3步确认、SKU编辑器。 | 极简、发帖式、内容优先。 |
| **成功标准** | 成交总额 (GMV)、核销率。 | 活跃度 (DAU)、回复率、邻里连接数。 |

### 2. 核心分类层级 (Refined)
```
[+] 按钮主入口
│
├─ 📄 发动态 (Social Post) ───────> 对应 [社区/朋友圈]
│
├─ 💼 专业发布 (Transactional) ────> 进入 [Marketplace 引擎] (原 Unified Publish)
│  ├─ 🛠️ 提供专业服务 (SERVICE)
│  ├─ 📦 商业供货 (GOODS-Provider)
│  └─ 🔄 专业设备租赁 (RENTAL-Pro)
│
└─ 🔀 邻里小事 (Community) ───────> 进入 [Forum 引擎]
   ├─ 🎒 闲置买卖 (GOODS-C2C)
   ├─ 🎁 免费赠送 (GIVEAWAY)
   ├─ 🔍 我想求购 (WANTED)
   └─ 🎉 组织活动 (EVENT)
```

### 3. 可行性评估与架构调整 (Feasibility Assessment)

#### 3.1 方案可行性: **高**
这种分法符合“闲鱼 (信息流)”与“美团 (交易流)”的本质区别。
- **优点**: 极大地简化了 `/publish` 的复杂度，不再需要为普通闲置配置复杂的 SKU。
- **挑战**: 用户发布闲置时，如果想走订单系统（担保交易），需要支持从“帖子”转化到“订单”的功能。

#### 3.2 技术架构调整
1.  **数据表隔离**: 
    - `listing_masters`: 专门存储交易中心数据，状态机复杂。
    - `community_posts`: 专门存储社区数据，结构简单，支持丰富的评论。
2.  **详情页分流**: 
    - 交易型详情页：带“购买/预约”大按钮。
    - 信息型详情页：带“私聊/回复”长条。

> [!IMPORTANT]
> **普通的二手交易 (C2C)** 被划入社区频道，发布时不强制配置计费模式和库存，以“发帖”的轻量感增强邻里参与度。

## 3. 流程分流架构 (Flow Branching Architecture)

从产品逻辑上，不同分类在成功发布后的“生命周期”完全不同。

### 3.1 逻辑分流图
```mermaid
graph TD
    A[统一发布入口 /publish] --> B{分类性质识别}
    
    B -- "交易型 (Goods/Service/Rental/Task)" --> C[生成 Service/Inventory 数据]
    C --> D[进入 交易转化 链路]
    D --> D1[详情页带'立即购买/预约']
    D1 --> D2[生成 订单 (Order)]
    D2 --> D3[支付/履约/评价]

    B -- "信息型 (Wanted/Event/Giveaway)" --> E[生成 Community/Post 数据]
    E --> F[进入 社区互动 链路]
    F --> F1[详情页带'留言/私聊']
    F1 --> F2[线下联系 / 报名确认]
    
    B -- "展示型 (Lead Gen/OTHER)" --> G[生成 Profile/Content 数据]
    G --> H[进入 流量沉淀 链路]
    H --> H1[详情页带'联系专家/查看更多']
```

### 3.2 关键差异定义

#### 1. 交易驱动型 (Transactional)
*   **适用分类**: `GOODS`, `RENTAL`, `SERVICE`, `TASK`
*   **核心特征**: 
    *   **强库存约束**: 商品卖一个少一个，时段预约了就不可选。
    *   **强状态机**: 必须经历 `待支付 -> 已支付 -> 待核销/发货 -> 已完成`。
    *   **资金参与**: 涉及支付网关、佣金抽成、保证金托管。
*   **存入表**: `listing_masters`, `listing_items` (SKU级)

#### 2. 内容驱动型 (Informational / Community)
*   **适用分类**: `WANTED`, `EVENT`, `OTHER`, `FREE_GIVEAWAY`
*   **核心特征**:
    *   **弱库存机制**: 求购需求可以一直挂着，直到用户自己关闭。
    *   **交流优先**: 核心是评论区 (Comments) 和私聊 (Chat)，而非支付。
    *   **轻量转化**: 报名活动通常只需统计名单，无需强制生成金融订单。
*   **存入表**: `community_posts` (或 `listing_masters` 但标记为 `is_informational=true`)

---

## 4. 💬 社区生活中心设计 (Community Life Hub Design)

为了提升社区活跃度，我们将非交易类的“邻里小事”设计为一套现代、轻量、社交化的系统。

### 4.1 设计理念：Snap-to-Post (即拍即发)
*   **极致轻量**: 摒弃表单感，采用类似于 Instagram / 小红书的“图文流”发布。
*   **零门槛**: 无需填写 SKU、价格（或仅简单填写）、库存或复杂的取消政策。
*   **社交优先**: 详情页以评论区和即时贴 (Instant Stickers) 为核心，鼓励邻里交流。

### 4.2 核心版块规划
| 版块名称 | 目标场景 | 展现形式 | 互动核心 |
| :--- | :--- | :--- | :--- |
| **🎒 闲置跳蚤** | 出售普通闲置、低值物品 | 瀑布流 (Pinterest Style) | 私聊、留言 |
| **🔍 邻里求购** | 寻找特定物品/服务 | 悬赏卡片 | 我有、推荐 |
| **🎁 免费赠送** | 邻里环保、闲置循环 | "抢单" 式领取卡 | 感谢、已领完 |
| **🎉 社区活动** | 约球、组队、聚会 | 报名墙 (Join Wall) | 参与人数、群聊 |
| **🤝 邻里互助** | 顺路带东西、简单帮忙 | 紧急气泡 (Urgent Bubble) | 我来帮、点赞 |

### 4.3 发布流：极简三步 (Minimal Flow)
1.  **捕捉**: 拍照/选择图片（AI 自动识别场景/物品）。
2.  **描述**: 简单描述 + 自动话题 (#闲置, #紧急)。
3.  **上架**: 一键发布到对应社区版块。

---

## 详细字段矩阵

## 详细字段矩阵

### 1. 💰 卖东西 (GOODS)

#### 1.1 Buyer - 个人闲置
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 商品名称 | ✅ | text | "索尼 A7M4 相机" |
| 图片 | ✅ | images | 1-6张 |
| 详细描述 | ⭐ | textarea | 使用感受、瑕疵说明 |
| **成色与来源** ||||
| 成色 | ✅ | select | 全新/几乎全新/良好/可用 |
| 购入渠道 | ⭐ | text | "京东自营" |
| 购入时间 | ⭐ | date | "2023年6月" |
| 转手原因 | ⭐ | text | "升级设备不再需要" |
| 原价参考 | ⭐ | number | "$2000" |
| **交付与价格** ||||
| 交付方式 | ✅ | checkbox | 自提/送货/快递 |
| 自提地点 | ✅ | location | "Kanata Lakes" |
| 送货范围 | 条件 | text | 如选送货则必填 |
| 快递费用 | 条件 | number | 如选快递则必填 |
| 售价 | ✅ | number | "$1500" |
| 是否议价 | ⭐ | boolean | 默认否 |

#### 1.2 Provider - 商品销售
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 商品名称 | ✅ | text | "健身月卡" |
| 图片 | ✅ | images | 1-6张 |
| 商品描述 | ✅ | textarea | 详细介绍 |
| **SKU与库存** ||||
| SKU/规格 | ⭐ | multi | "普通卡/VIP卡" |
| 库存数量 | ✅ | number | "50张" |
| 限购数量 | ⭐ | number | "每人限购2张" |
| **有效期与使用** ||||
| 有效期 | ✅ | text | "购买后30天内激活，激活后1个月有效" |
| 使用说明 | ✅ | textarea | "全店通用，需提前预约" |
| 使用限制 | ⭐ | textarea | "节假日不可用" |
| **政策** ||||
| 退换政策 | ✅ | textarea | "未激活可退，激活后不退不换" |
| 售价 | ✅ | number | "$199" |
| 优惠活动 | ⭐ | text | "买2送1" |

---

### 2. 🔄 出租/租赁 (RENTAL)

#### 2.1 Buyer - 个人物品出租
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 物品名称 | ✅ | text | "索尼 A7M4 相机" |
| 图片 | ✅ | images | 包含各角度+配件 |
| 物品状态 | ✅ | text | "9成新，功能完好，外观轻微划痕" |
| **配件与清单** ||||
| 配件清单 | ✅ | checklist | "相机包、SD卡32GB、充电器、2块电池" |
| 是否包含说明书 | ⭐ | boolean | 默认否 |
| **租期与定价** ||||
| 日租金 | ✅ | number | "$50/天" |
| 押金 | ✅ | number | "$500" |
| 最短租期 | ⭐ | number | "2天起租" |
| 最长租期 | ⭐ | number | "最多7天" |
| 长租优惠 | ⭐ | text | "租3天及以上9折" |
| **取还规则** ||||
| 取还地点 | ✅ | location | "Kanata Lakes，可送货+$10" |
| 取还时间 | ✅ | time-range | "工作日9:00-18:00，周末需预约" |
| 送货选项 | ⭐ | checkbox | 是否支持送货/收费 |
| **使用与赔偿** ||||
| 使用限制 | ⭐ | textarea | "仅Ottawa地区使用，不可带出省" |
| 损坏赔偿 | ✅ | textarea | "按二手市场价80%赔偿，配件遗失单独计价" |
| 清洁要求 | ⭐ | text | "归还前需清洁" |

#### 2.2 Provider - 设备/场地租赁
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 设备/场地名称 | ✅ | text | "20人会议室" |
| 图片 | ✅ | images | 各角度+设施细节 |
| 详细介绍 | ✅ | textarea | "位于XX大厦3楼，采光好，配备..." |
| **设施与服务** ||||
| 包含设施 | ✅ | checklist | "投影仪、白板、WiFi、茶水" |
| 容量限制 | ✅ | number | "最多容纳20人" |
| **租赁时段** ||||
| 租赁单位 | ✅ | select | 按小时/按天/按月 |
| 时租价格 | 条件 | number | "$50/小时" |
| 日租价格 | 条件 | number | "$300/天" |
| 月租价格 | 条件 | number | "$5000/月" |
| 最低租期 | ⭐ | text | "时租最少2小时" |
| **预约与政策** ||||
| 可预约时段 | ✅ | schedule | "周一至周日 8:00-22:00" |
| 预约提前时间 | ✅ | select | "至少提前24小时" |
| 取消政策 | ✅ | textarea | "提前24h取消全额退款，24h内取消收取30%费用" |
| 押金 | ✅ | number | "$200" |
| **额外费用** ||||
| 包含服务 | ⭐ | textarea | "免费WiFi、茶水、清洁" |
| 额外收费项 | ⭐ | textarea | "加时$60/小时，设备损坏照价赔偿" |
| **地点** ||||
| 详细地址 | ✅ | address | "XX街XX号XX大厦3楼" |
| 停车信息 | ⭐ | text | "大厦地下停车场，$5/小时" |

---

### 3. 🙋 找人帮忙 (TASK)

#### 3.1 Buyer - 任务悬赏
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 任务标题 | ✅ | text | "帮忙搬家（有电梯）" |
| 图片 | ⭐ | images | 现场照片（可选） |
| 任务详情 | ✅ | textarea | "从A地搬到B地，约15箱物品+2件小家具" |
| **时间与地点** ||||
| 任务地点 | ✅ | location | "从Kanata到Barrhaven" |
| 期望完成时间 | ✅ | datetime | "2024-02-15周六上午9:00" |
| 预计时长 | ⭐ | text | "约2-3小时" |
| 时间灵活度 | ⭐ | select | 固定/可协商 |
| **要求与报酬** ||||
| 任务要求 | ⭐ | textarea | "需自带工具，两人协作" |
| 技能要求 | ⭐ | tags | "搬运经验、有驾照" |
| 悬赏金额 | ✅ | number | "$80" |
| 支付方式 | ✅ | select | 完成后支付/预付定金 |
| **联系** ||||
| 联系方式 | ✅ | contact | 电话/微信 |
| 备注 | ⭐ | textarea | 其他说明 |

---

### 4. 💼 提供服务 (SERVICE)

#### 4.1 Provider - 按时计费（咨询/TaskRabbit）
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 服务名称 | ✅ | text | "财务咨询服务" |
| 图片 | ⭐ | images | 专业形象照/办公环境 |
| 服务描述 | ✅ | textarea | "提供税务规划、投资建议、财务报表分析" |
| **服务范围** ||||
| 服务区域 | ✅ | location | "全Ottawa，支持远程视频" |
| 服务方式 | ✅ | checkbox | 线下面谈/视频/电话 |
| **时间与定价** ||||
| 可服务时间 | ✅ | schedule | "周一至周五 9:00-17:00" |
| 时薪 | ✅ | number | "$120/小时" |
| 计时单位 | ✅ | select | 按小时/按半小时 |
| 最低时长 | ⭐ | number | "首次咨询2小时起" |
| **预约规则** ||||
| 预约要求 | ✅ | select | "需提前48小时预约" |
| 即时服务 | ⭐ | boolean | 是否接受即时预约 |
| 取消政策 | ✅ | textarea | "提前24h免费取消，24h内取消收取50%费用" |
| **服务流程** ||||
| 服务流程 | ⭐ | textarea | "1.需求沟通 2.方案制定 3.执行跟进 4.效果评估" |
| 准备材料 | ⭐ | textarea | "请提前准备财务报表、税务文件" |

#### 4.2 Provider - 上门服务（Visit Fee）
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 服务名称 | ✅ | text | "家电维修" |
| 图片 | ⭐ | images | 工作照/案例照 |
| 服务范围 | ✅ | textarea | "洗衣机、冰箱、空调、热水器维修" |
| **服务区域** ||||
| 服务区域 | ✅ | location | "Kanata Lakes及周边10km" |
| 区域外加价 | ⭐ | text | "10-20km加$20，20km以上不接单" |
| **定价** ||||
| 上门费 | ✅ | number | "$30（包含勘察诊断）" |
| 上门费说明 | ⭐ | text | "上门费不退，维修费另议" |
| 维修费 | ✅ | text | "根据故障程度，维修前先报价确认" |
| 参考价格 | ⭐ | textarea | "常见故障：电机更换$80-150，电路板$100-200" |
| **预约与服务** ||||
| 可预约时段 | ✅ | schedule | "工作日全天 + 周六上午" |
| 预约提前时间 | ✅ | select | "至少提前1天" |
| 紧急服务 | ⭐ | boolean+price | "24小时内加价50%" |
| **流程与保障** ||||
| 服务流程 | ✅ | textarea | "1.上门勘察 2.故障诊断 3.报价确认 4.维修 5.测试" |
| 质保政策 | ✅ | textarea | "维修后7天质保，7天内同一故障免费返修" |
| 取消政策 | ✅ | textarea | "师傅已出发后取消，收取$20空跑费" |
| **其他** ||||
| 自带配件 | ⭐ | textarea | "常用配件师傅自带，特殊配件需客户提供或代购" |

#### 4.3 Provider - 定制报价（Quote）
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 服务名称 | ✅ | text | "定制实木家具" |
| 图片 | ⭐ | images | 作品案例照片 |
| 服务描述 | ✅ | textarea | "提供实木家具定制，可根据户型设计" |
| **案例展示** ||||
| 作品案例 | ⭐ | images | 历史作品图片（强烈建议） |
| 案例说明 | ⭐ | textarea | 每个案例的风格、材质、价格范围 |
| **服务流程** ||||
| 服务流程 | ✅ | textarea | "1.需求沟通 2.上门量尺 3.设计方案 4.报价 5.确认后生产 6.安装" |
| 服务区域 | ✅ | location | "全Ottawa" |
| 设计费 | ⭐ | number | "设计费$200，下单后抵扣" |
| **周期与付款** ||||
| 预计周期 | ⭐ | text | "设计1周，生产2-4周" |
| 预付款 | ✅ | text | "确认方案后需付30%定金" |
| 付款节点 | ✅ | textarea | "定金30% -> 生产完成40% -> 安装完成30%" |
| **政策** ||||
| 退款政策 | ✅ | textarea | "设计阶段可退，已开始生产不退" |
| 质保政策 | ✅ | textarea | "1年质保，5年保修" |
| 修改政策 | ⭐ | textarea | "设计稿可免费修改2次，第3次起$50/次" |

#### 4.4 Provider - 行业名片（Lead Gen / Professional Presence）
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 专业名称 | ✅ | text | "资深地产经纪 - Jane Doe" |
| 专业头像 | ✅ | image | 1张专业形象照 |
| 专业简介 | ✅ | textarea | "10年地产经验，专注Kanata Lakes学区房，成交300+套" |
| **专业展示** ||||
| 专业领域 | ✅ | tags | "学区房、投资房、豪宅" |
| 服务区域 | ✅ | location | "Kanata、Barrhaven、Stittsville" |
| 成功案例 | ⭐ | images | 成交案例照片（可选） |
| 客户评价 | ⭐ | textarea | 精选客户评价 |
| **联系方式** ||||
| 手机 | ✅ | phone | 直接显示 |
| 微信 | ⭐ | text | 微信号 |
| 邮箱 | ⭐ | email | 邮箱地址 |
| 公司信息 | ⭐ | text | "RE/MAX Hallmark Realty" |
| **价格** ||||
| 价格显示 | N/A | - | 固定为"面议" |
| **特殊标识** ||||
| 行业名片模式 | ✅ | boolean | 自动标记为"仅展示，不交易" |

---

### 5. 🎁 免费赠送 (FREE_GIVEAWAY)

#### 5.1 All Users
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 物品名称 | ✅ | text | "搬家后闲置的书架" |
| 图片 | ✅ | images | 1-4张 |
| 物品描述 | ✅ | textarea | 详细说明状况 |
| **赠送规则** ||||
| 赠送原因 | ⭐ | text | "搬家不带走" |
| 领取方式 | ✅ | select | 自提/送货（限5km内） |
| 领取地点 | ✅ | location | "Kanata Lakes" |
| 领取时间 | ✅ | text | "本周末，需预约" |
| **限制** ||||
| 数量 | ✅ | number | "1件" |
| 附加要求 | ⭐ | textarea | "需自行搬运" |
| **价格** ||||
| 价格 | N/A | - | 固定为$0 |

---

### 6. 🔍 求购/求租 (WANTED)

#### 6.1 All Users
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 需求类型 | ✅ | select | 求购/求租 |
| 物品名称 | ✅ | text | "索尼 A7M4 相机" |
| 参考图片 | ⭐ | images | 期望的款式/型号 |
| 详细要求 | ✅ | textarea | 具体需求、品牌、型号、成色等 |
| **预算与时间** ||||
| 预算范围 | ✅ | number-range | "$1000-1500" |
| 期望时间 | ⭐ | text | "本月内" |
| 租期要求 | 条件 | text | 如求租则必填 |
| **联系** ||||
| 联系方式 | ✅ | contact | 电话/微信 |
| 备注 | ⭐ | textarea | 其他说明 |

---

### 7. 🎉 社区活动 (COMMUNITY_EVENT)

#### 7.1 All Users
| 字段 | 必填 | 类型 | 示例/说明 |
|:---|:---:|:---|:---|
| **基础信息** ||||
| 活动名称 | ✅ | text | "周末烧烤聚会" |
| 活动图片 | ⭐ | images | 宣传图/活动场地 |
| 活动描述 | ✅ | textarea | 详细活动内容 |
| **时间地点** ||||
| 活动时间 | ✅ | datetime | "2024-02-20 周六 15:00-20:00" |
| 活动地点 | ✅ | location | "Kanata Lakes社区公园" |
| **参与规则** ||||
| 人数限制 | ⭐ | number | "最多30人" |
| 报名截止 | ⭐ | date | "活动前3天" |
| 参与费用 | ✅ | number | "$10/人（AA制）或免费" |
| 费用说明 | 条件 | text | 如收费则说明用途 |
| **联系** ||||
| 组织者 | ✅ | text | "Jane Doe" |
| 联系方式 | ✅ | contact | 电话/微信 |
| **其他** ||||
| 需自带物品 | ⭐ | textarea | "请自带餐具、饮料" |
| 注意事项 | ⭐ | textarea | "雨天改期" |

---

## 动态表单系统

### 核心逻辑
```typescript
interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'images' | 'location' | 'datetime' | 'schedule';
  required: boolean;
  recommended: boolean; // ⭐ 标记
  conditional?: {
    dependsOn: string;
    value: any;
  };
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

const getFieldsForType = (
  type: ListingType,
  isProvider: boolean,
  subType?: string
): FieldDefinition[] => {
  const fieldMap = {
    'GOODS': isProvider ? providerGoodsFields : buyerGoodsFields,
    'RENTAL': isProvider ? providerRentalFields : buyerRentalFields,
    'SERVICE': getServiceFields(subType), // 根据子类型
    'TASK': buyerTaskFields,
    'FREE_GIVEAWAY': freeGiveawayFields,
    'WANTED': wantedFields,
    'COMMUNITY_EVENT': eventFields,
  };
  
  return fieldMap[type] || [];
};
```

### 表单渲染逻辑
```typescript
<DynamicForm fields={fields}>
  {fields.map(field => (
    <FormField
      key={field.name}
      {...field}
      badge={field.required ? '必填' : field.recommended ? '⭐' : '可选'}
    />
  ))}
</DynamicForm>
```

---

## 信息完整度评分

### 评分算法
```typescript
const calculateCompleteness = (filledFields: Set<string>, allFields: FieldDefinition[]) => {
  const requiredFields = allFields.filter(f => f.required);
  const recommendedFields = allFields.filter(f => f.recommended);
  
  const requiredScore = (filledFields.filter(f => requiredFields.includes(f)).length / requiredFields.length) * 60; // 必填占60%
  const recommendedScore = (filledFields.filter(f => recommendedFields.includes(f)).length / recommendedFields.length) * 40; // 建议占40%
  
  return Math.round(requiredScore + recommendedScore);
};
```

### UI展示
```
┌────────────────────────────┐
│ 📊 信息完整度: 75%         │
│ ━━━━━━━━━━━━━━━           │
│                            │
│ ✅ 必填项 5/5 完成         │
│ ⭐ 建议项 2/4 完成         │
│                            │
│ 💡 还可以添加：            │
│   - 转手原因               │
│   - 原价参考               │
│                            │
│ 🎁 完整度90%+ 获得：       │
│    ✓ 3倍曝光量             │
│    ✓ 推荐位展示            │
│    ✓ "优质发布"徽章        │
└────────────────────────────┘
```

---

## UI/UX设计规范

### 1. 分步引导原则
```
第1步：快速起草（内容优先）
  └─ 标题 + 图片 + 简单描述

第2步：选择分类（可跳过）
  └─ 角色过滤 + 智能推荐

第3步：填写详情（动态表单）
  └─ 根据类型加载对应字段
  └─ 实时显示完整度

第4步：预览确认
  └─ 展示最终效果
  └─ 可返回修改

### 5. 社区发帖 UI (Lightweight Posting)
*   **界面风格**: 采用底部抽屉 (Bottom Sheet) 或全屏沉浸式 UI。
*   **媒体优先**: 占据屏幕 2/3 的大图预览。
*   **快捷标签**: 提供“全新”、“不讲价”、“自提”等一键标签。
*   **一键分享**: 发布成功后自动生成社区海报。
```

### 2. 字段显示规范
- **必填字段**：红色 `*` 标记，未填写不可提交
- **建议字段**：金色 `⭐` 标记，影响完整度评分
- **可选字段**：无标记，不影响发布

### 3. 智能提示
```typescript
// 基于标题猜测类型
if (title.includes('出租') || title.includes('租赁')) {
  suggestType('RENTAL');
}

// 基于关键词推荐字段值
if (title.includes('相机')) {
  prefillField('category', 'Electronics > Photography');
}
```

### 4. 模板系统
```
常用模板：
├─ "相机出租"模板
├─ "搬家任务"模板
├─ "家具定制"模板
└─ "家电维修"模板

用户可一键应用，快速填充常见字段
```

---

## 实现优先级

### P0（本周）
- ✅ 动态表单核心组件
- ✅ 基础类型字段定义（GOODS, RENTAL, SERVICE, TASK）
- ✅ 必填验证

### P1（下周）
- 🔜 信息完整度评分
- 🔜 智能字段推荐
- 🔜 图片自动识别分类

### P2（长期）
- 🔜 模板系统
- 🔜 历史发布学习
- 🔜 AI辅助填写
