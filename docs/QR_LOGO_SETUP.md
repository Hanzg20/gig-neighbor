# QR码Logo快速设置指南

## 📁 文件命名规范

为了区分网站logo和QR码专用logo，我们使用以下命名规范：

```
public/
├── logo.png          ← 网站/应用主logo（用于导航栏、品牌展示等）
├── qr-logo.png       ← QR码专用logo（方形，用于打印）⭐ 主要使用
├── qr-logo-white.png ← 深色背景QR码用（可选）
└── qr-logo-round.png ← 圆形版本（可选）
```

---

## 🚀 快速开始

### 步骤1: 准备QR专用Logo

创建一个简洁的方形logo，保存为 `public/qr-logo.png`

**推荐规格：**
- 📐 尺寸：**128x128px** 或 **256x256px**（必须方形）
- 📄 格式：**PNG**（带透明背景）
- 💾 大小：< 50KB
- 🎨 设计：简洁、高对比度、识别度高

**设计建议：**
```
✅ 好的QR Logo设计：
   - 单色或双色（避免渐变）
   - 清晰的轮廓
   - 无细小文字
   - 透明背景

❌ 避免的设计：
   - 复杂细节
   - 多种颜色
   - 细线条
   - 白色背景
```

### 步骤2: 放置文件

将准备好的logo文件复制到：
```
d:\My Project\ts\hangs\gig-neighbor\public\qr-logo.png
```

### 步骤3: 验证文件

**方法A: 浏览器验证**
```
1. 启动项目: npm run dev
2. 访问: http://localhost:8080/qr-logo.png
3. 应该看到你的logo图片
```

**方法B: 命令行验证**
```bash
# Windows
dir "d:\My Project\ts\hangs\gig-neighbor\public\qr-logo.png"

# 应该显示文件信息
```

### 步骤4: 测试打印

1. 登录 Provider Dashboard
2. 进入 Inventory 页面
3. 点击 "Print QR Code"（单张或批量）
4. 查看打印预览 → Logo应该出现在QR码中心✨

### 步骤5: 扫描测试

打印后用手机扫描测试：
- ✅ iOS 相机
- ✅ Android 相机
- ✅ 微信扫一扫
- ✅ 支付宝扫一扫

---

## 🔧 自定义配置

### 使用不同的Logo文件

```tsx
import { PrintableQrTemplate } from '@/components/inventory/PrintableQrTemplate';

// 使用自定义logo
<PrintableQrTemplate
    data={printData}
    logoUrl="/custom-qr-logo.png"  // 自定义路径
    showLogo={true}
/>

// 不显示logo
<PrintableQrTemplate
    data={printData}
    showLogo={false}  // 纯净QR码
/>
```

### 为不同Provider使用不同Logo

```tsx
// 在 ProviderInventoryDashboard.tsx 中
const providerLogoUrl = `/providers/${providerId}/qr-logo.png`;

<PrintableQrTemplate
    data={itemsToPrint}
    logoUrl={providerLogoUrl}
/>
```

### 调整Logo尺寸

```tsx
import { QrCodeGenerator } from '@/components/inventory/QrCodeGenerator';

<QrCodeGenerator
    value={url}
    logoUrl="/qr-logo.png"
    logoSize={20}  // 调整占比（默认18%）
    level="H"      // 保持H级纠错
/>
```

---

## 🎨 Logo设计工具推荐

### 在线设计工具
- [Canva](https://www.canva.com) - 简单易用
- [Figma](https://www.figma.com) - 专业设计
- [LogoMakr](https://logomakr.com) - Logo专用

### 图片处理
- [TinyPNG](https://tinypng.com) - 压缩PNG
- [Remove.bg](https://www.remove.bg) - 去除背景
- [Squoosh](https://squoosh.app) - 在线压缩

### Logo示例参考
```
渥帮JUSTWEDO可以使用：
- 简化的"渥"字标
- "GN"字母组合
- 帮手图标（握手/人形）
- 邻里社区符号
```

---

## 📊 当前默认配置

| 配置项 | 值 | 说明 |
|--------|----|----|
| **默认Logo路径** | `/qr-logo.png` | QR码专用 |
| **Logo占比** | 18% | 平衡美观与扫描 |
| **纠错级别** | H (30%) | 最高容错 |
| **QR码尺寸** | 200px | 打印40mm |
| **excavate** | `true` | 挖空提高识别 |

---

## ❓ 常见问题

### Q1: 已有logo.png，还需要qr-logo.png吗？

**A:** 是的，建议分开：
- `logo.png` - 用于网站导航栏、品牌展示（可以是横向logo）
- `qr-logo.png` - 用于QR码中心（必须方形，简化设计）

### Q2: 可以直接用logo.png吗？

**A:** 可以临时使用：
```tsx
<PrintableQrTemplate logoUrl="/logo.png" />
```
但建议创建专用的方形版本以获得最佳效果。

### Q3: Logo太大导致扫描失败怎么办？

**A:** 减小logoSize参数：
```tsx
logoSize={15}  // 从18%降到15%
```

### Q4: 如何制作白色logo（深色QR码用）？

**A:**
1. 在设计工具中将logo改为白色
2. 保存为 `qr-logo-white.png`
3. 使用时指定：
```tsx
<QrCodeGenerator
    logoUrl="/qr-logo-white.png"
    fgColor="#FFFFFF"
    bgColor="#000000"
/>
```

### Q5: 多个Provider如何管理各自的logo？

**A:** 创建Provider专用目录：
```
public/
└── providers/
    ├── provider-abc123/
    │   └── qr-logo.png
    └── provider-def456/
        └── qr-logo.png
```

---

## 🎯 最佳实践

1. **先测试扫描** - 打印前用演示组件测试
2. **保持简洁** - Logo越简单，扫描越稳定
3. **使用透明背景** - PNG格式，透明背景
4. **控制尺寸** - 15-20%最佳，不超过25%
5. **H级纠错** - 带logo必须用H级纠错
6. **真机测试** - 打印后必须用多款手机测试

---

## 📞 需要帮助？

- 📖 完整文档：[QR_CODE_LOGO_GUIDE.md](QR_CODE_LOGO_GUIDE.md)
- 🎨 交互演示：导入 `QrLogoDemo` 组件
- 🚀 部署指南：[GIGBRIDGE_DEPLOYMENT.md](../GIGBRIDGE_DEPLOYMENT.md)

---

**最后更新**: 2026-01-13
**版本**: v0.0.3
