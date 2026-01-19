# 🤖 AI 智能搜索功能完善方案

## 📋 目录
1. [当前实现状态](#当前实现状态)
2. [完善功能清单](#完善功能清单)
3. [实施计划](#实施计划)
4. [技术细节](#技术细节)
5. [用户体验优化](#用户体验优化)

---

## 📊 当前实现状态

### ✅ 已完成的基础设施

#### 1. 数据库层 (PostgreSQL + pgvector)
```sql
-- embedding 列 (384 维向量)
ALTER TABLE listing_masters ADD COLUMN embedding vector(384);

-- 向量索引 (HNSW)
CREATE INDEX idx_listing_masters_embedding
ON listing_masters USING hnsw (embedding vector_cosine_ops);

-- 语义搜索 RPC
CREATE FUNCTION match_listings(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_node_id text,
  filter_category_id text
) RETURNS TABLE (...);
```

#### 2. Edge Function (Supabase Function)
- **文件**: `supabase/functions/generate-embedding/index.ts`
- **模型**: OpenAI `text-embedding-3-small` (384维)
- **功能**: 将文本转换为向量
- **回退**: 占位符向量(开发环境)

#### 3. 前端 Hook (`useSemanticSearch`)
- **文件**: `src/hooks/useSemanticSearch.ts`
- **功能**:
  - 自动去抖(300ms)
  - AI 搜索失败自动回退到文本搜索
  - 支持节点过滤
  - 返回相似度分数

#### 4. 分类页面 AI 搜索
- **文件**: `src/pages/CategoryListing.tsx`
- **功能**:
  - Smart Search / Keyword 切换
  - 搜索参数传递
  - 结果计数显示

---

## 🎯 完善功能清单

### 🔴 优先级 1: 核心功能 (本周完成)

#### 1.1 首页智能搜索集成 ⭐⭐⭐
**当前问题**:
- SearchBar 只是跳转到分类页面
- 没有使用 AI 搜索能力
- 缺少搜索建议

**改进方案**:
```tsx
// src/components/SearchBar.tsx 改进
// 1. 添加实时 AI 搜索建议
// 2. 显示搜索结果预览
// 3. 支持直接在首页展示结果
```

**实现细节**:
- 使用 `useSemanticSearch` hook
- 在下拉框显示前 5 个最相关结果
- 点击"查看全部"跳转到搜索结果页
- 显示 AI 搜索状态(加载/完成/失败)

#### 1.2 搜索结果页优化 ⭐⭐
**文件**: `src/pages/CategoryListing.tsx`

**改进点**:
1. **AI 搜索状态指示**
   ```tsx
   {isSmartSearch && (
     <div className="flex items-center gap-2 text-xs text-primary">
       <Sparkles className="w-3 h-3 animate-pulse" />
       AI 智能搜索已启用
     </div>
   )}
   ```

2. **相似度显示**
   ```tsx
   // 在 ListingCard 上显示匹配度
   {item.similarity > 0.8 && (
     <Badge variant="secondary" className="bg-primary/10">
       <Sparkles className="w-3 h-3" /> 高度匹配
     </Badge>
   )}
   ```

3. **搜索意图理解**
   ```tsx
   // 显示 AI 理解的搜索意图
   "基于您的搜索 '{query}'，我们找到了以下相关服务..."
   ```

#### 1.3 搜索性能优化 ⭐⭐
**当前问题**:
- 每次输入都调用 API
- 重复查询没有缓存

**优化方案**:
1. **增加缓存层**
   ```tsx
   // 使用 TanStack Query 缓存搜索结果
   const { data, isLoading } = useQuery({
     queryKey: ['semantic-search', query, nodeId],
     queryFn: () => semanticSearch(query),
     staleTime: 5 * 60 * 1000, // 5分钟缓存
   });
   ```

2. **优化去抖时间**
   ```tsx
   // 根据查询长度动态调整去抖
   const debounceTime = query.length < 3 ? 500 : 300;
   ```

---

### 🟡 优先级 2: 用户体验增强 (本月完成)

#### 2.1 搜索历史记录 ⭐
**功能**:
- 保存最近 10 条搜索
- 点击历史快速搜索
- 清除历史功能

**存储方案**:
```tsx
// 使用 Zustand + localStorage
interface SearchHistoryState {
  history: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (query) => set((state) => ({
        history: [query, ...state.history.filter(q => q !== query)].slice(0, 10)
      })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'search-history' }
  )
);
```

#### 2.2 智能搜索建议 (热门搜索) ⭐
**数据源**:
1. **静态建议** - 预定义的常见搜索
2. **动态建议** - 基于用户搜索历史
3. **社区热门** - 统计 7 天内高频搜索

**实现**:
```sql
-- 创建搜索日志表
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  query TEXT,
  node_id TEXT,
  results_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 统计热门搜索 RPC
CREATE FUNCTION get_trending_searches(
  p_node_id TEXT,
  p_days INT DEFAULT 7,
  p_limit INT DEFAULT 10
) RETURNS TABLE (
  query TEXT,
  search_count BIGINT
);
```

#### 2.3 搜索结果高亮 ⭐
**功能**: 在搜索结果中高亮关键词

```tsx
// 高亮匹配的关键词
const highlightText = (text: string, query: string) => {
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/20">{part}</mark>
      : part
  );
};
```

---

### 🟢 优先级 3: 高级功能 (下个月)

#### 3.1 搜索过滤器增强 ⭐
**功能**:
- 价格范围过滤
- 距离过滤 (PostGIS 集成)
- 评分过滤
- 服务类型过滤

**UI 设计**:
```tsx
<Popover>
  <PopoverTrigger>
    <Button variant="outline">
      <SlidersHorizontal /> 筛选
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-4">
      <div>
        <label>价格范围</label>
        <Slider value={[minPrice, maxPrice]} onChange={setPriceRange} />
      </div>
      <div>
        <label>距离</label>
        <Select value={distance} onChange={setDistance}>
          <option value="1">1 km</option>
          <option value="3">3 km</option>
          <option value="5">5 km</option>
        </Select>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

#### 3.2 语音搜索 🎤
**功能**: 支持语音输入搜索

```tsx
// 使用 Web Speech API
const handleVoiceSearch = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setQuery(transcript);
    handleSearch(transcript);
  };
  recognition.start();
};
```

#### 3.3 搜索分析仪表盘 (Admin)
**功能**:
- 搜索量趋势
- 零结果查询分析
- 用户搜索路径分析

---

## 🛠️ 实施计划

### 第 1 周: 首页搜索增强

#### Day 1-2: SearchBar 组件重构
- [ ] 集成 `useSemanticSearch` hook
- [ ] 添加实时搜索建议下拉框
- [ ] 显示搜索结果预览卡片
- [ ] 添加 AI 搜索状态指示器

#### Day 3-4: 搜索结果页优化
- [ ] 添加相似度徽章
- [ ] 优化搜索结果排序
- [ ] 添加"为什么推荐"工具提示
- [ ] 空结果状态优化

#### Day 5: 性能优化
- [ ] 添加 TanStack Query 缓存
- [ ] 优化去抖逻辑
- [ ] 添加请求取消机制

### 第 2 周: 用户体验增强

#### Day 1-2: 搜索历史
- [ ] 创建 searchHistoryStore
- [ ] UI 集成历史记录显示
- [ ] 添加清除历史功能

#### Day 3-4: 智能建议
- [ ] 创建 search_logs 表
- [ ] 实现热门搜索 RPC
- [ ] UI 集成热门搜索

#### Day 5: 搜索高亮
- [ ] 实现关键词高亮函数
- [ ] 集成到搜索结果卡片

---

## 📝 技术细节

### 1. SearchBar 组件升级

**新增功能**:
```tsx
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { useSearchHistory } from '@/stores/searchHistoryStore';

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, loading, error } = useSemanticSearch(query, {
    enabled: query.length >= 2,
    threshold: 0.5,
    limit: 5
  });
  const { history, addToHistory } = useSearchHistory();

  const handleSearch = (searchQuery: string) => {
    addToHistory(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="relative">
      {/* 搜索输入框 */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
      />

      {/* AI 状态指示器 */}
      {loading && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}

      {/* 搜索结果下拉框 */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-xl border">
          {/* 实时结果预览 */}
          {results.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                AI 智能推荐
              </div>
              {results.slice(0, 3).map(item => (
                <SearchResultPreview key={item.id} item={item} />
              ))}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => handleSearch(query)}
              >
                查看全部 {results.length} 个结果 →
              </Button>
            </div>
          )}

          {/* 搜索历史 */}
          {!query && history.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-muted-foreground">
                最近搜索
              </div>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(h);
                    handleSearch(h);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-muted rounded-lg"
                >
                  <Clock className="w-3 h-3 inline mr-2" />
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. 搜索结果预览组件

```tsx
// src/components/search/SearchResultPreview.tsx
interface SearchResultPreviewProps {
  item: ListingMaster & { similarity?: number };
}

export const SearchResultPreview = ({ item }: SearchResultPreviewProps) => {
  return (
    <Link
      to={`/service/${item.id}`}
      className="flex gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
    >
      {/* 缩略图 */}
      <img
        src={item.images[0]}
        alt={item.titleZh}
        className="w-12 h-12 rounded-lg object-cover"
      />

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {item.titleZh}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {item.descriptionZh}
        </div>
      </div>

      {/* 相似度徽章 */}
      {item.similarity && item.similarity > 0.8 && (
        <Badge variant="secondary" className="shrink-0 h-fit">
          <Sparkles className="w-3 h-3" /> {Math.round(item.similarity * 100)}%
        </Badge>
      )}
    </Link>
  );
};
```

### 3. 搜索历史 Store

```tsx
// src/stores/searchHistoryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistoryState {
  history: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (query: string) => {
        if (!query.trim()) return;
        set((state) => ({
          history: [
            query,
            ...state.history.filter(q => q !== query)
          ].slice(0, 10) // 最多保存 10 条
        }));
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'justwedo-search-history',
    }
  )
);
```

---

## 🎨 用户体验优化

### 1. 空搜索结果优化

```tsx
// 当没有搜索结果时
{results.length === 0 && !loading && query && (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
      <Search className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">
      没有找到 "{query}" 相关的服务
    </h3>
    <p className="text-sm text-muted-foreground mb-4">
      试试其他关键词，或浏览推荐服务
    </p>
    <div className="flex gap-2 justify-center flex-wrap">
      {suggestedSearches.map(s => (
        <Button
          key={s}
          variant="outline"
          size="sm"
          onClick={() => setQuery(s)}
        >
          {s}
        </Button>
      ))}
    </div>
  </div>
)}
```

### 2. 搜索加载状态

```tsx
{loading && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)}
```

### 3. 搜索质量反馈

```tsx
// 在搜索结果底部添加反馈按钮
<div className="mt-8 text-center">
  <p className="text-sm text-muted-foreground mb-3">
    这些搜索结果有帮助吗?
  </p>
  <div className="flex gap-2 justify-center">
    <Button
      variant="outline"
      size="sm"
      onClick={() => logSearchFeedback(query, 'positive')}
    >
      <ThumbsUp className="w-4 h-4 mr-1" /> 有帮助
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => logSearchFeedback(query, 'negative')}
    >
      <ThumbsDown className="w-4 h-4 mr-1" /> 没帮助
    </Button>
  </div>
</div>
```

---

## 📊 性能监控

### 1. 搜索性能指标

**关键指标**:
- 搜索请求响应时间 (目标: <500ms)
- AI Embedding 生成时间 (目标: <200ms)
- 向量相似度计算时间 (目标: <100ms)
- 缓存命中率 (目标: >60%)

### 2. 用户行为分析

**跟踪事件**:
```tsx
// 搜索开始
analytics.track('search_initiated', {
  query,
  searchType: isSmartSearch ? 'ai' : 'keyword',
  nodeId
});

// 搜索完成
analytics.track('search_completed', {
  query,
  resultsCount: results.length,
  duration: Date.now() - startTime
});

// 结果点击
analytics.track('search_result_clicked', {
  query,
  listingId: item.id,
  position: index,
  similarity: item.similarity
});
```

---

## 🔒 错误处理

### 1. API 失败回退

```tsx
try {
  // 尝试 AI 搜索
  const results = await semanticSearch(query);
  setResults(results);
} catch (error) {
  console.error('AI search failed:', error);
  toast.error('AI 搜索暂时不可用，已切换到关键词搜索');

  // 自动回退到文本搜索
  const textResults = await keywordSearch(query);
  setResults(textResults);
}
```

### 2. 网络超时处理

```tsx
const searchWithTimeout = async (query: string, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const results = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return results;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('搜索超时，请重试');
    }
    throw error;
  }
};
```

---

## 📚 文档更新

### 需要更新的文档:
1. **用户指南** - 如何使用 AI 搜索
2. **API 文档** - 搜索 API 接口说明
3. **部署指南** - Edge Function 部署步骤
4. **故障排查** - 常见搜索问题解决

---

## ✅ 验收标准

### 功能验收:
- [ ] 首页搜索框支持实时 AI 搜索建议
- [ ] 搜索结果页显示相似度分数
- [ ] 搜索历史正确保存和显示
- [ ] AI 搜索失败能自动回退到关键词搜索
- [ ] 移动端搜索体验流畅

### 性能验收:
- [ ] 搜索响应时间 < 500ms (P95)
- [ ] 搜索建议延迟 < 300ms
- [ ] 缓存命中率 > 60%
- [ ] 无内存泄漏

### UX 验收:
- [ ] 搜索过程有清晰的加载状态
- [ ] 空结果有友好的提示和建议
- [ ] 搜索结果高亮关键词
- [ ] 支持键盘导航 (上下键选择建议)

---

## 🚀 下一步行动

1. **立即开始**: 首页 SearchBar 组件重构
2. **本周完成**: 搜索结果页优化
3. **本月完成**: 搜索历史和热门搜索
4. **持续优化**: 性能监控和用户反馈收集
