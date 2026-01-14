# 二维码中心Logo使用指南 | QR Code Logo Integration Guide

## 📋 功能概述 | Overview

GigBridge系统现在支持在二维码中心添加品牌logo，增强品牌识别度的同时保持扫码功能完整性。

**关键技术：**
- ✅ QR码H级纠错（最高30%容错率）
- ✅ 自动挖空logo下方区域（`excavate: true`）
- ✅ 智能尺寸计算（默认18%占比）
- ✅ 支持PNG/SVG/JPG格式

---

## 🎨 视觉效果 | Visual Effect

```
┌─────────────────────┐
│  ████  ████  ████   │
│  █ █ █ █ ██  █ █ █  │
│  █ █ █ █ ██  █ █ █  │
│  ████  ████  ████   │
│  █ █ █  [LOGO]  ██  │  ← Logo在中心
│  ████  ████  ████   │
│  █ █ █ █ ██  █ █ █  │
│  ████  ████  ████   │
└─────────────────────┘
```

---

## 🚀 快速开始 | Quick Start

### 1. 准备Logo图片

**推荐规格：**
- 格式：PNG（带透明背景）或 SVG
- 尺寸：128x128px 或 256x256px（方形）
- 文件大小：< 50KB
- 位置：`public/qr-logo.png` ⚠️ **QR码专用logo，与网站logo分开**

**设计建议：**
- ✅ 使用简洁的图标（避免复杂细节）
- ✅ 高对比度（深色logo + 白色背景，或反之）
- ✅ 方形或圆形设计
- ❌ 避免细线条（可能影响识别）
- ❌ 避免透明度过高

### 2. 使用QrCodeGenerator组件

```tsx
import { QrCodeGenerator } from '@/components/inventory/QrCodeGenerator';

// 基础使用 - 带默认QR专用logo
<QrCodeGenerator
    value="https://example.com/scan/abc123"
    size={200}
    logoUrl="/qr-logo.png"
/>

// 自定义logo尺寸
<QrCodeGenerator
    value="https://example.com/scan/abc123"
    size={200}
    logoUrl="/custom-logo.png"
    logoSize={20}  // Logo占QR码的20%
    level="H"      // 最高纠错级别
/>

// 无logo版本
<QrCodeGenerator
    value="https://example.com/scan/abc123"
    size={200}
    // 不传logoUrl即可
/>
```

### 3. 打印模板中使用

```tsx
import { PrintableQrTemplate } from '@/components/inventory/PrintableQrTemplate';

const printData = [
    {
        serialNumber: "Standard Card - $50.00",
        productName: "Eagleson Coin Wash",
        url: "https://example.com/scan/abc123"
    }
];

// 使用默认logo
<PrintableQrTemplate
    data={printData}
    showLogo={true}  // 显示logo
/>

// 使用自定义logo
<PrintableQrTemplate
    data={printData}
    showLogo={true}
    logoUrl="/provider-custom-logo.png"
/>

// 不显示logo
<PrintableQrTemplate
    data={printData}
    showLogo={false}
/>
```

---

## 🔧 API 参数 | API Reference

### QrCodeGenerator Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | **必填** | QR码内容（URL等） |
| `size` | `number` | `128` | QR码尺寸（像素） |
| `level` | `'L' \| 'M' \| 'Q' \| 'H'` | `'H'` | 纠错级别（L=7%, M=15%, Q=25%, H=30%） |
| `logoUrl` | `string` | `undefined` | Logo图片URL |
| `logoSize` | `number` | `20` | Logo占QR码的百分比（推荐15-25%） |
| `logoOpacity` | `number` | `1` | Logo透明度（0-1） |
| `logoPadding` | `number` | `4` | Logo周围白色内边距（像素） |
| `fgColor` | `string` | `"#000000"` | QR码前景色 |
| `bgColor` | `string` | `"#FFFFFF"` | QR码背景色 |

### PrintableQrTemplate Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `PrintableQrData[]` | **必填** | 打印数据数组 |
| `showLogo` | `boolean` | `true` | 是否显示logo |
| `logoUrl` | `string` | `'/qr-logo.png'` | QR专用logo图片路径 |

---

## 📏 尺寸建议 | Size Recommendations

### Logo占比与纠错级别对照表

| Logo占比 | 推荐纠错级别 | 扫描稳定性 | 适用场景 |
|----------|--------------|------------|----------|
| 10-15% | M | ⭐⭐⭐⭐⭐ | 户外/远距离扫码 |
| **15-20%** | **H** | **⭐⭐⭐⭐** | **推荐（默认配置）** |
| 20-25% | H | ⭐⭐⭐ | 室内/近距离扫码 |
| 25-30% | H | ⭐⭐ | 仅限高质量打印 |
| > 30% | ❌ | ❌ | 不推荐（可能无法扫描） |

**当前配置：**
- PrintableQrTemplate: **18%** @ 200px = 36px logo
- 纠错级别: **H (30%)**
- 打印尺寸: 40mm x 40mm（A4纸3x5网格）

---

## 🧪 测试清单 | Testing Checklist

