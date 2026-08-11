# UI Implementation Blueprint

> **定位**：UI_MASTER_BLUEPRINT 的下游实施文档。所有 UI 开发以本文档为唯一施工标准。
>
> **原则**：任何旧样式、旧规范、历史 CSS 如果与本文档冲突，**一律以本文档为准**。禁止自行设计，禁止自行发挥。

---

## Chapter 1：全局图层结构

所有页面共享以下 10 层。每层独立 `<view>`，通过 `z-index` 控制。

| Layer | 名称 | z-index | 作用 | 尺寸 | 透明度 | 动画 | 素材来源 |
|:---:|------|:---:|------|------|:---:|------|------|
| 01 | Space Background | `0` | 深空渐变基底 | `100vw × 100vh` | — | 无 | CSS `radial-gradient` |
| 02 | Nebula Left | `1` | 左侧星云雾 | `80%w × 60%h` | 0.10 | 漂移 22s | CSS `radial-gradient` → 未来 `assets/nebula/nebula_left.webp` |
| 03 | Nebula Right | `1` | 右侧星云雾 | `80%w × 60%h` | 0.08 | 漂移 26s | CSS `radial-gradient` → 未来 `assets/nebula/nebula_right.webp` |
| 04 | Galaxy Glow | `2` | 中心光晕 | `600rpx × 600rpx` | 0.10→0 | 呼吸 7s | CSS `radial-gradient` → 未来 `assets/galaxy/galaxy_glow.webp` |
| 05 | Stars | `3` | 星点层 | 全屏 | 0.12~1.0 | 闪烁 2-6s | 85 独立 `<view>` → 未来 `assets/stars/star_small.webp` 等 |
| 06 | Stardust | `3` | 漂浮粒子 | 全屏 | 0~0.55 | 漂浮 8-16s | 20 独立 `<view>` |
| 07 | Meteor | `4` | 流星 | 2rpx×90rpx | 0.85→0 | 18s/14s | CSS `linear-gradient` → 未来 `assets/meteor/meteor.webp` |
| 08 | Ship | `5` | 飞船 | 60-90px | 0~0.25 | 巡航 35s | 未来 `assets/ship/ship_01.webp` |
| 09 | Main Content | `10` | 页面主体 | `100vw × 100vh` | — | — | WXML 内容 |
| 10 | Overlay | `20` | 弹窗/反馈 | 全屏 | — | — | 临时覆盖层 |

### 实现要求

```
1. Layer 01-08 的容器: position:fixed; pointer-events:none;
2. Layer 09 (Main Content): position:relative; z-index:10;
3. 所有背景层禁止使用 JS 生成（CSS Animation 或 Canvas）
4. 未来迁移：CSS 占位 → assets/ 图片资源，仅替换 `<view>` → `<image>`
```

---

## Chapter 2：页面比例（量化）

### 2.1 首页

| 元素 | X 位置 | Y 位置 | 宽度 | 说明 |
|------|:---:|:---:|:---:|------|
| Logo "STAR" | 居中 | 距顶 8% | 70% | `font-size:52rpx; letter-spacing:16rpx` |
| Logo "UNIVERSE" | 居中 | 紧接上行 | 70% | 同上 |
| 副标题 | 居中 | +6rpx | — | `font-size:24rpx` |
| 星球核心 | 居中 | 屏幕中轴 (≈42%) | 180rpx×180rpx | `border-radius:50%` |
| 光环 | 居中 | 同星球 | 240rpx×240rpx | 包围星球 |
| 大气辉光 | 居中 | 同星球 | 210rpx×210rpx | 外扩 15rpx |
| Galaxy 光晕 | 居中 | ≈35% | 600rpx×600rpx | 在星球后方 |
| 欢迎文案 | 居中 | 星球下方 16rpx | 80% | `font-size:26rpx+22rpx` |
| 主按钮 | 居中 | 文案下方 20rpx | 520rpx×100rpx | `border-radius:50rpx` |
| Glass Chips | 居中 | 按钮下方 24rpx | 自适应 | 3 个 chip, `gap:16rpx` |
| 底部安全 | — | 距底 60rpx | — | padding-bottom |

### 2.2 通用间距比例

| 区域 | 上边距 | 下边距 |
|------|:---:|:---:|
| Hero 区 | 40rpx | 32rpx |
| Card 区 | 16rpx | 16rpx |
| Button 区 | 24rpx | 16rpx |
| Bottom | — | 60rpx (安全区) |

