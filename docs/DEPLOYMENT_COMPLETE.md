# 🔐 Supabase 配置完成指南

## ✅ 你的 Supabase 项目信息

- **Project URL**: `https://fvjgmydkxklqclcyhuvl.supabase.co`
- **Publishable Key**: `sb_publishable_Bw8nRiGMo0oGJ52pvsNJSw_JAQJI6Ih`
- **Project Name**: Jinbeanart

---

## 📝 Step 1: 创建本地环境配置

在项目根目录创建 `.env.local` 文件（手动操作）：

```bash
# 文件路径：d:\My Project\ts\hangs\gig-neighbor\.env.local
```

**文件内容**：
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://fvjgmydkxklqclcyhuvl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Bw8nRiGMo0oGJ52pvsNJSw_JAQJI6Ih

# Feature Flags
VITE_USE_MOCK_DATA=false  # false = 使用 Supabase
VITE_ENABLE_AI_SEARCH=false  # 稍后启用

# Pilot Node Configuration
VITE_DEFAULT_NODE=NODE_LEES
VITE_AVAILABLE_NODES=NODE_LEES,NODE_KANATA

# Debug Options
VITE_DEBUG_MODE=true
VITE_SHOW_DEV_TOOLS=false
```

---

## 🚀 Step 2: 启动开发服务器

```bash
# 重启开发服务器以加载新的环境变量
npm run dev
```

**预期输出**：
```
🔗 Repository Factory: Using Supabase (Production Mode)
```

如果看到这条日志，说明配置成功！

---

## 🧪 Step 3: 测试连接

打开浏览器访问：`http://localhost:5173`

### 测试用户注册

1. 点击右上角「登录」
2. 输入你的邮箱
3. 点击「Send Magic Link」或使用 Demo 登录
4. 检查 Supabase Dashboard：
   - **Authentication → Users**（应该看到新用户）
   - **Table Editor → user_profiles**（自动创建的 profile）

---

## 📊 Step 4: 验证数据库部署

在 Supabase SQL Editor 中运行：

```sql
-- 检查所有表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 检查 Pilot Nodes 是否已种子
SELECT code_id, zh_name, en_name 
FROM ref_codes 
WHERE type = 'COMMUNITY_NODE';
```

**预期结果**：
- 应该看到 20+ 张表
- 应该看到 2 个 Pilot Nodes（NODE_LEES, NODE_KANATA）

---

## 🎯 下一步（可选）

### Option A: 启用 pgvector（AI 搜索）

1. **Dashboard → Database → Extensions**
2. 搜索 `vector`
3. 点击启用
4. 运行 `docs/supabase_vector_setup.sql`
5. 更新 `.env.local`：`VITE_ENABLE_AI_SEARCH=true`

### Option B: 添加测试数据

在 SQL Editor 运行：

```sql
-- 创建测试 Provider Profile
INSERT INTO provider_profiles (user_id, business_name_zh, business_name_en)
SELECT 
  id, 
  '测试服务商',
  'Test Provider'
FROM user_profiles 
LIMIT 1
RETURNING id;

-- 创建测试 Listing
INSERT INTO listing_masters (
  provider_id, title_zh, title_en, description_zh, 
  category_id, node_id, type, status
)
SELECT 
  pp.id,
  '帮忙铲雪 - 冬季特惠',
  'Snow Removal - Winter Special',
  '提供专业铲雪服务，价格实惠',
  '1050100',
  'NODE_KANATA',
  'SERVICE',
  'PUBLISHED'
FROM provider_profiles pp
LIMIT 1
RETURNING id;

-- 添加 Listing Item（具体规格）
INSERT INTO listing_items (
  master_id, name_zh, name_en, price_amount, price_currency, price_unit
)
SELECT 
  lm.id,
  '标准铲雪（车道）',
  'Standard Driveway',
  3000, -- $30.00
  'CAD',
  '次'
FROM listing_masters lm
LIMIT 1;
```

### Option C: 部署 Edge Function（AI 搜索）

```bash
# 需要 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref fvjgmydkxklqclcyhuvl

# 部署函数
supabase functions deploy generate-embedding

# 设置 OpenAI Key（可选）
supabase secrets set OPENAI_API_KEY=sk-your-key
```

---

## ✅ 快速检查清单

- [ ] `.env.local` 文件已创建并包含正确的 URL 和 Key
- [ ] 开发服务器已重启
- [ ] 控制台显示 "Using Supabase (Production Mode)"
- [ ] 可以在浏览器中访问应用
- [ ] 可以创建新用户（检查 Supabase Dashboard）
- [ ] `user_profiles` 表自动创建了 profile

---

## 🆘 故障排除

### "Invalid API key"
- 检查 `.env.local` 中的 Key 是否正确
- 重启开发服务器（`Ctrl+C` 然后 `npm run dev`）

### "Cannot connect to database"
- 检查 Supabase 项目是否处于活跃状态（未暂停）
- 检查网络连接

### Profile 未自动创建
- 确认已运行 `supabase_triggers.sql`
- 检查 Trigger 是否存在：
  ```sql
  SELECT tgname FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created';
  ```

---

**准备好了吗？** 创建 `.env.local` 文件后，运行 `npm run dev` 开始测试！
