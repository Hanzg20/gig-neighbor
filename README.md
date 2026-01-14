# 渥帮 JUSTWEDO

## 📋 项目简介

**JUSTWEDO (JWD)** - 渥太华华人互助平台

*Get Things Done Together* - 一个连接本地服务提供者和消费者的社区互助平台。

**核心功能：**
- 🏪 服务提供商入驻和管理
- 📦 库存管理和智能分配
- 📱 扫码快速购买 (GigBridge)
- 💳 Stripe 支付集成
- 📲 SMS 通知系统
- 🏷️ QR码打印和品牌化

---

## 🚀 快速开始

### 环境要求

- Node.js 18+ & npm
- Supabase 账号
- Stripe 账号（用于支付）
- AWS SNS（用于短信通知）

### 本地开发

```bash
# 1. 克隆仓库
git clone <YOUR_GIT_URL>
cd gig-neighbor

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase URL 和 Key

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:8080

---

## 📚 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **状态管理**: Zustand + TanStack Query
- **后端**: Supabase (PostgreSQL + Edge Functions)
- **支付**: Stripe Checkout + Webhooks
- **通知**: AWS SNS (SMS)
- **QR码**: qrcode.react + 品牌Logo支持

---

## 📖 文档

- [GigBridge 部署指南](GIGBRIDGE_DEPLOYMENT.md)
- [QR码Logo使用指南](docs/QR_CODE_LOGO_GUIDE.md)
- [品牌更名检查清单](REBRAND_CHECKLIST.md)
- [快速开始指南](docs/QUICK_START.md)

---

## 🏗️ 项目结构

```
gig-neighbor/
├── src/
│   ├── components/       # React 组件
│   ├── pages/           # 页面组件
│   ├── stores/          # Zustand 状态管理
│   ├── lib/             # 工具函数
│   └── integrations/    # Supabase 集成
├── supabase/
│   └── functions/       # Edge Functions
├── docs/                # 项目文档
└── public/              # 静态资源
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License

---

**JUSTWEDO Team** - *Get Things Done Together*
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
