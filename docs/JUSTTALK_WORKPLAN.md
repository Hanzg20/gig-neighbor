# JustTalk 开发工作计划

**版本**: v1.0
**日期**: 2026-01-19
**状态**: 待执行

---

## 一、当前状态总览

### 已完成功能 (70%)

| 模块 | 完成度 | 说明 |
|------|--------|------|
| 瀑布流布局 | ✅ 100% | MasonryGrid 响应式完美 |
| 图片轮播 | ✅ 100% | Embla Carousel + 沉浸式查看 |
| 帖子发布 | ✅ 95% | LitePost 基础功能完整 |
| 帖子详情 | ⚠️ 70% | 内容展示完整，交互待完善 |
| 点赞功能 | ⚠️ 85% | 帖子点赞OK，评论点赞缺失 |
| 评论系统 | ⚠️ 60% | 基础可用，回复/嵌套未实现 |
| 分享功能 | ✅ 95% | 海报生成完整 |

### 待开发功能

| 模块 | 优先级 | 说明 |
|------|--------|------|
| 真言模式 | 🔴 P0 | 核心创新功能 |
| 共识投票 | 🔴 P0 | 真言配套功能 |
| 用户等级 | 🟡 P1 | 贡献度系统 |
| 详情页优化 | 🟡 P1 | 参考小红书/Instagram |
| 评论回复 | 🟡 P1 | 嵌套评论显示 |
| 收藏功能 | 🟢 P2 | 小红书标配 |
| 关注系统 | 🟢 P2 | 社交关系链 |

---

## 二、分阶段工作计划

### Phase 1: 真言核心功能 (Week 1-2)

#### 1.1 类型定义更新
**文件**: `src/types/community.ts`

```typescript
// 新增类型
interface FactData {
  occurredAt: string;
  location: string;
  factType: FactType;
  subject?: { type: string; name: string; identifier?: string; };
  evidence?: string[];
}

interface Consensus {
  agree: number;
  partial: number;
  disagree: number;
  uncertain: number;
  level: ConsensusLevel;
}

// 扩展 CommunityPost
interface CommunityPost {
  // ...现有字段
  isFact: boolean;
  factData?: FactData;
  consensus?: Consensus;
}
```

#### 1.2 数据库迁移
**文件**: `supabase/migrations/xxx_add_fact_fields.sql`

```sql
-- 帖子表扩展
ALTER TABLE community_posts ADD COLUMN is_fact BOOLEAN DEFAULT FALSE;
ALTER TABLE community_posts ADD COLUMN fact_data JSONB;
ALTER TABLE community_posts ADD COLUMN consensus JSONB;

-- 投票表
CREATE TABLE fact_votes (...);

-- 用户贡献度表
CREATE TABLE user_contributions (...);
```

#### 1.3 发帖组件更新
**文件**: `src/components/Community/LitePost.tsx`

**新增功能**:
- [ ] 真言模式开关 (Toggle)
- [ ] 真言额外字段表单:
  - 发生时间选择器
  - 地点输入 (带自动补全)
  - 事件类型选择
  - 证据图片上传 (额外3张)
- [ ] 真言引导文案
- [ ] 表单验证 (真言模式必填字段)

**UI设计**:
```
┌────────────────────────────────────────┐
│  发布模式                              │
│  ┌──────────────┐ ┌──────────────┐    │
│  │ ○ 普通帖     │ │ ● ✅ 真言帖  │    │
│  │   随便聊聊   │ │   分享真实经历│    │
│  └──────────────┘ └──────────────┘    │
│                                        │
│  [真言模式时显示额外字段]              │
│  📅 发生时间: [日期选择器]             │
│  📍 发生地点: [地点输入框]             │
│  🏷️ 事件类型: [下拉选择]              │
│  📷 证据图片: [上传区域]               │
└────────────────────────────────────────┘
```

#### 1.4 卡片组件更新
**文件**: `src/components/Community/CommunityCardV2.tsx`

**新增功能**:
- [ ] 真言帖特殊样式:
  - ✅ FACT 标识徽章
  - 时间+地点信息行
  - 迷你共识条
- [ ] 共识等级提示

