# 🔧 pgvector 扩展安装指南

## 问题说明

如果你在运行 `supabase_schema.sql` 时遇到错误：
```
ERROR: type vector does not exist
```

这是因为 `pgvector` 扩展在 Supabase 中需要手动启用。

---

## 解决方案

### 方法 1: 通过 Supabase Dashboard 启用（推荐）⭐

1. **打开 Supabase 项目**
   - 登录 https://supabase.com/dashboard
   - 选择你的项目

2. **启用 pgvector 扩展**
   - 点击左侧菜单 **Database** → **Extensions**
   - 在搜索框输入 `vector`
   - 找到 `vector` 扩展，点击右侧的开关启用

3. **运行 vector 设置脚本**
   - 打开 SQL Editor
   - 复制 `docs/supabase_vector_setup.sql` 的内容
   - 粘贴并执行

4. **验证安装**
   ```sql
   -- 检查扩展是否启用
   SELECT * FROM pg_extension WHERE extname = 'vector';
   
   -- 检查 embedding 列是否存在
   SELECT table_name, column_name 
   FROM information_schema.columns 
   WHERE column_name = 'embedding';
   ```

---

### 方法 2: 跳过 AI 搜索功能（快速部署）

如果你现在不需要 AI 语义搜索功能，可以：

1. **直接运行当前的 schema**
   - `supabase_schema.sql` 已经更新，vector 列被注释掉了
   - 可以安全地运行，不会报错

2. **以后再启用**
   - 当你需要 AI 搜索时，运行 `supabase_vector_setup.sql`
   - 这会添加 embedding 列和索引

---

## pgvector 可用性检查

不是所有 Supabase 项目都支持 pgvector。检查方法：

### 在 SQL Editor 中运行：
```sql
-- 检查 pgvector 是否可用
SELECT name, installed_version, default_version
FROM pg_available_extensions
WHERE name = 'vector';
```

**结果解读**：
- ✅ 返回一行数据 → pgvector 可用，按方法 1 启用
- ❌ 没有返回数据 → pgvector 不可用，使用方法 2

---

## 当前部署状态

### ✅ 核心功能（无需 pgvector）
- 用户认证和授权
- 列表管理（Master-Detail 模式）
- 订单和交易流程
- JinBean 积分系统
- 评论和信任系统
- 购物车功能

### ⏳ AI 功能（需要 pgvector）
- 语义搜索（自然语言搜索）
- 智能推荐
- 故事推荐轮播

---

## 常见问题

### Q: 为什么 Supabase 不默认启用 pgvector？
A: pgvector 是一个可选的扩展，需要额外的系统资源。Supabase 允许用户按需启用。

### Q: 不启用 pgvector 会影响平台功能吗？
A: 不会。核心功能（认证、订单、积分等）都不依赖 pgvector。只有 AI 搜索功能需要它。

### Q: 可以后续再添加 pgvector 吗？
A: 可以！只需在 Dashboard 启用扩展，然后运行 `supabase_vector_setup.sql` 即可。

### Q: 如果我的 Supabase 项目不支持 pgvector 怎么办？
A: 可以使用文本搜索作为替代方案。`useSemanticSearch` hook 已经包含了文本搜索的回退逻辑。

---

## 下一步

1. ✅ 先部署核心 schema（已修复，不会报错）
2. ✅ 测试基本功能（用户、列表、订单）
3. ⏳ 稍后启用 pgvector（按需）
4. ⏳ 部署 Edge Function（AI 搜索）

**建议**：先完成核心部署和测试，等确认平台正常运行后再启用 AI 功能。
