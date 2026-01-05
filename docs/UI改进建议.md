# 🎨 HangHand UI 修改和完善建议

**生成时间**: 2026-01-XX  
**审查范围**: 所有UI组件、设计系统、用户体验  
**参考文档**: System Design v2.0 Section 18 (UI/UX Design Philosophy)

---

## 📊 当前UI状态分析

### ✅ 已实现的设计元素
- [x] 基础圆角设计（`rounded-3xl`, `rounded-2xl`）
- [x] 渐变背景（`gradient-hero`, `gradient-card`）
- [x] 软阴影系统（`shadow-card`, `shadow-soft`）
- [x] 基础卡片组件（`card-warm`）
- [x] 移动端底部导航
- [x] Neighbor Stories 轮播组件
- [x] 响应式布局基础

### ❌ 缺失或不足的设计元素
- [ ] **玻璃态效果（Glassmorphism）**：缺少 `backdrop-blur` 的广泛应用
- [ ] **信任徽章系统**：认证级别、社区节点、邻里担保显示不完整
- [ ] **高信息密度布局**：信息展示不够紧凑，缺少 Meituan 风格
- [ ] **微交互动画**：缺少丰富的 hover 和点击反馈
- [ ] **人性化图像**：仍在使用占位图和通用图标
- [ ] **邻里温暖元素**：缺少情感化的视觉表达

---

## 🔴 优先级 P0: 核心设计系统完善

### 1. 完善信任徽章系统 ⚠️

**问题**: 当前 `ListingCard` 只显示基础的 "Verified" 标签，缺少：
- 认证级别（Level 1-5）
- 社区节点标识
- 邻里担保徽章
- 许可证信息

**改进方案**:

#### 1.1 创建 `VerificationBadge` 组件

```tsx
// src/components/ui/VerificationBadge.tsx
import { Shield, Award, MapPin, Users } from "lucide-react";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface VerificationBadgeProps {
  level: 1 | 2 | 3 | 4 | 5;
  nodeName?: string;
  endorsementCount?: number;
  licenseInfo?: {
    type: 'ECRA' | 'TSSA' | 'RMT' | 'OPMCA';
    number: string;
  };
  insuranceInfo?: {
    amount: number; // in millions
    currency: string;
  };
}

const LEVEL_CONFIG = {
  1: { icon: Shield, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Email Verified' },
  2: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Phone Verified' },
  3: { icon: Shield, color: 'text-green-500', bg: 'bg-green-100', label: 'ID & Background Checked' },
  4: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Insured Professional' },
  5: { icon: Award, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Licensed Professional' },
};

export function VerificationBadge({ 
  level, 
  nodeName, 
  endorsementCount = 0,
  licenseInfo,
  insuranceInfo 
}: VerificationBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const hasEndorsements = endorsementCount >= 5;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Level Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${config.bg} ${config.color} border-none px-2 py-1 text-xs font-bold flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              Level {level}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{config.label}</p>
            {insuranceInfo && (
              <p className="text-xs mt-1">Insured up to {insuranceInfo.amount}M {insuranceInfo.currency}</p>
            )}
            {licenseInfo && (
              <p className="text-xs mt-1">{licenseInfo.type} #{licenseInfo.number}</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Community Node */}
        {nodeName && (
          <Badge variant="outline" className="text-xs px-2 py-1 border-primary/20 text-primary">
            <MapPin className="w-3 h-3 mr-1" />
            {nodeName}
          </Badge>
        )}

        {/* Neighbor Endorsements */}
        {hasEndorsements && (
          <Badge className="bg-orange-100 text-orange-600 border-none px-2 py-1 text-xs font-bold flex items-center gap-1">
            <Users className="w-3 h-3" />
            Community Trusted
          </Badge>
        )}

        {/* License Badge (if Level 5) */}
        {level === 5 && licenseInfo && (
          <Badge className="bg-amber-100 text-amber-700 border-none px-2 py-1 text-xs font-bold">
            {licenseInfo.type} Verified
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}
```

#### 1.2 更新 `ListingCard` 使用新徽章