**UI对比**:
```
普通帖:                      真言帖:
┌──────────────┐             ┌──────────────┐
│ 🏘️ 邻里      │             │ ✅真言·🏘️邻里 │ ← 双标识
│ [图片]       │             │ [图片]       │
│ 内容...      │             │ 内容...      │
│              │             │ 📍地点 📅时间 │ ← 额外信息
│              │             │ ████░░ 68%   │ ← 迷你共识条
│ 👤 ❤️23 💬5  │             │ 👤Lv3 ❤️23 💬5│ ← 含等级
└──────────────┘             └──────────────┘
```

---

### Phase 2: 共识投票系统 (Week 2-3)

#### 2.1 共识条组件
**新建文件**: `src/components/Community/ConsensusBar.tsx`

```typescript
interface ConsensusBarProps {
  consensus: Consensus;
  size?: 'mini' | 'full';
  showVoteButtons?: boolean;
  onVote?: (type: VoteType) => void;
}
```

**样式设计**:
```
Mini版 (卡片用):
████████████░░░░  68% 一致 · 12人

Full版 (详情页用):
┌────────────────────────────────────┐
│  社区共识                          │
│  ████████████░░░░░░░  68% 一致    │
│  ▓▓▓▓▓░░░░░░░░░░░░░  20% 部分    │
│  ▒▒░░░░░░░░░░░░░░░░   8% 不一致  │
│  ░░░░░░░░░░░░░░░░░░   4% 不确定  │
│                                    │
│  共 25 位邻居验证 · 高度一致       │
│                                    │
│  [一致] [部分一致] [不一致] [不确定]│
└────────────────────────────────────┘
```

#### 2.2 投票按钮组件
**新建文件**: `src/components/Community/FactVoteButtons.tsx`

**功能**:
- [ ] 4个投票选项按钮
- [ ] 已投票状态高亮
- [ ] 投票后动画反馈
- [ ] 登录检查
- [ ] 防重复投票

#### 2.3 投票API
**更新文件**: `src/services/repositories/supabase/CommunityPostRepository.ts`

```typescript
// 新增方法
voteOnFact(postId: string, userId: string, voteType: VoteType): Promise<void>
getMyVote(postId: string, userId: string): Promise<VoteType | null>
updateConsensus(postId: string): Promise<Consensus>
```

---

### Phase 3: 帖子详情页重构 (Week 3-4) ⭐ 重点

#### 3.1 设计参考

**小红书风格特点**:
- 沉浸式全屏图片/视频
- 底部上滑展开详情
- 双击点赞动画
- 评论区半屏弹出
- 作者信息悬浮

**Instagram风格特点**:
- 左右滑动切换帖子
- 底部固定评论入口
- 点赞/评论/分享/收藏四按钮
- Stories全屏体验

**创新融合方案**:
```
┌─────────────────────────────────────┐
│ ← 返回              ...更多         │ ← 顶部导航
├─────────────────────────────────────┤
│                                     │
│                                     │
│           图片/视频区域              │ ← 占60-70%高度
│        (支持左右滑动多图)            │
│         双击点赞动画                 │
│                                     │
├─────────────────────────────────────┤
│ 👤作者 · 关注                       │ ← 作者信息条
├─────────────────────────────────────┤
│                                     │
│ 📝 内容区域                         │
│ (可滚动)                            │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ [真言帖专属] 社区共识条          ││ ← 真言帖显示
│ │ ████████░░░  68%一致 · 25人验证 ││
│ │ [一致] [部分] [不一致] [不确定]  ││
│ └─────────────────────────────────┘│
│                                     │
│ #标签1 #标签2 #标签3               │
│ 📍地点 · 🕐 2小时前                │
│                                     │
├─────────────────────────────────────┤
│ 💬 评论 (23)                  查看全部 →│
│ ┌─────────────────────────────────┐│
│ │ 👤 用户A: 评论内容...           ││ ← 预览2-3条
│ │ 👤 用户B: 评论内容...           ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ❤️ 23  💬 5  ⭐ 收藏  📤 分享      │ ← 固定底部操作栏
│ [写评论...]                    发送 │
└─────────────────────────────────────┘
```

#### 3.2 详情页组件拆分

**新建/重构文件**:
```
src/pages/CommunityPostDetail.tsx (重构)
  ├── components/
  │   ├── PostMediaViewer.tsx      # 图片/视频全屏查看
  │   ├── PostAuthorBar.tsx        # 作者信息+关注按钮
  │   ├── PostContent.tsx          # 内容展示
  │   ├── PostActions.tsx          # 底部操作栏
  │   ├── CommentSheet.tsx         # 评论半屏弹出
  │   └── CommentItem.tsx          # 单条评论(支持嵌套)
```