---

## Chapter 3：色彩 Token

### 3.1 背景系统

| Token | Hex | HSLA | 用途 |
|------|------|------|------|
| `bg-deepest` | `#03081A` | — | 最暗深空 |
| `bg-mid` | `#090F35` | — | 渐变中段 |
| `bg-upper` | `#0E1648` | — | 渐变顶部（radial 中心） |
| `bg-gradient` | `radial-gradient(ellipse at 50% 35%, #0E1648 0%, #090F35 40%, #03081A 100%)` | — | 页面全局背景 |

### 3.2 主色

| Token | Hex | 用途 |
|------|------|------|
| `primary-start` | `#5B6EF5` | 按钮渐变起点 |
| `primary-mid` | `#7C5CF0` | 按钮渐变中段 |
| `primary-end` | `#A855F7` | 按钮渐变终点 |
| `primary-glow` | `rgba(100,75,220,0.15)` | 按钮外发光 |

### 3.3 星球色

| Token | Hex | 用途 |
|------|------|------|
| `planet-highlight` | `#6B9EF5` | 星球亮面（左上方） |
| `planet-mid` | `#3D6FD5` | 星球中间调 |
| `planet-core` | `#1A4AAA` | 星球暗面 |
| `planet-shadow` | `#0E2D78` | 星球底部 |
| `planet-edge` | `#051840` | 星球边缘（融入背景） |
| `planet-glow-near` | `rgba(75,130,235,0.35)` | 近距辉光 70rpx |
| `planet-glow-far` | `rgba(55,95,195,0.12)` | 远距辉光 160rpx |

### 3.4 Nebula 色

| Token | 左 | 右 |
|------|------|------|
| 颜色 | `rgba(100,75,200,0.10)` | `rgba(55,95,180,0.08)` |
| 形状 | `radial-gradient(ellipse, ... → transparent 65%)` | 同左 |
| 位置 | top:8%, left:-30% | top:35%, right:-28% |

### 3.5 Text 色

| Token | 值 | 用途 |
|------|------|------|
| `text-hero` | `rgba(255,255,255,0.95)` | 主标题 (H1) |
| `text-title` | `rgba(255,255,255,0.85)` | 二级标题 (H2) |
| `text-subtitle` | `rgba(255,255,255,0.55)` | 副标题 |
| `text-body` | `rgba(255,255,255,0.45)` | 正文 |
| `text-label` | `rgba(255,255,255,0.30)` | 标签 |
| `text-disabled` | `rgba(255,255,255,0.18)` | 禁用 |
| `text-danger` | `#E56060` | 危险操作 |

### 3.6 Glass 色

| Token | 值 |
|------|------|
| `glass-bg` | `rgba(255,255,255,0.035)` |
| `glass-border` | `rgba(255,255,255,0.07)` |
| `glass-highlight` | `rgba(255,255,255,0.04)` (inset) |
| `glass-shadow-outer` | `rgba(0,0,0,0.25)` |
| `glass-blur` | `24rpx` |

---

## Chapter 4：Glass Card 规范

### 统一参数

```css
.glass-card {
  background:      rgba(255,255,255,0.035);
  border:          1rpx solid rgba(255,255,255,0.07);
  border-radius:   24rpx;
  backdrop-filter: blur(24rpx);
  -webkit-backdrop-filter: blur(24rpx);
  box-shadow:
    0 8rpx 32rpx rgba(0,0,0,0.25),
    inset 0 1rpx 0 rgba(255,255,255,0.04);
}
```

### 尺寸变体

| 变体 | Padding | 用途 |
|------|:---:|------|
| Default | 32rpx | 大卡片、首页内容卡 |
| Compact | 24rpx | 信息卡片、列表项 |
| Mini | 20rpx | 三连卡片（星球页） |
| Wide | 32rpx 24rpx | 横向卡片（Timeline） |

### 禁止变体

```
❌ 不同页面不同圆角
❌ 不同页面不同 blur 值
❌ 无 border 的卡片
❌ 纯黑阴影（必须配合 glass-shadow-outer）
```

---

## Chapter 5：按钮规范

### 5.1 主按钮 (Primary Glass)

