# MASTER UI BLUEPRINT

> **唯一视觉规范** — 全项目所有页面、动画、资源、颜色的唯一权威来源。
>
> 与本文档冲突的任何其他 UI 文档，均以本文档为准。

---

## Chapter 1：品牌定位

### 关键词

```
宇宙 · 治愈 · 陪伴 · 神秘 · 宁静 · 未来 · 电影感
```

### 不是

```
❌ 科技    ❌ 赛博    ❌ 游戏    ❌ 二次元
```

### 产品感受

> 一个人夜晚打开。静静看自己的宇宙。

---

## Chapter 2：视觉关键词

### 必须围绕

| 关键词 | 视觉表现 |
|--------|---------|
| **Space** | 深空渐变、星空覆盖、无边界感 |
| **Depth** | 多层背景、模糊景深、光影叠加 |
| **Glow** | 蓝紫辉光、柔光边缘、非硬阴影 |
| **Glass** | 半透明、模糊背板、细边框、内高光 |
| **Floating** | 元素漂浮、缓慢移动、非静态 |
| **Soft** | 圆角、低对比、柔和过渡 |
| **Silence** | 无弹窗、无红点、无闪烁广告 |

### 禁止

```
❌ 厚重      ❌ 高饱和    ❌ 复杂
❌ 杂乱      ❌ 廉价渐变  ❌ 硬阴影
```

---

## Chapter 3：页面共同结构

### 强制模板

```
┌─ Background  ─────────────────────────────┐
│  Layer 1: Gradient                         │
│  Layer 2: Nebula (L+R)                     │
│  Layer 3: Galaxy (中心暗纹)                 │
│  Layer 4: Stars (80+)                      │
│  Layer 5: Meteor (双轨)                     │
│  Layer 6: Glow (中心光晕)                   │
├─ Main Content  ───────────────────────────┤
│  Hero Section                              │
│  (星球 / 图标 / 标题)                       │
├─ Glass Card  ─────────────────────────────┤
│  正文 / 列表 / 信息                         │
├─ Button  ─────────────────────────────────┤
│  Primary / Secondary                       │
├─ Bottom Safe Area  ───────────────────────┤
│  60rpx padding                             │
└────────────────────────────────────────────┘
```

**所有页面必须遵守此结构。禁止各页面自由发挥。**

---

## Chapter 4：背景系统

### 六层强制结构

| Layer | 名称 | 实现 | 动画 |
|:---:|------|------|------|
| 1 | **Gradient** | `radial-gradient(ellipse at 50% 30%, #0E1648 0%, #090F35 40%, #03081A 100%)` | 无 |
| 2 | **Nebula** | 左:`rgba(100,80,200,0.10)` radial 右:`rgba(60,100,180,0.08)` radial | 漂移 20-25s |
| 3 | **Galaxy** | 中心 `rgba(100,120,220,0.12)` radial 光晕 | 呼吸 6s |
| 4 | **Stars** | 65-85 独立 `<view>` 元素 | 闪烁 2-6s |
| 5 | **Stardust** | 12-20 极小亮点 | 漂浮 8-16s |
| 6 | **Meteor** | 双轨渐变线条 | 18s + 12s |

**所有页面统一使用此六层结构。不同页面仅调整 Nebula 颜色和 Galaxy 位置。**

---

## Chapter 5：Glass Design

### 统一 Glass Token

```
.glass-card {
  background:     rgba(255,255,255,0.035)
  border:         1rpx solid rgba(255,255,255,0.07)
  border-radius:  24rpx
  backdrop-filter: blur(24rpx)
  box-shadow:
    0 8rpx 32rpx rgba(0,0,0,0.25),
    inset 0 1rpx 0 rgba(255,255,255,0.04)
  padding:        32rpx (default) | 24rpx (compact) | 20rpx (mini)
}
```

### 禁止

```
❌ 不同页面不同圆角
❌ 不同页面不同透明度
❌ 卡片无边框
❌ 纯黑阴影（必须带蓝紫底调）
```