```tsx
// src/components/ListingCard.tsx (更新部分)
import { VerificationBadge } from "./ui/VerificationBadge";

export const ListingCard = ({ item }: { item: ListingMaster }) => {
  // ... existing code ...
  const provider = getProviderById(item.providerId);
  const nodeInfo = refCodes.find(r => r.codeId === item.nodeId);

  return (
    <Link to={`/service/${item.id}`} className="group block">
      <div className="card-warm overflow-hidden h-full hover:shadow-xl transition-all duration-300">
        {/* ... image section ... */}
        
        <div className="p-4">
          {/* ... title ... */}
          
          {/* 更新：使用新的 VerificationBadge */}
          {provider && (
            <div className="mb-2">
              <VerificationBadge
                level={provider.verificationLevel || 1}
                nodeName={nodeInfo?.enName || nodeInfo?.zhName}
                endorsementCount={provider.stats?.repeatRate ? Math.floor(provider.stats.repeatRate * 10) : 0}
                licenseInfo={provider.licenseInfo ? {
                  type: provider.licenseInfo.split(' ')[0] as any,
                  number: provider.licenseInfo.split('#')[1] || ''
                } : undefined}
                insuranceInfo={provider.insuranceSummaryEn ? {
                  amount: 2, // Parse from summary
                  currency: 'CAD'
                } : undefined}
              />
            </div>
          )}
          
          {/* ... rest of card ... */}
        </div>
      </div>
    </Link>
  );
};
```

---

### 2. 增强玻璃态效果（Glassmorphism）✨

**问题**: 当前只有 Header 使用了 `backdrop-blur`，其他组件缺少玻璃态效果。

**改进方案**:

#### 2.1 更新全局样式

```css
/* src/index.css (添加到 @layer components) */

.glass-card {
  @apply bg-card/60 backdrop-blur-xl border border-white/20;
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
}

.glass-header {
  @apply bg-card/80 backdrop-blur-xl border-b border-border/50;
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
}

.glass-modal {
  @apply bg-card/95 backdrop-blur-2xl border border-white/30;
  box-shadow: 
    0 20px 60px -12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
}

.glass-sticky-bar {
  @apply bg-card/90 backdrop-blur-xl border-t border-border/50;
  box-shadow: 0 -4px 20px -4px rgba(0, 0, 0, 0.1);
}
```

#### 2.2 应用到关键组件

```tsx
// src/pages/ServiceDetail.tsx (更新 Sticky Action Bar)
<div className="fixed bottom-0 left-0 right-0 z-50 glass-sticky-bar safe-area-bottom">
  <div className="container py-4">
    {/* Action buttons */}
  </div>
</div>

// src/components/Header.tsx (已实现，保持)
<header className="sticky top-0 z-50 glass-header">
  {/* ... */}
</header>
```

---

### 3. 增强微交互动画 🎭

**问题**: 当前动画较少，缺少"温暖"的交互反馈。

**改进方案**:

#### 3.1 添加更多动画工具类

```css
/* src/index.css (添加到 @layer utilities) */

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-scale-hover {
  transition: transform 0.2s ease-out;
}

.animate-scale-hover:hover {
  transform: scale(1.02);
}

.animate-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px -5px hsl(161 68% 30% / 0.3);
  }
  50% { 
    box-shadow: 0 0 30px -5px hsl(161 68% 30% / 0.5);
  }
}
```

#### 3.2 应用到交互元素

```tsx
// src/components/ListingCard.tsx
<div className="card-warm overflow-hidden h-full animate-lift cursor-pointer">
  {/* ... */}
</div>

// src/components/ui/button.tsx (更新 hover 效果)
<button className="btn-primary animate-scale-hover">
  {/* ... */}
</button>
```

---

## 🟡 优先级 P1: 信息密度和布局优化

### 4. 实现 Meituan 风格高信息密度布局 📊

**问题**: 当前布局过于"西方化"，信息密度不够高。

**改进方案**:

#### 4.1 创建紧凑的 `ListingCardCompact` 变体