```css
width:             520rpx;
height:            100rpx;
border-radius:     50rpx;
background:        rgba(255,255,255,0.04);
border:            1rpx solid rgba(255,255,255,0.10);
backdrop-filter:   blur(16rpx);
box-shadow:
  0 8rpx 32rpx rgba(0,0,0,0.3),
  0 0 48rpx rgba(100,75,220,0.15),
  inset 0 1rpx 0 rgba(255,255,255,0.05);
text:
  font-size:        30rpx;
  font-weight:      600;
  color:            渐变文字 (-webkit-background-clip: text);
  gradient:         linear-gradient(180deg, #E8E0FF, #C0B0F0);
active:
  transform:        scale(0.98);
  box-shadow:       0 4rpx 16rpx rgba(0,0,0,0.2);
```

### 5.2 次按钮 (Secondary)

```css
width:             520rpx;
height:            100rpx;
border-radius:     50rpx;
background:        rgba(255,255,255,0.05);
border:            1rpx solid rgba(255,255,255,0.06);
text:
  font-size:        28rpx;
  font-weight:      500;
  color:            rgba(255,255,255,0.6);
active:
  background:       rgba(255,255,255,0.08);
```

### 5.3 危险按钮 (Danger)

```css
width:             520rpx;
height:            100rpx;
border-radius:     50rpx;
background:        transparent;
border:            1rpx solid rgba(229,96,96,0.3);
box-shadow:        0 0 24rpx rgba(229,96,96,0.1);
text:
  font-size:        28rpx;
  font-weight:      500;
  color:            #E56060;
```

### 5.4 禁用按钮 (Disabled)

```css
background:        rgba(255,255,255,0.03);
border:            1rpx solid rgba(255,255,255,0.03);
box-shadow:        none;
color:             rgba(255,255,255,0.18);
```

---

## Chapter 6：星球规范

### 6.1 结构

星球必须由 **5 个独立层** 组成，不能是一个 div：

| 层 | Class | 尺寸 | z-index | 动画 |
|:---:|------|:---:|:---:|------|
| Galaxy Glow | `.planet-galaxy` | 600rpx | 后方 | 呼吸 7s, scale 0.9→1.1 |
| Ring | `.planet-ring` | 240rpx | 下方 | 缩放+透明度 5.5s |
| Atmosphere | `.planet-atmo` | 210rpx | 上方 | 透明度呼吸 6s |
| Core | `.planet-core` | 180rpx | 中间 | 浮动+旋转 8s |
| Highlight | `.planet-highlight` | 60rpx | 顶部 | 随 core 移动 |

### 6.2 Core 渐变

```
radial-gradient(circle at 35% 35%,
  #6B9EF5   0%   ← 亮面（模拟恒星光照）
  #3D6FD5  30%   ← 过渡
  #1A4AAA  60%   ← 暗面
  #0E2D78  85%   ← 边缘暗部
  #051840 100%   ← 融入背景
)
```

### 6.3 Core 阴影

```
box-shadow:
  0 0 70rpx rgba(75,130,235,0.35),      ← Planet Glow M
  0 0 160rpx rgba(55,95,195,0.12),       ← Planet Glow L
  inset -18rpx -10rpx 36rpx rgba(0,0,0,0.45)  ← 暗面立体感
```

---

## Chapter 7：星空规范

### 7.1 星点分类

| 类型 | 数量 | 尺寸 (rpx) | 透明度范围 | 闪烁周期 (s) |
|------|:---:|:---:|:---:|:---:|
| 亮星 (Bright) | 15 | 3~4 | 0.4~1.0 | 3~5 |
| 中星 (Medium) | 35 | 2~3 | 0.2~0.7 | 2~4 |
| 暗星 (Dim) | 25 | 1~2 | 0.1~0.4 | 4~6 |
| 远星 (Distant) | 10 | 1 | 0.05~0.2 | 5~7 |
| **合计** | **85** | | | |

### 7.2 CSS 实现

```css
.bg-star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: starPulse var(--dur) ease-in-out infinite alternate;
  animation-delay: var(--delay);
}
@keyframes starPulse {
  0%   { opacity: var(--op-min); transform: scale(0.5); }
  50%  { opacity: var(--op-max); transform: scale(1.2); }
  100%  { opacity: var(--op-min); transform: scale(0.7); }
}
```

### 7.3 未来迁移

