# UI V2 Design Guide

> 生效版本：Beta 0.2+ ｜ 设计原则：视觉效果优先于实现成本

## 1. 色彩系统

| Token | 值 | 用途 |
|------|-----|------|
| Deep Space | `#03081A` | 最底层背景 |
| Mid Space | `#090F35` | 渐变中段 |
| Upper Space | `#161D58` | 渐变顶部 |
| Glass Bg | `rgba(255,255,255,0.04)` | 玻璃卡片背景 |
| Glass Border | `rgba(255,255,255,0.08)` | 玻璃卡片边框 |
| Primary | `#5B6EF5 → #A855F7` | 主按钮渐变 |
| Glow | `rgba(100,80,220,0.35)` | 按钮发光 |

## 2. 字体系统

| Token | Size | Weight | Usage |
|------|------|--------|-------|
| Hero | 56rpx | 700 | 页面主标题 |
| Title | 44rpx | 600 | 二级标题 |
| Body | 26rpx | 400 | 正文/描述 |
| Label | 22rpx | 400 | 标签/辅助 |

## 3. 按钮系统

| Class | 用途 |
|------|------|
| `.btn-primary` | 主操作（渐变+发光+按下缩放） |
| `.btn-secondary` | 次要操作（半透明边框） |
| `.btn-disabled` | 禁用态 |

## 4. 玻璃拟态（Glass）

| Class | 说明 |
|------|------|
| `.glass-card` | 统一卡片基类 |

规则：
- `background: rgba(255,255,255,0.04)`
- `border: 1rpx solid rgba(255,255,255,0.08)`
- `border-radius: 24rpx`
- `backdrop-filter: blur(20rpx)`
- `box-shadow` 双层（外阴影+内高光）

## 5. 氛围系统

| 组件 | 说明 |
|------|------|
| `.atmo-star` | 独立星点元素（每页 35-50 颗，随机位置/大小/闪烁） |
| `.atmo-nebula-*` | CSS 星云渐变（左右各一个，不同页面不同颜色） |
| `.atmo-meteor` | 流星（CSS 动画，随机间隔） |

## 6. Hero 视觉

每个页面必须有视觉焦点（Hero）：

| 页面 | Hero |
|------|------|
| 首页 | CSS 蓝色星球 + 光环 |
| 生日页 | 玻璃卡片 + Picker |
| 星座页 | 大号 Unicode 星座符号 + 辉光 |
| 星球页 | CSS 蓝色星球 + 层叠信息 |
| 探索页 | 大号 Emoji + 星云背景 |
| Timeline | 玻璃卡片时间轴 |
| 设置 | 玻璃卡片列表 |

## 7. 间距与圆角

- 页面水平 padding：40rpx
- 卡片 padding：24-40rpx
- 卡片间距：16rpx
- 按钮圆角：50rpx（胶囊）
- 卡片圆角：24rpx

## 8. 动画规范

- 动画服务于氛围，不吸引注意力
- 所有动画 `pointer-events: none`
- 按钮按下：`scale(0.96)` 0.15s ease
- 星星闪烁：2-6s alternate infinite
- 流星：18-25s 间隔，持续 1.5-2s
- 反馈层：fadeIn 0.3s ease

## 9. 页面布局模板

```
<view class="page-full [page-class]">
  <view class="universe-atmosphere">...</view>
  <!-- Hero / Glass Cards / Buttons -->
</view>
```