```tsx
// src/components/ListingCardCompact.tsx
export const ListingCardCompact = ({ item }: { item: ListingMaster }) => {
  const items = listingItems.filter(li => li.masterId === item.id);
  const startingPrice = items.length > 0
    ? items.reduce((min, cur) => cur.pricing.price.amount < min.pricing.price.amount ? cur : min, items[0]).pricing.price
    : null;

  return (
    <Link to={`/service/${item.id}`} className="group block">
      <div className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all animate-lift">
        {/* 紧凑图片 */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={item.images[0]}
            alt={item.titleEn || item.titleZh}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* 类型标签 */}
          <div className="absolute top-1 right-1 bg-primary/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
            {item.type}
          </div>
        </div>

        {/* 信息区 */}
        <div className="flex-1 min-w-0">
          {/* 标题和评分一行 */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {item.titleEn || item.titleZh}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold">{item.rating}</span>
            </div>
          </div>

          {/* 服务商信息一行 */}
          <div className="flex items-center gap-2 mb-1.5 text-xs text-muted-foreground">
            <span className="truncate">{provider?.businessNameEn || provider?.businessNameZh}</span>
            {provider?.isVerified && (
              <Badge className="bg-green-100 text-green-600 border-none px-1 py-0 text-[9px]">
                ✓
              </Badge>
            )}
          </div>

          {/* 描述和价格一行 */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
              {item.descriptionEn || item.descriptionZh}
            </p>
            {startingPrice && (
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">From</span>
                <span className="text-primary font-extrabold text-base leading-tight">
                  {startingPrice.formatted}
                </span>
              </div>
            )}
          </div>

          {/* 标签行 */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <VerificationBadge level={provider?.verificationLevel || 1} />
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20">
              <MapPin className="w-2.5 h-2.5 mr-0.5" />
              {item.location.city}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};
```

#### 4.2 在首页使用紧凑布局选项

```tsx
// src/pages/Index.tsx
const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

{/* 切换视图按钮 */}
<div className="flex items-center gap-2 mb-4">
  <Button
    variant={viewMode === 'grid' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setViewMode('grid')}
  >
    Grid
  </Button>
  <Button
    variant={viewMode === 'compact' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setViewMode('compact')}
  >
    List
  </Button>
</div>

{/* 根据模式渲染 */}
{viewMode === 'compact' ? (
  <div className="space-y-2">
    {services.map(item => <ListingCardCompact key={item.id} item={item} />)}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {services.map(item => <ListingCard key={item.id} item={item} />)}
  </div>
)}
```

---

### 5. 增强 Neighbor Stories 组件 🧡

**问题**: 当前 Stories 组件较基础，缺少"温暖"的视觉表达。

**改进方案**:

#### 5.1 更新 `StoryCard` 组件