```
CSS <view> 星点 → assets/stars/star_bright.webp (PNG, 4-6px)
                 → assets/stars/star_medium.webp (PNG, 2-3px)
                 → assets/stars/star_dim.webp (PNG, 1-2px)
```

---

## Chapter 8：星尘规范

| 属性 | 值 |
|------|------|
| 数量 | 20 |
| 尺寸 | 1rpx |
| 颜色 | `rgba(180,200,240,0.35)` |
| 透明度范围 | 0 → 0.55 → 0 |
| 浮动距离 | 垂直 55rpx, 水平 ±18rpx |
| 周期 | 8-16s（随机） |
| 缓动 | ease-in-out |
| 循环 | infinite |

---

## Chapter 9：流星规范

### 9.1 双流星参数

| 属性 | 慢流星 (A) | 快流星 (B) |
|------|:---:|:---:|
| Class | `.bg-meteor` | `.bg-meteor--fast` |
| 尺寸 | 2rpx × 90rpx | 2rpx × 65rpx |
| 角度 | -38° | -32° |
| 周期 | 20s | 14s |
| 可见占比 | 2.5% (≈0.5s) | 3% (≈0.4s) |
| 起始 X | 72% | 84% |
| 终点 X | 8% | 18% |
| 延迟 | 4s | 10s |
| 颜色（头→尾） | `rgba(180,200,255,0.85)→0` | `rgba(200,215,255,0.8)→0` |

### 9.2 视觉

```
流星 = 渐细线条
  head: 2rpx, opacity 0.85, color 蓝白
  tail: 0rpx, opacity 0
  transition: linear-gradient 180deg
```

---

## Chapter 10：飞船规范（未来实现）

| 属性 | 值 |
|------|------|
| 素材 | `assets/ship/ship_01.webp` (PNG, 蓝白剪影, 60-90px) |
| 大小 | `width:70rpx; height:auto` |
| 出现频率 | 每 35-45s 一次 |
| 飞行方向 | 左 → 右 |
| 速度 | 25s 横跨屏幕 |
| 透明度 | 0 → 0.22 → 0 |
| 尾焰 | 蓝色渐变 trailing glow (CSS after 伪元素) |
| 当前状态 | CSS 占位（`font-size:24rpx`），等待素材替换 |

---

## Chapter 11：页面逐页 Blueprint

### 11.1 首页

| 章节引用 | 参数 |
|------|------|
| 背景 | Layer 01-07（见 Chapter 1） |
| Logo | STAR / UNIVERSE, 52rpx/600, letter-spacing:16rpx |
| 星球 | Chapter 6 五层结构 |
| 文案 | welcomeTitle 26rpx + welcomeText 22rpx |
| 按钮 | Chapter 5.1 Primary Glass |
| 入口 | 3x Glass Chip: padding 14rpx 24rpx, radius 36rpx |

### 11.2 生日页

| 区域 | 参数 |
|------|------|
| 背景 | Layer 01-07, 左星云为主 |
| 导航 | ← 返回 (nav-back) |
| 标题 | H2: "请选择你的生日" |
| Picker | Glass 风格: bg 0.03, border 0.06, radius 20rpx |
| 按钮 | Primary / Disabled 切换 |

### 11.3 星座页

| 区域 | 参数 |
|------|------|
| 背景 | Layer 01-07, 中心光晕加强 (Glow-XL: 600rpx, opacity 0.15) |
| Loading | "正在解析你的星空……" 1s |
| 图标 | 160rpx, text-shadow 100rpx Glow-L |
| 名称 | H1: 48rpx/600 |
| 按钮 | Primary |

### 11.4 星球页

| 区域 | 参数 |
|------|------|
| 背景 | Layer 01-07, 右星云绿调 |
| 星球 | Chapter 6 五层（缩小 160rpx） |
| Identity Card | Glass Compact: 星座+名称+年龄+阶段+进度条 |
| 三连卡片 | Glass Mini ×3: 成长 / 今日 / 世界 |
| 按钮 | Primary + Secondary |

### 11.5 探索页

| 区域 | 参数 |
|------|------|
| 背景 | Layer 01-07, 双星云加强 |
| 事件图标 | 130rpx, text-shadow Glow-M |
| 事件标题 | H2 |
| 描述 | Body 26rpx, max-width:480rpx |
| 按钮 | Secondary |