#### 3.3 交互优化

- [ ] **图片区域**:
  - 全屏沉浸式查看
  - 左右滑动切换
  - 双击点赞动画
  - 捏合缩放

- [ ] **内容区域**:
  - 可滚动展开
  - 长内容"展开全文"
  - 标签可点击跳转

- [ ] **评论区域**:
  - 半屏弹出模式 (移动端)
  - 嵌套回复显示
  - @提及高亮
  - 拉取加载更多

- [ ] **底部操作栏**:
  - 固定定位
  - 评论输入框
  - 点赞/收藏/分享按钮
  - 键盘弹出适配

---

### Phase 4: 用户等级系统 (Week 4-5)

#### 4.1 贡献度计算服务
**新建文件**: `src/services/contributionService.ts`

```typescript
interface ContributionScore {
  totalPosts: number;
  factPosts: number;
  totalComments: number;
  likesReceived: number;
  factVotesReceived: number;
  avgAgreeRate: number;
  votesGiven: number;
  score: number;
  level: number;
}

function calculateScore(data: ContributionData): number {
  return (
    data.totalPosts * 5 +
    data.factPosts * 20 +        // 真言权重高
    data.totalComments * 2 +
    data.likesReceived * 1 +
    data.factVotesReceived * 3 +
    data.avgAgreeRate * 50 +     // 高认可率加成
    data.votesGiven * 1
  );
}
```

#### 4.2 用户等级显示组件
**新建文件**: `src/components/User/UserLevelBadge.tsx`

```typescript
const LEVELS = [
  { level: 1, name: '新邻居', icon: '🌱', minScore: 0 },
  { level: 2, name: '活跃邻居', icon: '🌿', minScore: 100 },
  { level: 3, name: '热心邻居', icon: '🌳', minScore: 500 },
  { level: 4, name: '社区达人', icon: '⭐', minScore: 2000 },
  { level: 5, name: '真言先锋', icon: '👑', minScore: 5000 },
];
```

#### 4.3 集成位置
- [ ] 帖子卡片作者处显示等级
- [ ] 帖子详情页作者信息
- [ ] 评论作者处显示等级
- [ ] 个人主页贡献度面板

---

### Phase 5: 评论系统增强 (Week 5-6)

#### 5.1 嵌套评论显示
**重构文件**: `src/pages/CommunityPostDetail.tsx`

**功能**:
- [ ] 评论树形结构显示
- [ ] 回复缩进展示
- [ ] "查看更多回复"折叠
- [ ] 回复输入框 @提及

#### 5.2 评论点赞
**更新**: Repository + Store + UI

#### 5.3 补充事实评论
**真言帖专属**:
- [ ] "补充事实"评论类型
- [ ] 引导填写时间/地点/经历
- [ ] [补充信息] 标签显示

---

### Phase 6: 收藏与关注 (Week 6-7)

#### 6.1 收藏功能
- [ ] 帖子收藏/取消收藏
- [ ] 收藏列表页面
- [ ] 收藏夹分类 (可选)

#### 6.2 关注功能
- [ ] 用户关注/取消关注
- [ ] 关注列表/粉丝列表
- [ ] 关注状态显示

---

## 三、技术实现优先级

### 🔴 P0 - 必须完成 (Week 1-3)

| 任务 | 文件 | 工作量 |
|------|------|--------|
| 类型定义更新 | `types/community.ts` | 2h |
| 数据库迁移 | `migrations/*.sql` | 2h |
| LitePost 真言模式 | `LitePost.tsx` | 8h |
| 卡片真言样式 | `CommunityCardV2.tsx` | 4h |
| ConsensusBar 组件 | `ConsensusBar.tsx` | 4h |
| 投票API | `CommunityPostRepository.ts` | 4h |
| 投票按钮组件 | `FactVoteButtons.tsx` | 3h |

### 🟡 P1 - 重要功能 (Week 3-5)

| 任务 | 文件 | 工作量 |
|------|------|--------|
| 详情页重构 | `CommunityPostDetail.tsx` | 12h |
| PostMediaViewer | 新建 | 6h |
| CommentSheet | 新建 | 6h |
| 嵌套评论显示 | 重构 | 6h |
| 用户等级系统 | 多文件 | 8h |

