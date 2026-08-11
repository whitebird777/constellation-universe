# Universe Design System V2

> 版本：V2 ｜ 适用范围：StarUniverse 全项目 ｜ 原则：深空 · 宁静 · 治愈 · 电影感

---

## 1. 品牌视觉定位

| 维度 | 定义 |
|------|------|
| 基调 | 深空宇宙 — 不是游戏，是一片安静的星空 |
| 情绪 | 宁静、治愈、陪伴、无压力 |
| 质感 | 电影感 — 不是扁平，不是卡通，是有深度的宇宙 |
| 色彩 | 深蓝基底 + 蓝紫辉光 + 白色星光 |
| 字体 | 优雅、轻盈、留白充足 |
| 动画 | 缓慢、自然、不吸引注意力 |

---

## 2. 色板（Color Palette）

### 2.1 背景层（Background）

| Token | 色值 | 用途 |
|------|------|------|
| `--bg-deep` | `#03081A` | 最底层深空 |
| `--bg-mid` | `#090F35` | 渐变中段 |
| `--bg-upper` | `#0E1648` | 渐变顶部（径向中心） |

### 2.2 主色（Primary）

| Token | 色值 | 用途 |
|------|------|------|
| `--primary` | `#5B6EF5` | 主按钮起点 |
| `--primary-mid` | `#7C5CF0` | 渐变中段 |
| `--primary-end` | `#A855F7` | 渐变终点 |

### 2.3 强调色（Accent）

| Token | 色值 | 用途 |
|------|------|------|
| `--accent-blue` | `rgba(100,140,240,...)` | 星球辉光 |
| `--accent-purple` | `rgba(140,100,220,...)` | 星云 |
| `--accent-gold` | `rgba(180,160,100,...)` | Timeline 暖色 |

### 2.4 发光（Glow）

| Token | 透明度 | 用途 |
|------|------|------|
| `--glow-strong` | `0.35` | 按钮阴影 |
| `--glow-medium` | `0.15` | 星球外层 |
| `--glow-light` | `0.08` | 卡片光晕 |
| `--glow-subtle` | `0.04` | 卡片内高光 |

### 2.5 玻璃卡片（Glass）

| Token | 色值 | 用途 |
|------|------|------|
| `--glass-bg` | `rgba(255,255,255,0.035)` | 卡片背景 |
| `--glass-border` | `rgba(255,255,255,0.07)` | 卡片边框 |
| `--glass-highlight` | `rgba(255,255,255,0.04)` | 内高光 |

### 2.6 文字（Text）

| Token | 色值 | 用途 |
|------|------|------|
| `--text-primary` | `rgba(255,255,255,1)` | 主标题 |
| `--text-secondary` | `rgba(255,255,255,0.55)` | 副标题 |
| `--text-body` | `rgba(255,255,255,0.45)` | 正文 |
| `--text-label` | `rgba(255,255,255,0.3)` | 标签/辅助 |
| `--text-disabled` | `rgba(255,255,255,0.18)` | 禁用 |

---

## 3. 字体层级（Typography）

| 层级 | Class | Size | Weight | Line | Letter | 用途 |
|------|-------|------|--------|------|--------|------|
| H1 | `.text-hero` | 56rpx | 700 | 1.3 | 6rpx | 页面主标题 |
| H2 | `.text-title` | 44rpx | 600 | 1.4 | 4rpx | 二级标题 |
| Sub | `.text-subtitle` | 28rpx | 400 | 1.5 | 2rpx | 英文副标题 |
| Body | `.text-body` | 26rpx | 400 | 1.8 | 0 | 正文描述 |
| Caption | `.text-label` | 20rpx | 400 | 1.5 | 3rpx | 标签 |
| Button | — | 30rpx | 600 | — | — | 主按钮 |
| Button S | — | 28rpx | 500 | — | — | 次按钮 |

---

## 4. 间距规范（Spacing）

| Token | 值 | 用途 |
|------|:---:|------|
| `sp-xs` | 8rpx | 紧贴元素间 |
| `sp-sm` | 12rpx | 相关元素间 |
| `sp-md` | 16rpx | 卡片内部间距 |
| `sp-lg` | 24rpx | 区块间距 |
| `sp-xl` | 32rpx | 卡片间距 |
| `sp-2xl` | 40rpx | 大区块间距 |
| `sp-3xl` | 48rpx | Hero 与内容间距 |

### 页面边距

| Token | 值 |
|------|:---:|
| 水平 padding | 40rpx |
| 底部安全区 | 60rpx |

---

## 5. 圆角规范（Border Radius）