### 11.6 宇宙日志

| 区域 | 参数 |
|------|------|
| 背景 | Layer 01-07, 左星云暖金 `rgba(180,160,100,0.04)` |
| 标题 | H2: "宇宙日志" |
| 时间轴 | 竖线 1rpx + 发光节点 9rpx (Glow-XS) |
| 事件卡片 | Glass Wide |
| 空状态 | 📖 图标 + 引导文案 |

### 11.7 设置页

| 区域 | 参数 |
|------|------|
| 背景 | Layer 01-07, 右星云紫 |
| 标题 | H2: "⚙️ 设置" |
| 内容 | 单张 Glass Default 卡片，分割线 `rgba(255,255,255,0.04)` |
| 危险项 | "重新开始宇宙" color:#E56060, Glow-XS |

---

## Chapter 12：Asset 清单

### 12.1 背景

| 文件名 | 尺寸 | 格式 | 说明 |
|------|:---:|:---:|------|
| `space_gradient.webp` | 750×1624 | WebP | 深空渐变基底（可选） |
| `nebula_left.webp` | 600×500 | WebP | 紫色星云（左） |
| `nebula_right.webp` | 550×450 | WebP | 蓝色星云（右） |
| `galaxy_glow.webp` | 600×600 | WebP | 中心径向光晕 |

### 12.2 星球

| 文件名 | 尺寸 | 格式 | 说明 |
|------|:---:|:---:|------|
| `planet_core.webp` | 200×200 | WebP | 蓝色星球本体 |
| `planet_ring.webp` | 260×260 | WebP | 光环（可选 CSS） |
| `planet_atmo.webp` | 220×220 | WebP | 大气辉光（可选 CSS） |

### 12.3 星空

| 文件名 | 尺寸 | 格式 | 说明 |
|------|:---:|:---:|------|
| `star_bright.png` | 6×6 | PNG | 亮星点 |
| `star_medium.png` | 4×4 | PNG | 中星点 |
| `star_dim.png` | 2×2 | PNG | 暗星点 |

### 12.4 流星/飞船

| 文件名 | 尺寸 | 格式 | 说明 |
|------|:---:|:---:|------|
| `meteor_trail.webp` | 4×150 | WebP | 流星拖尾 |
| `ship_01.webp` | 80×40 | WebP | 蓝白飞船 |
| `ship_trail.webp` | 80×20 | WebP | 飞船尾焰 |

### 12.5 星座/图标

| 文件名 | 尺寸 | 格式 | 说明 |
|------|:---:|:---:|------|
| `constellation_lines.svg` | 12 个 | SVG | 十二星座星图连线 |
| `icon_back.svg` | 24×24 | SVG | 返回箭头 |
| `icon_settings.svg` | 24×24 | SVG | 设置齿轮 |

---

## Chapter 13：UI 验收标准

### 逐页验收

| 页面 | 视觉相似度要求 | 验收项 |
|------|:---:|------|
| 首页 | **≥ 95%** | 六层背景 + 五层星球 + Glass 按钮 + Glass Chips |
| 生日页 | **≥ 95%** | Glass Picker + 背景一致 |
| 星座页 | **≥ 95%** | 发光星座符号 + 中心光晕 |
| 星球页 | **≥ 95%** | 五层星球 + 三连卡片 + 进度条 |
| 探索页 | **≥ 90%** | 事件图标辉光 + 双星云 |
| 日志页 | **≥ 90%** | 发光时间轴节点 + Glass 卡片 |
| 设置页 | **≥ 95%** | Glass 卡片 + 危险按钮 |

### 验收流程

```
1. 打开页面 → 对照本文档逐项检查
2. 每个 Token（颜色/尺寸/动画）必须与文档一致
3. 如不达标 → 记录差异 → 修复 → 重新验收
4. 全部达标 → 标记 ✅ → 进入下一阶段
```

---

## 附录：文档层级

```
UI_MASTER_BLUEPRINT.md           ← 品牌/原则/总规范
        │
UI_IMPLEMENTATION_BLUEPRINT.md   ← 本文档：量化施工标准
        │
        ├──> pages/index/        ← 逐页实现
        ├──> pages/birthday/
        ├──> pages/constellation/
        ├──> pages/planet/
        ├──> pages/explore/
        ├──> pages/timeline/
        └──> pages/settings/
```
