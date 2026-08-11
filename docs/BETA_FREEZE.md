# Beta Freeze — Beta 0.1 封版记录

> 封版日期：2026-07-10 ｜ 版本：Beta 0.1 RC

---

## 1. 版本基线

| 项目 | 数量 |
|------|:---:|
| 页面（pages） | 7 |
| Engine（utils/*Engine） | 9 |
| Service（services/） | 3 |
| Controller（controllers/） | 1 |
| Storage Adapter | 1 |
| 云函数 | 0 |
| 数据库 | 0 |

## 2. 页面清单

| # | 页面 | 路径 | 状态 |
|---|------|------|:---:|
| 1 | 欢迎页 | `pages/index/` | ✅ |
| 2 | 生日选择 | `pages/birthday/` | ✅ |
| 3 | 星座结果 | `pages/constellation/` | ✅ |
| 4 | 我的星球 | `pages/planet/` | ✅ |
| 5 | 宇宙日志 | `pages/timeline/` | ✅ |
| 6 | 探索 | `pages/explore/` | ✅ |
| 7 | 设置 | `pages/settings/` | ✅ |

## 3. Engine 清单

| # | Engine | 文件 | 版本 |
|---|--------|------|:---:|
| 1 | Time Engine | `utils/timeEngine.js` | V1 |
| 2 | Growth Engine | `utils/growthEngine.js` | V1 |
| 3 | Daily Engine | `utils/dailyEngine.js` | V1.1 |
| 4 | Offline Engine | `utils/offlineEngine.js` | V1 |
| 5 | Interaction Engine | `utils/interactionEngine.js` | V1 |
| 6 | Planet Render Engine | `utils/planetRenderEngine.js` | V1 |
| 7 | Timeline Engine | `utils/timelineEngine.js` | V1 |
| 8 | Explore Engine | `utils/exploreEngine.js` | V2 |
| 9 | Living World Engine | `utils/livingWorldEngine.js` | V1 |

## 4. Service 清单

| # | Service | 文件 | 接口 |
|---|---------|------|------|
| 1 | User Service | `services/userService.js` | `getUser()` / `saveUser()` |
| 2 | Planet Service | `services/planetService.js` | `getPlanet()` / `savePlanet()` |
| 3 | Timeline Service | `services/timelineService.js` | `getTimeline()` / `addTimelineEvent()` / `saveTimeline()` |

## 5. Controller 清单

| # | Controller | 文件 | 接口 |
|---|-----------|------|------|
| 1 | Planet Controller | `controllers/planetController.js` | `loadPlanet()` |

## 6. Storage

| # | 模块 | 文件 | Key |
|---|------|------|-----|
| 1 | Storage Adapter | `utils/storage.js` | `USER` / `PLANET` / `TIMELINE` |

## 7. 里程碑

| 里程碑 | 状态 | 达成日期 |
|--------|:---:|------|
| M1：MVP 内测准备 | ✅ | 2026-07-09 |
| M2：Architecture Complete | ✅ | 2026-07-09 |
| M3：Beta Ready | 🟡 | 待用户测试 |

## 8. Sprint 完成统计

| Sprint | 主题 | 任务数 | 状态 |
|--------|------|:---:|:---:|
| Sprint 1 | 用户身份建立 | 11 | ✅ Completed |
| Sprint 2 | 世界开始运转 | 13 | ✅ Completed |
| Sprint 3 | MVP 打磨阶段 | 36 | ✅ Completed |
| Sprint 4 | Beta Release Candidate | 1 | 🟡 In Progress |

## 9. 设计原则

| # | 原则 | 来源 |
|---|------|------|
| 1 | Timeline — 值得纪念的事进 Timeline | GAME_DESIGN.md |
| 2 | Daily — 每天只给一件最值得看的事 | GAME_DESIGN.md |
| 3 | Daily — 真正乐趣来自用户自己发现 | GAME_DESIGN.md |
| 4 | 三层次 — Daily + Growth + Timeline | GAME_DESIGN.md |
| 5 | Living World — 不是奖励，是新的故事 | GAME_DESIGN.md |
| 6 | Exploration — 探索的价值来自未知 | GAME_DESIGN.md |
| 7 | Companionship — 世界记得你的存在 | GAME_DESIGN.md |

## 10. 开发规范

| # | 规则 |
|---|------|
| 1 | Engine 修改必须先创建 Issue |
| 2 | 向后兼容 |
| 3 | MVP 原则 |
| 4 | 文档同步 |
| 5 | 问题记录 |
| 6 | Sprint MVP Review |
| 7 | Engine 复用 |
| 8 | Service 单一职责 |
| 9 | Storage Key 唯一来源 |
| 10 | Page 轻量化 |
| 11 | 数据流唯一 |
| 12 | Engine 纯函数 |
| 13 | 禁止跨层调用 |
| 14 | Controller 协调 |
| 15 | 体验价值原则 |

## 11. Feature Freeze 声明

> **自 2026-07-10 起，Beta 0.1 进入 Feature Freeze。**
>
> 除以下情况外，不再接受任何代码变更：
> - 阻塞级 Bug 修复
> - 崩溃修复
> - 数据安全修复
>
> 禁止：
> - 新增页面
> - 新增 Engine
> - 新增 Service
> - 新增功能
> - 修改架构
> - 重构代码

## 12. 已知限制

| KI | 说明 | 计划 |
|----|------|------|
| KI-002 | joinDate 未持久化 | 接入登录后迁移 |
| KI-003 | lastVisitTime 未持久化 | 接入登录后迁移 |
| KI-004 | Timeline 未持久化 | 接入登录后迁移 |