---

## Chapter 6：Glow System

### Glow Token 表

| Token | 大小 | 颜色 | Opacity | 用途 |
|------|:---:|------|:---:|------|
| `Glow-XS` | 24rpx | `rgba(100,80,220)` | 0.10 | 危险按钮 |
| `Glow-S` | 60rpx | `rgba(120,90,240)` | 0.15 | 按钮外发光 |
| `Glow-M` | 80rpx | `rgba(80,140,240)` | 0.35 | 星球近光 |
| `Glow-L` | 180rpx | `rgba(60,100,200)` | 0.15 | 星球远光 |
| `Glow-XL` | 500rpx | `rgba(100,120,220)` | 0.12→0 | 页面中心光晕 |

**全项目统一使用此 Token。禁止自定义 glow 值。**

---

## Chapter 7：Animation System

### 动画 Token 表

| Token | 目标 | 属性 | 周期 | 缓动 |
|------|------|------|:---:|------|
| `anim-star` | 星点 | opacity + scale | 2-6s | ease-in-out alternate |
| `anim-dust` | 星尘 | translate + opacity | 8-16s | ease-in-out infinite |
| `anim-glow` | 光晕 | scale + opacity | 6s | ease-in-out alternate |
| `anim-planet` | 星球 | translateY + rotate | 8s | ease-in-out infinite |
| `anim-ring` | 光环 | scale + opacity | 5s | ease-in-out alternate |
| `anim-nebula` | 星云 | translate | 20-25s | ease-in-out alternate |
| `anim-meteor-slow` | 流星慢 | translate + opacity | 18s (3%) | ease-in |
| `anim-meteor-fast` | 流星快 | translate + opacity | 12s (4%) | ease-in |
| `anim-btn-press` | 按钮按下 | scale + shadow | 0.12s | ease |
| `anim-card-in` | 卡片进入 | opacity + translateY | 0.4s | ease-out |

**全项目统一使用此 Token。禁止自定义动画参数。**

---

## Chapter 8：Assets Library

### 目录结构

```
assets/
├── background/     ← 星空背景纹理（PNG/WebP, 750×1624）
├── planet/         ← 十二星座主题星球（PNG/SVG, 200×200）
├── ship/           ← 蓝白飞船剪影（PNG/SVG, 60-90px）
├── meteor/         ← 流星拖尾素材（PNG, 100-150px）
├── stars/          ← 星点纹理（PNG, 2-6px）
├── nebula/         ← 星云素材（PNG/WebP, 500×500）
├── icon/           ← 图标（SVG, 白色/半透白）
├── logo/           ← Logo 素材（SVG/PNG）
└── constellation/  ← 十二星座星图连线（SVG）
```

### 资源使用规则

```
1. 所有资源必须先放入 assets/ 对应目录
2. 禁止在 WXML 中直接使用外部 URL
3. 禁止使用来源不明的素材
4. 优先 SVG → WebP → PNG
```

---

## Chapter 9：页面规范

### 9.1 首页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 双星云（紫+蓝） |
| Hero | CSS 蓝色星球 (200rpx) + 光环 (260rpx) + 中心光晕 |
| Glass Card | 标题"星座联盟" + 英文副标题 + 欢迎文案 + 按钮 |
| Button | `btn-primary` — 新用户"开始我的宇宙" / 老用户"继续探索" |
| Bottom | 三入口：📖 宇宙日志 · ℹ️ 关于 · ⚙️ 设置 |

### 9.2 生日页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 左星云（紫） |
| Hero | Glass Card 居中 |
| Content | 标题 + 说明 + Picker（glass 风格） |
| Button | `btn-primary` — "继续"（未选时 disabled） |

### 9.3 星座页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 中心大光晕（Glow-XL 加强） |
| Loading | "正在解析你的星空……" 1s |
| Hero | 160rpx Unicode 星座符号 + Glow-L 辉光 |
| Content | 星座中文名称 |
| Button | `btn-primary` — "进入我的星球" |