### 🟢 P2 - 增强功能 (Week 5-7)

| 任务 | 文件 | 工作量 |
|------|------|--------|
| 收藏功能 | 多文件 | 6h |
| 关注功能 | 多文件 | 8h |
| 补充事实评论 | 多文件 | 4h |
| 供应商孵化提示 | 多文件 | 4h |

---

## 四、详情页设计参考

### 4.1 小红书特点借鉴

| 特点 | 借鉴方式 |
|------|---------|
| 沉浸式图片 | 图片占屏幕60-70%，上滑展开详情 |
| 双击点赞 | 保留现有功能，优化动画 |
| 底部评论 | 评论区半屏弹出，不离开当前页 |
| 作者卡片 | 悬浮作者信息+关注按钮 |
| 标签云 | 可点击跳转话题聚合页 |

### 4.2 Instagram特点借鉴

| 特点 | 借鉴方式 |
|------|---------|
| 四按钮操作栏 | ❤️点赞 💬评论 📤分享 ⭐收藏 |
| 固定底部 | 操作栏+评论输入固定底部 |
| 简洁布局 | 内容为王，减少干扰元素 |

### 4.3 创新设计

| 创新点 | 说明 |
|--------|------|
| 共识条 | 真言帖专属，直观显示社区验证结果 |
| 用户等级 | 作者名旁显示Lv徽章，增强信任 |
| 补充事实 | 评论区支持结构化补充经历 |
| 孵化提示 | 高认可用户弹出供应商邀请 |

---

## 五、文件变更清单

### 新建文件

```
src/
├── components/
│   └── Community/
│       ├── ConsensusBar.tsx          # 共识条
│       ├── FactVoteButtons.tsx       # 投票按钮
│       ├── FactBadge.tsx             # 真言标识
│       ├── PostMediaViewer.tsx       # 媒体全屏查看
│       ├── PostAuthorBar.tsx         # 作者信息条
│       ├── PostActions.tsx           # 底部操作栏
│       ├── CommentSheet.tsx          # 评论弹出层
│       └── CommentItem.tsx           # 评论项(支持嵌套)
│   └── User/
│       ├── UserLevelBadge.tsx        # 用户等级徽章
│       └── ContributionPanel.tsx     # 贡献度面板
├── services/
│   └── contributionService.ts        # 贡献度计算
└── hooks/
    └── useFactVote.ts                # 投票Hook

supabase/
└── migrations/
    └── 20260119_add_fact_system.sql  # 真言相关表
```

### 修改文件

```
src/
├── types/community.ts                # 添加真言类型
├── components/Community/
│   ├── LitePost.tsx                  # 添加真言模式
│   └── CommunityCardV2.tsx           # 真言卡片样式
├── pages/
│   └── CommunityPostDetail.tsx       # 重构详情页
└── services/repositories/
    └── CommunityPostRepository.ts    # 添加投票API
```

---

## 六、验收标准

### Phase 1 验收
- [ ] 可以发布真言帖（含时间/地点/类型）
- [ ] 卡片正确显示真言标识和信息
- [ ] 数据库正确存储 is_fact 和 fact_data

### Phase 2 验收
- [ ] 详情页显示完整共识条
- [ ] 可以投票且状态正确更新
- [ ] 共识等级正确计算显示

### Phase 3 验收
- [ ] 详情页沉浸式图片体验
- [ ] 底部操作栏固定且功能完整
- [ ] 评论区半屏弹出正常

### Phase 4 验收
- [ ] 用户等级正确计算显示
- [ ] 卡片和详情页显示等级徽章

### Phase 5 验收
- [ ] 嵌套评论正确显示
- [ ] 回复功能正常
- [ ] 评论点赞功能正常

---

## 七、风险与依赖

### 技术风险
1. **数据库迁移**: 需要备份现有数据
2. **性能**: 共识计算可能需要异步处理
3. **兼容性**: 确保旧帖子正常显示

### 依赖项
1. **UI组件**: 日期选择器、地点自动补全
2. **动画库**: Framer Motion (已有)
3. **图片处理**: html2canvas (已有)

---

**下一步**: 从 Phase 1 开始执行，先更新类型定义和数据库结构。
