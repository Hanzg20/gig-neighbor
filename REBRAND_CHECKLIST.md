# 渥帮 JUSTWEDO 品牌更名检查清单

## 📋 执行步骤

### 阶段1: 准备工作

- [ ] **备份当前代码**
  ```bash
  git status  # 确保工作区干净
  git branch rebrand-justwedo  # 创建更名分支
  git checkout rebrand-justwedo
  ```

- [ ] **确认运行环境**
  - Windows: 使用PowerShell
  - Mac/Linux/Git Bash: 使用Bash

---

### 阶段2: 自动替换

#### Windows (PowerShell)
```powershell
# 在项目根目录执行
.\rebrand.ps1

# 或不创建备份
.\rebrand.ps1 -Backup:$false

# 或模拟运行（不修改文件）
.\rebrand.ps1 -DryRun
```

#### Mac/Linux/Git Bash
```bash
# 添加执行权限
chmod +x rebrand.sh

# 执行脚本
./rebrand.sh

# 或不创建备份
./rebrand.sh --no-backup

# 或模拟运行
./rebrand.sh --dry-run
```

- [ ] **脚本执行成功**
- [ ] **查看替换报告** (`rebrand_report.txt`)

---

### 阶段3: 手动检查和修改

#### 必须手动检查的文件

- [ ] **package.json**
  ```json
  {
    "name": "justwedo",  // ✅ 已由脚本更新
    "description": "JUSTWEDO - 渥太华华人互助平台",  // ⚠️ 需手动更新
    "version": "0.0.3"
  }
  ```

- [ ] **public/index.html** (如果存在)
  ```html
  <title>渥帮 JUSTWEDO - 渥太华华人互助平台</title>
  <meta name="description" content="JUSTWEDO - Get Things Done Together" />
  <meta property="og:site_name" content="渥帮 JUSTWEDO" />
  ```

- [ ] **README.md**
  - [ ] 项目标题更新
  - [ ] 项目描述更新
  - [ ] 所有JUSTWEDO引用已替换

- [ ] **.env.example**
  ```bash
  # 检查注释中的品牌引用
  # JUSTWEDO Platform Configuration
  ```

- [ ] **src/pages/About.tsx** (关于页面)
  ```tsx
  // 确认品牌描述已更新
  "渥帮 JUSTWEDO - 我们一起做"
  "JUSTWEDO - Get Things Done Together"
  ```

- [ ] **supabase/functions/stripe-webhook/index.ts** (第188行)
  ```typescript
  // 更新SMS消息内容
  message: `Your JUSTWEDO purchase is complete! Card Number: ${inventoryItem.serial_number}.`
  ```

#### 关键检查点

- [ ] **Logo文件准备**
  - [ ] `public/logo.png` (网站主logo)
  - [ ] `public/qr-logo.png` (QR码专用logo)
  - [ ] `public/favicon.ico` (浏览器图标)

- [ ] **演示URL更新**
  ```typescript
  // src/components/inventory/QrLogoDemo.tsx
  const [url, setUrl] = useState('https://justwedo.com/scan/demo-123456');
  ```

- [ ] **所有console.log日志**
  ```typescript
  console.log('[JWD] ...')  // ✅ 统一使用JWD标记
  ```

---

### 阶段4: 验证测试

- [ ] **Git状态检查**
  ```bash
  git status
  git diff | less  # 仔细查看所有变更
  ```

- [ ] **构建测试**
  ```bash
  npm install  # 重新安装依赖（package.json已更改）
  npm run build  # 确保构建成功
  ```

- [ ] **本地开发测试**
  ```bash
  npm run dev
  # 访问 http://localhost:8080
  # 检查页面标题、导航栏、Footer等显示正确
  ```

- [ ] **全文搜索残留**
  ```bash
  # 搜索是否还有JUSTWEDO残留
  grep -r "JUSTWEDO" src/ docs/ supabase/ --exclude-dir=node_modules
  grep -r "justwedo" src/ docs/ supabase/ --exclude-dir=node_modules
  ```

---

### 阶段5: Git提交

- [ ] **暂存所有变更**
  ```bash
  git add .
  ```

- [ ] **提交变更**
  ```bash
  git commit -m "rebrand: JUSTWEDO → JUSTWEDO

  - 全局替换品牌名称 JUSTWEDO → JUSTWEDO
  - 更新域名引用为 justwedo.com
  - 统一日志标记为 [JWD]
  - 更新package.json项目名称
  - 更新SMS消息内容
  - 更新文档和注释

  中文名「渥帮」保持不变
  "
  ```

- [ ] **推送到远程（可选）**
  ```bash
  git push origin rebrand-justwedo
  ```

---

### 阶段6: 后续工作

- [ ] **设计Logo**
  - [ ] 主Logo（JUSTWEDO | 渥帮）
  - [ ] QR专用Logo（JWD简化版）
  - [ ] Favicon

- [ ] **域名配置**
  - [ ] 配置 justwedo.com DNS
  - [ ] 更新 Vercel 域名设置
  - [ ] 设置旧域名301重定向（如果需要）

- [ ] **环境变量更新**
  - [ ] 更新 .env.local
  - [ ] 更新 Supabase 项目设置
  - [ ] 更新 Stripe 账户信息

- [ ] **部署测试**
  - [ ] 部署到测试环境
  - [ ] 验证所有功能正常
  - [ ] 检查品牌展示一致性

- [ ] **生产部署**
  - [ ] 合并到main分支
  - [ ] 部署到生产环境
  - [ ] 监控错误日志

---

## 🔄 回滚方案

### 如果使用了脚本备份
```bash
# 查看备份目录
ls -la backup_justwedo_*

# 恢复备份（示例）
cp -r backup_justwedo_20260113_143000/* .
```

### 使用Git回滚
```bash
# 查看提交历史
git log --oneline

# 回滚到更名前的提交
git revert <commit-hash>

# 或强制回滚（谨慎使用）
git reset --hard <commit-hash>
```

---

## 📊 验证清单

### 用户可见内容
- [ ] 网站标题显示 "渥帮 JUSTWEDO"
- [ ] 导航栏logo显示正确
- [ ] Footer显示正确品牌信息
- [ ] 关于页面内容正确
- [ ] SMS消息显示 "Your JUSTWEDO purchase..."

### 技术层面
- [ ] package.json名称正确
- [ ] Git提交历史清晰
- [ ] 构建无错误
- [ ] 日志标记统一为[JWD]
- [ ] 无JUSTWEDO残留

### 文档
- [ ] README.md已更新
- [ ] docs/*.md已更新
- [ ] 部署文档已更新
- [ ] API文档已更新

---

## 📝 注意事项

1. **保留中文名**：「渥帮」保持不变，这是本地化锚点
2. **统一日志**：使用`[JWD]`作为日志标记，简洁专业
3. **域名过渡**：考虑保留旧域名重定向（如果已有SEO）
4. **用户沟通**：由于未上市，无需向用户解释更名
5. **品牌一致性**：确保所有触点使用统一的品牌名称

---

## ✅ 完成标志

- [ ] 所有手动检查项已完成
- [ ] 构建和测试通过
- [ ] Git提交已完成
- [ ] Logo文件已准备
- [ ] 可以开始部署

---

**更名执行日期**: ___________________

**执行人**: ___________________

**验证人**: ___________________

---

🎉 **恭喜！品牌更名至 JUSTWEDO 完成！**