```tsx
// src/components/ui/StoryCard.tsx (增强版)
import { Heart, MapPin, Award } from "lucide-react";
import { Badge } from "./badge";

export function StoryCard({
  title,
  content,
  image,
  authorName,
  authorAvatar,
  categoryName,
  likes,
  locationTag, // 新增
  isFeatured, // 新增
}: StoryCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 animate-lift ${isFeatured ? 'ring-2 ring-primary/20' : ''}`}>
      {/* 温暖徽章 */}
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-orange-100 text-orange-600 border-none px-2 py-1 text-xs font-bold flex items-center gap-1">
            <Award className="w-3 h-3" />
            Featured Story
          </Badge>
        </div>
      )}

      {/* 图片 */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* 位置标签 */}
        {locationTag && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-none px-2 py-1 text-xs font-medium">
              <MapPin className="w-3 h-3 mr-1" />
              {locationTag}
            </Badge>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {content}
        </p>

        {/* 作者和互动 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-8 h-8 rounded-full border-2 border-primary/20"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">{authorName}</p>
              <p className="text-[10px] text-muted-foreground">{categoryName}</p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group/like">
            <Heart className={`w-4 h-4 ${likes > 0 ? 'fill-red-500 text-red-500' : ''} group-hover/like:scale-110 transition-transform`} />
            <span className="text-xs font-semibold">{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🟢 优先级 P2: 细节优化和用户体验

### 6. 优化移动端体验 📱

**问题**: 移动端交互可以更流畅，缺少手势支持。

**改进方案**:

#### 6.1 增强移动端底部导航

```tsx
// src/components/MobileBottomNav.tsx (增强版)
import { motion, AnimatePresence } from "framer-motion";

const MobileBottomNav = () => {
  // ... existing code ...

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-sticky-bar safe-area-bottom"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="w-6 h-6" />
                {item.badge !== null && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.span>
                )}
              </motion.div>
              
              <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
```

**注意**: 需要安装 `framer-motion`:
```bash
npm install framer-motion
```

---

### 7. 添加加载状态和骨架屏 ⏳

**问题**: 缺少优雅的加载状态。

**改进方案**:

```tsx
// src/components/ui/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="card-warm overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="h-5 bg-muted rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// 使用
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {services.map(item => <ListingCard key={item.id} item={item} />)}
  </div>
)}
```

---

### 8. 优化搜索体验 🔍

**问题**: 搜索栏功能较基础。

**改进方案**:

```tsx
// src/components/SearchBar.tsx (新建)
import { Search, X, TrendingUp } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    "House Cleaning",
    "Snow Removal",
    "Lawn Care",
    "Tool Rental",
  ];

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search services (e.g. cleaning, assembly, expert)..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-border/50 bg-muted/30 focus:bg-background focus:border-primary transition-all outline-none text-lg shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 搜索建议 */}
      {showSuggestions && (query || suggestions.length > 0) && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-2xl p-2 shadow-elevated z-50">
          {query ? (
            <div className="p-2 text-sm text-muted-foreground">
              Searching for "{query}"...
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Trending Searches
              </div>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {suggestion}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📋 实施优先级和时间表

| 优先级 | 任务 | 预计时间 | 依赖 |
|--------|------|----------|------|
| 🔴 P0 | 完善信任徽章系统 | 2天 | 无 |
| 🔴 P0 | 增强玻璃态效果 | 1天 | 无 |
| 🔴 P0 | 增强微交互动画 | 2天 | framer-motion |
| 🟡 P1 | 高信息密度布局 | 3天 | P0完成 |
| 🟡 P1 | 增强 Neighbor Stories | 2天 | P0完成 |
| 🟢 P2 | 优化移动端体验 | 2天 | framer-motion |
| 🟢 P2 | 添加骨架屏 | 1天 | 无 |
| 🟢 P2 | 优化搜索体验 | 2天 | 无 |

**总计**: 约 15 个工作日

---

## 🛠️ 技术依赖

### 需要安装的包

```bash
# 动画库
npm install framer-motion

# 图标库（如果还没有）
npm install lucide-react
```

### 需要更新的配置

```typescript
// tailwind.config.ts (确保包含所有动画)
export default {
  // ... existing config ...
  theme: {
    extend: {
      // ... existing extends ...
      animation: {
        // ... existing animations ...
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
};
```

---

## ✅ 检查清单

实施完成后，请验证：

- [ ] 所有信任徽章正确显示认证级别
- [ ] 玻璃态效果在所有关键组件中应用
- [ ] 微交互动画流畅且不卡顿
- [ ] 高信息密度布局在移动端和桌面端都正常
- [ ] Neighbor Stories 组件有"温暖"的视觉表达
- [ ] 移动端导航有流畅的动画
- [ ] 加载状态有骨架屏
- [ ] 搜索功能有建议和自动完成
- [ ] 所有组件在暗色模式下正常显示
- [ ] 性能测试通过（无明显的性能下降）

---

## 🎯 设计原则总结

在实施所有改进时，请始终遵循以下设计原则：

1. **Neighborly Warmth**: 每个交互都应该传达"邻里温暖"的感觉
2. **High Information Density**: 在保持可读性的前提下，最大化信息展示
3. **Trust First**: 信任元素（徽章、认证）应该始终可见
4. **Mobile-First**: 所有设计优先考虑移动端体验
5. **Accessibility**: 确保所有用户（包括视觉障碍）都能使用

---

**文档维护者**: UI/UX 团队  
**下次审查日期**: 2026-02-XX