### 9.4 星球页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 右星云（绿调） |
| Hero | CSS 蓝色小星球 (160rpx) + 光环 + layers |
| Identity | Glass Card — 星座图标 + 名称 + 年龄 + 阶段 + 进度条 |
| Card Row | 三张 mini glass cards — 成长 / 今日 / 世界 |
| Button | `btn-primary` "出发探索" + `btn-secondary` "宇宙日志" |

### 9.5 探索页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 双星云（紫+蓝强） |
| Label | "🚀 出发探索" |
| Hero | 130rpx 事件图标 + Glow-M 辉光 |
| Content | 事件标题 + 描述 |
| Button | `btn-secondary` — "返回我的星球" |

### 9.6 Timeline 页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 左星云（暖金） |
| Header | 标题"宇宙日志" |
| List | 玻璃卡片时间轴：竖线 + 发光节点 + 日期 + 事件卡片 |
| Empty | 📖 图标 + 引导文案 |

### 9.7 设置页

| 区域 | 内容 |
|------|------|
| Background | 六层标准背景 + 右星云（紫） |
| Header | 标题"⚙️ 设置" |
| Content | 单张 glass-card — 版本 / 重新开始 / 关于 / 返回首页 |
| Danger | "重新开始宇宙" 红色文字 + Glow-XS |

---

## Chapter 10：UI 完成标准

### 页面验收标准

每个页面完成时必须满足：

```
1. 第一眼：就是同一个产品
2. 六层背景结构完整
3. Glass Card 参数与规范一致
4. Glow 使用 Token（非自定义值）
5. 动画使用 Token（非自定义参数）
6. 按钮类型正确（primary/secondary/danger/disabled）
7. 字体层级正确（hero/title/subtitle/body/label）
8. 间距符合 Token 表
9. 底部安全区 ≥ 60rpx
```

### 禁止

```
❌ 首页像 A，设置像 B，Timeline 像 C
❌ 每个页面各写各的样式
❌ 同类元素不同参数
❌ 只在单个页面修改样式而不更新全局 Token
```

---

## Design Rule-001

> **任何 UI 实现，都必须以效果图视觉一致性为第一优先级。**
>
> 开发时，如果现有样式、旧规范或历史实现与效果图冲突，**以效果图为准**；
> 允许重构样式和页面结构，但不得破坏业务逻辑。

---

## 附录 A：色彩速查

| Token | 色值 |
|------|------|
| `bg-deep` | `#03081A` |
| `bg-mid` | `#090F35` |
| `bg-upper` | `#0E1648` |
| `primary-start` | `#5B6EF5` |
| `primary-mid` | `#7C5CF0` |
| `primary-end` | `#A855F7` |
| `glass-bg` | `rgba(255,255,255,0.035)` |
| `glass-border` | `rgba(255,255,255,0.07)` |
| `text-hero` | `#ffffff` |
| `text-body` | `rgba(255,255,255,0.45)` |
| `text-label` | `rgba(255,255,255,0.3)` |
| `danger` | `#E56060` |

## 附录 B：按钮速查

| 类型 | Class | Width | Height | Radius |
|------|-------|:---:|:---:|:---:|
| Primary | `.btn-primary` | 560rpx | 100rpx | 50rpx |
| Secondary | `.btn-secondary` | 560rpx | 100rpx | 50rpx |
| Danger | `.btn-danger` | 560rpx | 100rpx | 50rpx |
| Disabled | `.btn-disabled` | 560rpx | 100rpx | 50rpx |

## 附录 C：间距速查

| Token | 值 |
|------|:---:|
| `xs` | 8rpx |
| `sm` | 12rpx |
| `md` | 16rpx |
| `lg` | 24rpx |
| `xl` | 32rpx |
| `2xl` | 40rpx |
| `3xl` | 48rpx |
| Page H | 40rpx |
| Safe Bottom | 60rpx |