| Token | 值 | 用途 |
|------|:---:|------|
| `radius-sm` | 12rpx | 小标签/徽章 |
| `radius-md` | 16rpx | 反馈卡片 |
| `radius-lg` | 20rpx | Picker 输入框 |
| `radius-xl` | 24rpx | 玻璃卡片 |
| `radius-full` | 50rpx | 按钮（胶囊） |
| `radius-circle` | 50% | 星球/光环/头像 |

---

## 6. 阴影规范（Shadow）

### 卡片阴影

```
box-shadow:
  0 8rpx 32rpx rgba(0,0,0,0.25),       ← 外层深阴影
  inset 0 1rpx 0 rgba(255,255,255,0.04)  ← 内高光
```

### 按钮阴影

```
box-shadow:
  0 8rpx 32rpx rgba(100,70,220,0.4),    ← 彩色阴影
  0 0 60rpx rgba(120,90,240,0.15)       ← 外发光
```

### 星球阴影

```
box-shadow:
  0 0 80rpx rgba(80,140,240,0.35),      ← 近距辉光
  0 0 180rpx rgba(60,100,200,0.15),     ← 远距辉光
  inset -20rpx -10rpx 40rpx rgba(0,0,0,0.5)  ← 暗面
```

---

## 7. 发光规范（Glow）

| Token | 大小 | 颜色 | 透明度 |
|------|:---:|------|:---:|
| 按钮发光 | 60rpx | `rgba(120,90,240,...)` | 0.15 |
| 星球近光 | 80rpx | `rgba(80,140,240,...)` | 0.35 |
| 星球远光 | 180rpx | `rgba(60,100,200,...)` | 0.15 |
| 中心光晕 | 500rpx | `rgba(100,120,220,...)` | 0.12→0 |
| 星座符号 | 100rpx | `rgba(160,180,255,...)` | 0.5 |

---

## 8. Glass Card 规范

```
background: rgba(255,255,255,0.035)
border: 1rpx solid rgba(255,255,255,0.07)
border-radius: 24rpx
backdrop-filter: blur(24rpx)
box-shadow: 外层阴影 + 内高光
padding: 32rpx (默认) / 24rpx (紧凑) / 20rpx (迷你)
```

---

## 9. Button 规范

| 类型 | Class | 背景 | 边框 | 发光 | 按下 |
|------|-------|------|------|------|------|
| Primary | `.btn-primary` | 蓝紫渐变 | 无 | 彩色+外发光 | scale(0.95) |
| Secondary | `.btn-secondary` | 半透白 | 半透白 | 无 | 亮 0.02 |
| Disabled | `.btn-disabled` | 极透 | 极透 | 无 | 无 |
| Danger | `.btn-danger` | 透明 | 红色 | 红色弱光 | 亮 0.08 |

### 尺寸

| 属性 | 值 |
|------|:---:|
| 宽度 | 560rpx |
| 高度 | 100rpx |
| 圆角 | 50rpx（胶囊） |

---

## 10. 动画规范（Motion System）

### 10.1 动画原则

- 缓慢：所有动画 ≥ 2 秒周期
- 自然：ease-in-out / alternate
- 不打扰：pointer-events: none
- 不依赖 JS：CSS Animation 优先

### 10.2 动画参数表

| 动画 | 时长 | 缓动 | 循环 |
|------|:---:|------|:---:|
| 星星闪烁 | 2-6s | ease-in-out | alternate infinite |
| 星尘漂浮 | 8-16s | ease-in-out | infinite |
| 中心光晕 | 6s | ease-in-out | alternate infinite |
| 星球漂浮 | 8s | ease-in-out | infinite |
| 光环呼吸 | 5s | ease-in-out | alternate infinite |
| 星云漂移 | 20-25s | ease-in-out | alternate infinite |
| 流星慢 | 18s/3% | ease-in | infinite |
| 流星快 | 12s/4% | ease-in | infinite |
| 按钮按下 | 0.12s | ease | 一次性 |

---

## 11. 页面布局模板

```html
<view class="page-full [page-class]">
  <!-- 1. 氛围层（固定全屏） -->
  <view class="universe-atmosphere">
    <atmo-glow />
    <atmo-nebula-left />
    <atmo-nebula-right />
    <atmo-star * N />
    <atmo-dust * M />
    <atmo-meteor />
    <atmo-meteor-fast />
  </view>

  <!-- 2. Hero 区 -->
  <hero-planet /> or <hero-icon />

  <!-- 3. 内容区（玻璃卡片） -->
  <glass-card> ... </glass-card>

  <!-- 4. 操作区（按钮） -->
  <button-primary /> <button-secondary />
</view>
```

---

## 12. 文件组织

```
miniprogram/
├── app.wxss              ← Design System 全局样式
├── pages/
│   └── [page]/index.wxss ← 页面特有样式（最小化）
├── assets/               ← 图片资源（未来迁移 SVG/PNG）
└── utils/                ← Engine（不动）
```
