# Universe Motion System

> 版本：V2 ｜ 原则：缓慢 · 自然 · 不打扰 · CSS 优先

---

## 1. 设计原则

1. 动画服务于氛围，不服务于功能
2. 所有背景动画 `pointer-events: none`
3. CSS Animation 优先，禁止频繁 JS Timer
4. 同一帧不超过 3 个独立动画
5. 动画周期 ≥ 2s（按钮交互除外）
6. 帧率目标：60fps（通过 GPU 加速属性实现）

---

## 2. 星星闪烁规范

### 参数

| 属性 | 值 |
|------|------|
| 数量 | 65-85 颗（每页） |
| 大小 | 1-4rpx |
| 透明度 | 0.15 ~ 1.0 |
| 缩放 | 0.6 ~ 1.3 |
| 周期 | 2-6s（随机） |
| 延迟 | 0-6s（随机错开） |
| 缓动 | ease-in-out |
| 循环 | alternate infinite |

### 实现方式

```
CSS @keyframes starPulse
  0%   { opacity: 0.15; transform: scale(0.6) }
  50%  { opacity: 1;    transform: scale(1.3) }
  100% { opacity: 0.3;  transform: scale(0.8) }

每个星点通过 CSS custom properties (--dur, --delay) 设置独立参数
```

---

## 3. 流星规范

### 双流星系统

| 属性 | 流星 A（慢） | 流星 B（快） |
|------|:---:|:---:|
| 角度 | -40° | -30° |
| 周期 | 18s | 12s |
| 可见时长 | ~3% (~0.5s) | ~4% (~0.5s) |
| 起点 | 75% 顶部 | 85% 顶部 |
| 终点 | 10% 底部 | 20% 底部 |
| 延迟 | 3s | 8s |
| 颜色 | `rgba(180,200,255,0.9)→0` | `rgba(200,220,255,0.85)→0` |

### 视觉结构

```
流星 = 渐变线条（顶部亮 → 底部透明）
宽度: 2rpx
高度: 70-100rpx
圆角: 1rpx
```

---

## 4. 星尘漂浮规范

### 参数

| 属性 | 值 |
|------|------|
| 数量 | 12-20 颗（每页） |
| 大小 | 1rpx |
| 颜色 | `rgba(180,200,255,0.4)` |
| 浮动距离 | 垂直 60rpx, 水平 ±20rpx |
| 周期 | 8-16s（随机） |
| 缓动 | ease-in-out |
| 循环 | infinite |

### 动画路径

```
@keyframes dustFloat
  0%   { opacity:0;   transform: translate(0, 0) }
  25%  { opacity:0.6; transform: translate(15rpx, -30rpx) }
  50%  { opacity:0.2; transform: translate(-10rpx, -60rpx) }
  75%  { opacity:0.5; transform: translate(-20rpx, -30rpx) }
  100% { opacity:0;   transform: translate(0, 0) }
```

---

## 5. 中心光晕规范

### 参数

| 属性 | 值 |
|------|------|
| 大小 | 500rpx × 500rpx |
| 颜色 | 中心 `rgba(100,120,220,0.12)` → 边缘 `transparent` |
| 形状 | radial-gradient circle |
| 周期 | 6s |
| 缩放 | 0.9 ~ 1.1 |
| 透明度 | 0.6 ~ 1.0 |
| 缓动 | ease-in-out alternate |

---

## 6. 星球漂浮规范

### 参数

| 属性 | 值 |
|------|------|
| 浮动距离 | 上下 16rpx |
| 旋转 | ±3° |
| 周期 | 8s |
| 缓动 | ease-in-out |
| 循环 | infinite |

### 光环呼吸

| 属性 | 值 |
|------|------|
| 缩放 | 0.95 ~ 1.05 |
| 透明度 | 0.5 ~ 1.0 |
| 周期 | 5s |
| 缓动 | ease-in-out alternate |

---

## 7. 星云漂移规范

### 参数

| 属性 | 值 |
|------|------|
| 位移 | 水平 30rpx, 垂直 -20rpx |
| 周期 | 左: 20s, 右: 25s |
| 缓动 | ease-in-out |
| 循环 | alternate / alternate-reverse |

---

## 8. 卡片出现动画规范（未来实现）

| 属性 | 值 |
|------|------|
| 触发 | 页面 onLoad 完成后 |
| 效果 | 淡入 + 上移 20rpx |
| 时长 | 0.4s |
| 缓动 | ease-out |
| 延迟 | 卡片按序错开 0.1s |

---

## 9. 按钮点击反馈规范

### 主按钮

| 属性 | 值 |
|------|------|
| 效果 | 缩放 + 阴影减弱 |
| 缩放 | scale(0.95) |
| 阴影变化 | 32rpx → 16rpx |
| 时长 | 0.12s |
| 缓动 | ease |

### 次按钮

| 属性 | 值 |
|------|------|
| 效果 | 背景变亮 |
| 背景变化 | `rgba(255,255,255,0.05)` → `0.08` |

---

## 10. 页面切换动画规范（未来实现）

| 属性 | 值 |
|------|------|
| 进入 | 右→左滑动 300ms |
| 返回 | 左→右滑动 300ms |
| 重定向 | 淡入 400ms |
| 首次启动 | 无动画（直接展示） |

---

## 11. 性能规范

1. 仅使用 GPU 加速属性：`transform`、`opacity`
2. 禁止动画 `width`、`height`、`left`、`top`（触发 layout）
3. 所有背景动画使用 `will-change: transform, opacity`（按需）
4. `backdrop-filter` 在低端机可能掉帧 → 提供降级方案（纯色背景）
5. 星点数量上限 85 颗/页（每增加 10 颗约增加 1% GPU 负载）