### 打印测试
- [ ] 使用真实打印机打印QR码
- [ ] 测试不同打印质量（标准/高质量）
- [ ] 测试不同纸张（普通纸/标签纸）

### 扫描测试
- [ ] iOS 相机原生扫描
- [ ] Android 相机原生扫描
- [ ] 微信扫一扫
- [ ] 支付宝扫一扫
- [ ] 不同距离扫描（10cm / 30cm / 50cm）
- [ ] 不同角度扫描（正面 / 斜45° / 侧面）
- [ ] 低光环境扫描
- [ ] 污损/折叠后扫描

### 调试技巧
```tsx
// 如果扫描失败，尝试调整这些参数：

// 1. 减小logo尺寸
<QrCodeGenerator logoSize={15} />  // 从20%降到15%

// 2. 提高纠错级别（如果还不是H）
<QrCodeGenerator level="H" />

// 3. 增加QR码整体尺寸
<QrCodeGenerator size={256} />  // 从200增加到256

// 4. 临时移除logo进行对照测试
<QrCodeGenerator logoUrl={undefined} />
```

---

## 🎨 品牌定制示例 | Brand Customization Examples

### 示例1: 渥帮QR专用Logo（默认）
```tsx
<QrCodeGenerator
    value={url}
    size={200}
    logoUrl="/qr-logo.png"  // QR码专用logo
    logoSize={18}
    level="H"
/>
```

### 示例2: Provider自定义Logo
```tsx
// 商家可以上传自己的logo
<QrCodeGenerator
    value={url}
    size={200}
    logoUrl={`/uploads/${providerId}/logo.png`}
    logoSize={20}
    level="H"
/>
```

### 示例3: 深色模式QR码
```tsx
<QrCodeGenerator
    value={url}
    size={200}
    logoUrl="/qr-logo-white.png"  // QR专用白色logo
    fgColor="#FFFFFF"             // 白色QR码
    bgColor="#000000"             // 黑色背景
    level="H"
/>
```

### 示例4: 圆形Logo + 自定义颜色
```tsx
<QrCodeGenerator
    value={url}
    size={200}
    logoUrl="/qr-logo-round.png"  // QR专用圆形logo
    logoSize={22}
    fgColor="#4F46E5"  // 品牌紫色
    bgColor="#F5F3FF"  // 浅紫背景
    level="H"
/>
```

---

## 🔍 技术原理 | Technical Details

### QR码纠错机制
QR码使用Reed-Solomon纠错算法，允许一定比例的数据损坏仍能正确解码：

- **L级**: 7% 损坏容忍
- **M级**: 15% 损坏容忍
- **Q级**: 25% 损坏容忍
- **H级**: 30% 损坏容忍

当logo占据中心18%面积时，配合H级纠错，仍有12%的额外容错空间。

### excavate 参数说明
`excavate: true` 会完全移除logo下方的QR码像素，而不是简单叠加。这样做的好处：
- ✅ 避免logo透明度导致的识别干扰
- ✅ 提高扫描成功率
- ✅ 支持彩色logo

---

## 🚨 常见问题 | FAQ

### Q: Logo太大导致无法扫描？
**A:** 减小`logoSize`参数到15%，或提高`level`到'H'。

### Q: Logo显示模糊？
**A:** 确保logo原图分辨率足够（至少128x128px），并使用PNG格式。

### Q: 打印后logo丢失？
**A:** 检查打印机彩色设置，确保logo图片URL可访问。

### Q: 不同Provider能用不同logo吗？
**A:** 可以！通过`logoUrl`参数传入不同的logo路径：
```tsx
logoUrl={`/providers/${providerId}/logo.png`}
```

### Q: 能否使用Emoji作为logo？
**A:** 不推荐。Emoji在不同设备上渲染不一致，建议使用标准图片格式。

---

## 📊 性能优化 | Performance

### Logo图片优化建议
```bash
# 使用ImageOptim或TinyPNG压缩
Input:  qr-logo.png (150KB)
Output: qr-logo.png (25KB)  ← 压缩率83%

# 转换为WebP格式（更小）
convert qr-logo.png -quality 90 qr-logo.webp
```

### 批量打印优化
```tsx
// 为所有QR码使用相同logo（避免重复加载）
const commonLogo = '/qr-logo.png';  // QR专用logo

data.map(item => (
    <QrCodeGenerator logoUrl={commonLogo} />
))
```

---

## 📝 更新日志 | Changelog

**v0.0.3 (2026-01-13)**
- ✅ 新增QR码中心logo支持
- ✅ 默认使用18% logo占比 + H级纠错
- ✅ PrintableQrTemplate集成logo功能
- ✅ 支持自定义logo URL和尺寸

---

## 🔗 相关资源 | Resources

- [QR Code Error Correction](https://www.qrcode.com/en/about/error_correction.html)
- [qrcode.react Documentation](https://github.com/zpao/qrcode.react)
- [Logo Design Best Practices](https://www.canva.com/learn/logo-design-tips/)

---

**最后更新**: 2026-01-13
**版本**: v0.0.3
**作者**: GigNeighbor Development Team
