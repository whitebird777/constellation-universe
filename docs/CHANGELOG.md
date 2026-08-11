# 更新日志（CHANGELOG）

## Brand Update — 项目更名为「星座联盟」

- 项目中文名正式从「星座联盟」更名为「星座联盟」（原"星座宇宙"）。
- 品牌定位调整为：加入你的星座联盟，培育属于自己的星球。
- 用户可见文案、文档、配置全面更新。
- 保留原宇宙世界观设定。

### Task-HOME-001~008 — 首页功能布局重构
- 重写：`pages/index/index` — 删除英文文案、中央星球模型，改为十字布局功能入口大厅。
- 新增：中央「开启我的星球」圆形按钮（240rpx，呼吸光晕动画）。
- 新增：四方向入口 — 📖宇宙日志 · ✨星座运势 · 💫星座匹配 · ⚙️设置。
- 移除：首页「关于宇宙」「排行榜」入口（功能保留，移至其他页面）。
- 预留：`onFortune()` / `onMatch()` 接口（当前 toast 占位）。

### Task-HOROSCOPE-001 — 星座运势 V1
- 新增：`pages/horoscope/index` — 星座运势页面（身份卡/星能指数/四维度/记录）。
- 新增：`utils/horoscopeEngine.js` — 基于星座+日期确定性生成每日运势。
- 修改：`pages/index/index` — onFortune 改为跳转运势页。
- 修改：`app.json` 注册 `pages/horoscope/index`。

### Task-HOROSCOPE-002 — 星座运势 V2
- 新增：`pages/horoscope/select` — 十二宫格星座探索页。
- 新增：运势页支持查询任意星座（`?name=白羊座`）。
- 新增：「🌙 今日星辰寄语」模块 +「🌌 探索其它星座」入口。
- 优化：垂直布局填充，消除下半屏空白。

### Task-HOROSCOPE-003 — 星座运势 V3（每日星象报告）
- 重写：`utils/horoscopeEngine.js` — 新增幸运指数/行动建议/完整分析文案。
- 重写：`pages/horoscope/index` — 6 段式报告布局（身份→星象→核心运势→幸运指数→行动建议→记录）。

### Task-HOROSCOPE-004 — 星座运势 V3.1（Beta 定版）
- 删除「宇宙提醒」重复模块。
- 优化卡片间距（28→22rpx padding），确保记录按钮首屏可见。
- 🔒 星座运势模块进入 Beta 定版。

### Onboarding Flow V2 — 首页首次进入流程优化
- 删除：首页底部「开始星座之旅」授权按钮（与中心 CTA 重复）。
- 修改：星座页按钮「进入我的星球」→「成为星球主人」。
- 修改：微信授权从首页移至星座页（生日→星座→授权→星球）。
- 新增：星座页「一颗属于你的星球正在诞生」仪式文案。

### 排行榜优化（Beta 定版）
- 标题「银河排行榜」→「⭐ 星座荣耀榜 ⭐」。
- 删除顶部银河居民/银河星光统计栏。
- 个人榜改为固定 Top10 + 底部「我的排名」卡片（含星光/百分比/银河第一特殊文案）。
- 服务层新增 `getTotalCount`，前端计算超过XX%银河居民。

---

---

---

---

## Sprint 5：星座星田 Phase 1 + 星光命名 🟡 In Progress

### Task-FARM-001 — 星辉更名为星光
- 产品文案统一为「星光」；云字段仍为 `starlight`（兼容已有数据）。
- 排行榜 / 关于页 / 任务文案同步更新。

### Task-FARM-002 — 星座星田核心循环
- 新增：`utils/farmEngine.js` — 生长 / 浇灌 / 收获 / 每日上限纯函数。
- 新增：`services/farmService.js` — 持久化 + 发放星光（个人 + 星座联盟）。
- 修改：`pages/planet` — 星田操作台（进度、浇灌、收获、今日星光）。
- 修改：`planetController` — 移除进页自动送星光 / 自动完成任务。
- 配置：成熟 **2 小时**，移除每日星光上限。
- 数值：收获 +5、浇灌 +1。

### Task-FARM-004 — 浇灌系统升级
- 重写：`utils/farmEngine.js` — Phase 2 浇灌系统。
- 新增：全局浇灌次数（初始 2 次，每 2 小时恢复 1 次，上限 2 次）。
- 修改：每次浇灌减少 30 分钟成熟时间，最低剩余 ≥60 分钟。
- 修改：`pages/planet` — 显示全局浇灌次数。

### Task-FARM-003 — 排行榜对接
- 星光仅来自星田操作；写入个人 `users.starlight` 与联盟 `constellation_stats.starlight`。
- 新增 `leaderboardService.syncPersonalStarlight` 修复个人榜滞后。

---

## Sprint 1：用户身份建立 ✅ Completed

### Task-001 — 修复项目初始化问题
- 修复：`app.json` 中移除不存在的 `pages/example/index` 页面声明，使 pages 配置与实际目录一致，项目可正常编译启动。

### Task-002 — 欢迎页面
- 新增：欢迎页面（复用 `pages/index/index`）采用单屏深色渐变布局，包含星星图标、中英文标题、引导文案及"开始我的宇宙"按钮。
- 新增：`pages/birthday/index` 占位页面，点击欢迎页按钮后跳转至此。
- 修改：`app.json` 注册 `pages/birthday/index`。

### Task-003 — 生日选择页面
- 完善：`pages/birthday/index`，替换占位内容为完整的生日选择页。
- 新增：微信原生日期选择器（Picker），选择范围为 1900-01-01 起。
- 新增：按钮禁用态（未选择生日时置灰不可点击），选择后激活。
- 新增：生日数据通过 `app.globalData.birthday` 存入全局状态。

### Task-004A — 星座计算模块
- 新增：`miniprogram/utils/constellation.js` 工具模块。
- 提供 `getConstellation(date)` 方法，支持 Date 对象和 "YYYY-MM-DD" 字符串输入。
- 纯函数模块，不依赖页面和 globalData。

### Task-004B — 星座结果页
- 新增：`pages/constellation/index` 星座结果页，含 1000ms "解析星空"加载态。
- 新增：`getConstellationIcon(name)` 方法到 `utils/constellation.js`。
- 修改：`pages/birthday/index` 的"继续"按钮改为跳转到星座结果页。

### Task-005 — 我的星球
- 新增：`pages/planet/index` 星球主页。
- 新增：首次进入自动创建 `joinDate`，基于当前日期计算"来到宇宙第N天"。
- 修改：`pages/constellation/index` 的"进入我的星球"改为 `wx.redirectTo` 跳转 `/pages/planet/index`。

## Sprint 2：世界开始运转 ✅ Completed

### Task-006 / Task-009 — 每日宇宙事件系统
- 新增：`miniprogram/utils/dailyEngine.js`，提供 `getDailySnapshot()` 纯函数。
- 新增：12 条每日消息 — 4 个成长阶段 × 3 条轮换消息。

### Task-007 — Universe Time Engine V1
- 新增：`miniprogram/utils/timeEngine.js`，提供 `getJoinDate()`、`getUniverseAge()`、`getGrowthStage()`、`getToday()` 四个纯函数。
- 新增：成长阶段系统 — Seed → Sprout → Growing → Living。

### Task-008 — Growth Engine V1
- 新增：`miniprogram/utils/growthEngine.js`，提供 `getGrowthNode(age)` 纯函数。
- 新增：5 个内置成长节点 — Day 1 🌱 / Day 3 🌿 / Day 7 🌳 / Day 15 🦋 / Day 30 🌲。

### Task-010 — Planet Interaction V1
- 新增：`miniprogram/utils/interactionEngine.js`，提供 `createInteraction(type)` 纯函数。
- 修改：`pages/planet/index` 星球 🌍 新增 `bindtap` 点击事件。

### Task-011 — Offline Growth System V1
- 新增：`miniprogram/utils/offlineEngine.js`，提供 `calculateOfflineGrowth()` 纯函数。
- 修改：`pages/planet/index` 进入页面时自动检测离线时长。

### Task-012 — Planet Evolution V1
- 新增：`miniprogram/utils/planetRenderEngine.js`，提供 `getPlanetAppearance(age)` 纯函数。
- 修改：`pages/planet/index` 星球从硬编码改为动态渲染 layers。

### Task-013 — Timeline V1
- 新增：`miniprogram/utils/timelineEngine.js` 和 `pages/timeline/index` Timeline 页面。
- 新增：种子事件「星球诞生」+ 成长里程碑自动记录。

### Task-UI-001 — 统一按钮居中规范
- 修复：全项目 5 个按钮统一使用 flexbox 居中，高度统一 96rpx。

## Sprint 3：MVP 打磨阶段 🟡 In Progress

### Task-014 — UI Audit V1 巡检
- 新增：`docs/UI_AUDIT_V1.md`，5 页 × 7 维度完整巡检报告，Overall Score 76/100。
- 发现：A 级 4 项 / B 级 5 项 / C 级 3 项。

### Task-UI-002 — A级 UI 问题修复
- 修复 A1：全项目 5 个页面标题统一为 `48rpx / font-weight: 600`。
- 修复 A2：欢迎页按钮宽度 `100%` → `560rpx`（与其余页面一致）。
- 修复 A3：欢迎页水平 padding `20rpx` → `40rpx`（与其余页面一致）。
- 修复 A4：生日页新增 `"navigationStyle": "custom"`，消除浅色导航栏断裂。

### Task-DOC-010 — 建立 MVP 测试清单
- 新增：`docs/MVP_CHECKLIST.md`，覆盖 10 个测试维度（启动 / 身份 / 星球 / 成长 / 每日 / 日志 / 互动 / 离线 / 界面 / 已知问题）。

### Task-DOC-011 — 建立测试规范
- 新增：`docs/TESTING_RULES.md`，建立 7 章测试规范，明确功能完成标准（DoD）和 Bug 记录规范。
- 修改：`docs/DEVELOPMENT_RULES.md` 新增 Rule-006（Sprint 完成后必须进行 MVP Review）。
- 修改：`docs/ROADMAP.md` 新增 M1 里程碑：MVP 内测准备。
- 修改：`docs/SPRINT.md` Sprint 2 标记 Completed，Sprint 3 标记 In Progress。

### Task-DOC-012 — 建立 Living World 世界生命系统
- 新增：`docs/LIVING_WORLD.md`，建立 8 章世界生命系统框架，含 7 条用户感知原则。
- 修改：`docs/GAME_DESIGN.md` 新增「世界生命原则」。
- 修改：`docs/PROJECT.md` Product Rule 新增 Living World 领域。
- 修改：`docs/ROADMAP.md` 新增 Future System：Living World System。

### Task-015 — 建立 Service Layer 架构
- 新增：`miniprogram/services/` 目录，含 `userService.js`、`planetService.js`、`timelineService.js` 三个占位 Service。
- 新增：`docs/SERVICE_ARCHITECTURE.md`，建立 6 章服务层架构文档。
- 修改：`docs/DATABASE.md` 新增 Storage → Service → Database 分层设计。
- 修改：`docs/PROJECT.md` 新增 Application → Service → Engine → Storage 四层架构图。

### Task-DOC-013 — 建立系统总架构文档
- 新增：`docs/ARCHITECTURE.md`，建立 10 章系统总架构说明文档。
- 修改：`docs/DEVELOPMENT_RULES.md` 新增 Rule-007（Engine 复用原则）。

### Task-016A — 建立 Storage Adapter
- 新增：`miniprogram/utils/storage.js`，提供 `get()` / `set()` / `remove()` / `clear()` 统一存储接口。
- 新增：`STORAGE_KEYS` 常量（USER / PLANET / TIMELINE），禁止硬编码 key 字符串。
- 新增：`docs/STORAGE.md`，建立 6 章存储层设计文档。
- 修改：`docs/SERVICE_ARCHITECTURE.md` 新增 Storage Adapter 章节。

### Task-016B — 迁移 User Service 到 Storage Adapter
- 修改：`miniprogram/services/userService.js`，从 `app.globalData` 迁移到 `storage.js`。
- 新增：三级读取策略（Storage → globalData 自动迁移 → 默认空结构）。
- 新增：`saveUser()` 合并写入策略，过渡期同步 `globalData`。

### Task-016C — 迁移 Planet Service 到 Storage Adapter
- 修改：`miniprogram/services/planetService.js`，从 `app.globalData` 迁移到 `storage.js`。
- 新增：默认 Planet 结构（`joinDate` / `lastVisitTime` / `recordedGrowthDays` / `timeline`）。
- 新增：三级读取 + 合并写入策略，过渡期同步 `globalData`。

### Task-DOC-014 — Service 规范
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-008（Service 单一职责原则）。
- 修改：`docs/ARCHITECTURE.md` §5 补充「Service 数据 / Engine 规则 / Page 展示」说明。

### Task-016D — 迁移 Timeline Service 到 Storage Adapter
- 修改：`miniprogram/services/timelineService.js`，从 `app.globalData` 迁移到 `storage.js`。
- 新增：`saveTimeline(list)` 批量保存接口。
- 新增：三级读取 + 合并写入策略，过渡期同步 `globalData`。

### Task-DOC-015 — Storage Key 命名规范
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-009（Storage Key 唯一来源原则）。
- 修改：`docs/STORAGE.md` 新增 §4 Storage Key Naming Rules + 当前 Key 清单。

### Task-017A — 欢迎页 Service 化
- 修改：`pages/index/index` 接入 `userService`，不再直接访问 `app.globalData`。
- 新增：首次用户判断 — 无 birthday → "开始我的宇宙"；有 birthday → "继续探索"。
- 新增：老用户点击按钮直接进入星球页（跳过生日流程）。

### Task-DOC-016 — 页面职责规范
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-010（Page 轻量化原则）。
- 修改：`docs/ARCHITECTURE.md` 新增 Page Responsibility 章节（允许 5 项 / 禁止 4 项）。

### Task-017B — 生日页面 Service 化
- 修改：`pages/birthday/index` 接入 `userService`，不再直接访问 `app.globalData`。
- 新增：`onLoad` 预填已有生日（老用户无需重新选择）。
- 修改：保存逻辑从 `app.globalData.birthday =` 改为 `userService.saveUser()`。

### Task-DOC-017 — 数据流规范
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-011（数据流唯一原则）。
- 修改：`docs/ARCHITECTURE.md` §8 新增 Standard Data Flow（数据流 + 规则流双通道）。

### Task-017C — 星球页面 Service 化（Phase 1）
- 修改：`pages/planet/index` 全部数据读写从 `app.globalData` 迁移到 `userService` / `planetService` / `timelineService`。
- 移除：不再直接访问 `app.globalData`（`constellation` / `joinDate` / `lastVisitTime` / `recordedGrowthDays` / `timeline`）。

### Task-DOC-018 — Engine 输入规范
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-012（Engine 纯函数原则）。
- 修改：`docs/ARCHITECTURE.md` §4 新增 Engine Input Principle（5 条纯函数约束）。
- 修改：`docs/ROADMAP.md` 新增 M2 里程碑：Architecture Complete。

### Task-017D — Constellation 页面 Service 化
- 修改：`pages/constellation/index` 全部 `app.globalData` 调用迁移到 `userService`。
- `onLoad`：`app.globalData.birthday` → `userService.getUser().birthday`。
- `onEnter`：`app.globalData.constellation =` → `userService.saveUser({ constellation })`。

### Task-DOC-019 — 禁止跨层调用原则
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-013（禁止跨层调用原则）。
- 修改：`docs/ARCHITECTURE.md` §8 新增层间调用关系图 + 5 条禁止路径。

### Task-018 — 建立 Planet Controller
- 新增：`miniprogram/controllers/planetController.js`，提供 `loadPlanet()` 协调方法。
- 修改：`pages/planet/index.js` 从 146 行简化至调用 Controller + 交互处理。
- Page 不再直接调用多个 Service/Engine，通过 Controller 统一获取数据。

### Task-DOC-020 — 新增 Controller 架构规范
- 新增：`docs/CONTROLLER_ARCHITECTURE.md`，建立 5 章 Controller 架构文档。
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-014（Controller 协调原则）。
- 修改：`docs/ARCHITECTURE.md` §3 升级为 5 层架构：Page → Controller → Service/Engine → Storage。

### Task-019 — MVP Review V1
- 新增：`docs/MVP_REVIEW_V1.md`，完整产品体验评审报告。
- 总体评分：**8.3/10** — 有条件通过 Beta 内测。
- 发现：4 项 Block 问题 / 5 项优化建议 / 3 项后续迭代。

### Task-020 — Timeline 页面 Service 化（Block 修复）
- 修改：`pages/timeline/index` 移除 `app.globalData.timeline` 直接访问，改用 `timelineService.getTimeline()`。
- 🎉 **全项目 Page 层 100% 脱离 app.globalData 直接访问。**

### Task-021 — Explore Engine V1 + 探索页面
- 新增：`utils/exploreEngine.js`，提供 `getRandomExplore()` — 12 条治愈系宇宙事件。
- 新增：`pages/explore/index` 探索页面，深色极简布局，每次随机展示一条事件。
- 新增：`docs/EXPLORE_ENGINE.md`，建立 5 章探索引擎文档。
- 修改：`pages/planet/index` "🚀 出发探索" 从 toast 占位改为跳转探索页。
- 修改：`docs/EXPLORE_SYSTEM.md` 记录 V1 实现。
- ✅ **Block B2 已修复。**

### Task-022 — Living World Engine V1
- 新增：`utils/livingWorldEngine.js`，提供 `getWorldState(date)` 确定性纯函数。
- 新增：`docs/LIVING_WORLD_ENGINE.md`，建立 4 章世界状态引擎文档。
- 内置 6 种世界状态：Quiet / Bright Stars / Meteor Shower / Blue Moon / Nebula Bloom / Cosmic Wind。
- 同一日期 → 同一状态（日期哈希取模），所有用户当天看到一致宇宙背景。

### Task-023 — Daily Engine 接入 Living World
- 修改：`utils/dailyEngine.js` 接入 `livingWorldEngine`，返回值新增 `world` 字段。
- 修改：`controllers/planetController.js` 传递 `date` 参数至 dailyEngine。
- 修改：`docs/DAILY_ENGINE.md` 新增 §5 World Integration。
- ✅ 向后兼容：原有消息不变，仅新增 `world` 字段。

### Task-024 — 成长阶段中文化
- 修改：`utils/timeEngine.js` 阶段名从英文改为中文（种子期/萌芽期/成长期/繁荣期）。
- 新增：`getGrowthStageKey()` 内部 key 接口，Engine 间调用解耦 UI 展示名。
- 修改：`utils/dailyEngine.js` 使用 `getGrowthStageKey(age)` 查找消息，与展示名解耦。
- 修改：`docs/PLANET_SPEC.md` §3 新增中文阶段表。
- ✅ **Block B3 已修复。**

### Task-025 — 世界状态卡片
- 修改：`pages/planet/index.wxml` 新增「🌠 今日世界」卡片，展示 `dailySnapshot.world`。
- 修改：`pages/planet/index.wxss` flex 比例微调适配新增区块。
- 修改：`docs/LIVING_WORLD.md` 记录 V1 页面展示。

### Task-026 — 首页体验完善
- 修改：`pages/index/index` 新增「📖 宇宙日志」「ℹ️ 关于宇宙」次级入口。
- 新增：「关于宇宙」Modal — 首次向用户表达产品理念。
- 新增：`docs/DEVELOPMENT_RULES.md` Rule-015（体验价值原则）。

### Task-027 — Explore Engine V2
- 修改：`utils/exploreEngine.js` 从 12 事件扩展到 36 事件（6 个分类 × 6 条）。
- 新增：确定性算法 `date + age` 共同决定事件索引。
- 修改：`docs/GAME_DESIGN.md` 新增「探索原则」。
- 修改：`docs/EXPLORE_ENGINE.md` 更新为 V2。

### Task-028 — Welcome Back
- 修改：`pages/index/index` 新增 `welcomeText` — 新用户/老用户显示不同欢迎语。
- 修改：`docs/GAME_DESIGN.md` 新增「陪伴原则」。

### Task-029 — Settings 设置页
- 新增：`pages/settings/index` 设置页面（版本号 / 重新开始 / 关于 / 返回首页）。
- 新增：`docs/SETTINGS.md`，建立 4 章设置文档。
- 修改：`pages/index/index` 新增「⚙️ 设置」入口。
- 修改：`app.json` 注册 `pages/settings/index`。

### Task-030 — Beta Review V2（最终内测评审）
- 新增：`docs/BETA_REVIEW_V2.md`，完整流程评审 + Bug 清单 + Beta 发布建议。
- 总体评分：**8.9/10** — 建议进入 Beta 内测（5-10 人 / 7 天）。
- 修改：`docs/ROADMAP.md` 新增 M3 里程碑：Beta Ready。

### Task-031 — Beta 发布准备（Bug 修复）
- 修复 B-001：`app.json` title "云开发 QuickStart" → "星座联盟"。
- 修复 B-002：Settings 重置改用 `storage.clear()` 统一 Adapter。
- 修复 B-003：探索页传入 `date + age` 参数，事件真正基于确定性算法。
- ✅ **B-001 / B-002 / B-003 已关闭。**

### Task-DOC-021 — 新增 Beta 测试计划
- 新增：`docs/BETA_TEST_PLAN.md`，7 章测试计划（5-10 人 / 7 天 / 6 项指标）。

### Task-DOC-022 — 新增 Beta 后路线图
- 新增：`docs/POST_BETA_ROADMAP.md`，V1.1 → V1.2 → V2 → V3 四阶段规划。

### Task-DOC-023 — 新增产品愿景文档
- 新增：`docs/PRODUCT_VISION.md`，使命 / 设计哲学 / "为什么没有" / 最高原则。

### Sprint 4：Beta Release Candidate

### Task-032 — Beta 发布准备（Release Readiness）
- 新增：`docs/RELEASE_CHECKLIST.md`，10 章发布前检查清单。
- 新增：`docs/BETA_FEEDBACK_TEMPLATE.md`，统一用户反馈模板。
- Sprint 3 → ✅ Completed；Sprint 4 → 🟡 Beta Release Candidate。
- 🔒 **Beta 0.1 Feature Freeze** — 详见 `docs/BETA_FREEZE.md`。

### Task-032（补充）— Beta Freeze 封版
- 新增：`docs/BETA_FREEZE.md`，记录 Beta 0.1 完整基线（7 页 / 9 Engine / 3 Service / 1 Controller / 3 里程碑 / 7 原则 / 15 规范）。

### Task-033 — 修复 Custom Navigation 返回问题（Bug Fix）
- 修改：`pages/birthday/index`、`pages/constellation/index`、`pages/timeline/index` 新增 `← 返回` 按钮。
- 修改：`app.wxss` 新增全局 `.nav-back` 样式。
- 全项目 7 页 custom 导航页均具备返回/退出能力。

### Task-034 — Universe Atmosphere V1（宇宙动态氛围）
- 修改：`app.wxss` 新增全局氛围层样式（星场闪烁 / 流星 / 飞船巡航）。
- 修改：全部 7 页 WXML 新增 `universe-atmosphere` 背景层。
- 新增：`docs/ATMOSPHERE_SYSTEM.md`，记录氛围系统设计与动画原则。

### Task-035 — Universe UI Rebuild（Phase 1）
- 重写：`app.wxss` — 全新 Design System（玻璃拟态 / 胶囊按钮 / 多色星云 / 独立星点 / 字体系统）。
- 重写：全部 7 页 WXML + WXSS — 玻璃卡片布局 / CSS Planet Hero / 动态星场 / 独立流星。
- 新增：`docs/UI_V2_GUIDE.md` — UI V2 设计规范（色彩/字体/按钮/玻璃/氛围/Hero/间距/动画/布局模板）。
- 🎨 **视觉优先级 > 实现成本** — 设计原则正式变更。

### Task-035（补充）— 全页面双流星动画
- 修改：`app.wxss` 新增 `.atmo-meteor-fast` 快速流星变体（不同角度/速度/起点）。
- 修改：全部 7 页 WXML 统一加入双流星元素（`.atmo-meteor` + `.atmo-meteor-fast`）。
- 效果：每页 ~18s 一颗慢速流星 + ~12s 一颗快速流星，循环交错划过。

### Task-UIV2-001 — Project Phoenix（UI V2 全面重构）
- 重写：`app.wxss` — 新增中心光晕、CSS 星云漂移、80+独立星点、漂浮星尘粒子、呼吸动画。
- 重写：全部 7 页 WXML — 玻璃卡片系统、CSS Planet Hero（旋转+漂浮）、进度条、发光时间轴节点。
- 重写：全部 7 页 WXSS — 极简页面样式（95% 复用全局）。
- 重写：全部 7 页 JS — 升级为 `genAtmo(n,t)` 统一氛围生成（80 星 + 15 尘 每页）。
- 新增：`.btn-danger` 红色危险按钮、`.atmo-dust` 漂浮粒子、`.atmo-glow` 中心光晕。
- 🎨 **Project Phoenix 完成：深空质感 / 动态宇宙 / 玻璃拟态 / 统一视觉语言。**

### UI Sprint 1：Universe Design System V2

### Task-UI-S1 — 视觉重构第一阶段
- 新增：`docs/DESIGN_SYSTEM_V2.md` — 12 章完整设计规范（色板/字体/间距/圆角/阴影/发光/Glass/Button/动画/布局模板）。
- 新增：`docs/MOTION_SYSTEM.md` — 11 章动画规范（星/流星/星尘/光晕/星球/星云/卡片/按钮/切换/性能）。
- 新增：`docs/HOME_PAGE_VISUAL_SPEC_V2.md` — 首页完整视觉方案（布局/层级/星球/Loto/文案/按钮/动画/V1 差异）。
- 新增：`assets/` 目录 — 8 个子目录 + README，标记未来资源用途。
- 🎨 **停止功能开发，进入 Visual Rebuild。所有页面重构以本文档为唯一依据。**

### Task-UI-S3 — MASTER UI BLUEPRINT（唯一视觉规范）
- 新增：`docs/UI_MASTER_BLUEPRINT.md` — 10 章 + Design Rule-001 + 附录 ABC。
- 确立为全项目**唯一** UI 权威文档。任何冲突以本文档为准。
- 内容包括：品牌定位 / 视觉关键词 / 页面共同结构 / 六层背景 / Glass / Glow Token / 动画 Token / Assets Library / 七页面规范 / UI 完成标准。
- 新增：**Design Rule-001** — 效果图视觉一致性为第一优先级。

### Task-UI-S4 — 首页 MASTER BLUEPRINT 重构

- 推翻：V1/V2/V3 首页，完全重写。
- 重写：`pages/index/index.wxml` — 六层背景 + CSS 星球（core/ring/atmo） + Glass 按钮 + Glass Chips。
- 重写：`pages/index/index.wxss` — 全新专属样式（星球渐变/呼吸/浮动/辉光/流星/星尘/Galaxy）。
- 修改：`pages/index/index.js` — 拆分 `welcomeTitle`/`welcomeText`，氛围升级 85星+20尘。
- 新增视觉元素：三层 CSS 星球、Glass 按钮（blur+glow+阴影+内高光）、Glass Chips（三入口统一）。

### Task-UI-R1 — UI Implementation Blueprint（施工蓝图）
- 新增：`docs/UI_IMPLEMENTATION_BLUEPRINT.md` — 13 章量化施工标准。
- 内容包括：10 层全局 z-index 结构 / 页面比例量化 / 色彩 Token 表（30+） / Glass Card 参数 / 4 型按钮规范 / 五层星球结构 / 4 类星点 + 星尘 + 双流星参数 / 飞船 / 7 页逐页 Blueprint / 12 项 Asset 清单 / 逐页验收标准（≥90-95%）。
- 🏗️ **确立三层文档体系：MASTER → IMPLEMENTATION → Pages。**

### Task-UI-R2 — 首页视觉重构（Real Build）
- 新增：`utils/ui/atmosphere.js` — 四类星点 + 星尘生成器（Blueprint Ch7 规范）。
- 重写：`pages/index/index.wxml` — 四类 85 星点 + 五层星球体（galaxy/ring/atmo/core） + Glass 按钮渐变文字 + Glass Chips。
- 重写：`pages/index/index.wxss` — 所有动画/尺寸/颜色严格遵循 IMPLEMENTATION BLUEPRINT Token 值。
- 星球升级：五层结构（galaxy 光晕 → ring 光环 → atmo 大气 → core 5-stop radial 3D → shadow）。

### Task-040 — 十二星宫联盟系统（Beta V0.2）
- 新增：`pages/ranking/index` — 十二星宫联盟排行榜（标题/银河统计/12 星座卡片/当前用户高亮）。
- 新增：`services/leaderboardService.js` — 全部数据初始化为 0，固定星座顺序排序。
- 新增：`controllers/leaderboardController.js` — 加载排行榜 + 当前用户星座匹配。
- 新增：星辉（Starlight）系统 — 统一成长资源，替代金币/积分/礼物。
- 修改：`pages/index/index` 新增「👑 星宫」入口 Chip。
- 修改：`app.json` 注册 `pages/ranking/index` + 窗口配色统一深空 `#03081A`。

### Task-RANK-001 — 排行榜全部归零
- 修改：`services/leaderboardService.js` — 移除所有 Mock 数据，仅保留 12 星座框架（名称+图标），全部数值为 0。
- 修改：`controllers/leaderboardController.js` — 简化。
- 修改：`pages/ranking/index` — 简化卡片：仅显示排名/名称/图标/人数(0)/星辉(0)。

### Task-RANK-002 — 用户首次创建星球自动加入联盟
- 新增：`leaderboardService.joinLeague(name)` — 首次调用 `+1`，通过 `joined_league` Storage 标记永久防重。
- 新增：`storage.KEYS.LEADERBOARD` + `storage.KEYS.JOINED_LEAGUE`。
- 修改：`planetController` — 首次创建星球（`joinDate` 为空）时触发 `joinLeague`。

### Task-RANK-004 — 星辉系统 + 每日首次进入奖励
- 新增：`leaderboardService.addStarLight()` / `getTotalStarLight()` — 星辉数据层。
- 新增：`storage.KEYS.LAST_STARLIGHT_DATE` — 每日星辉判定。
- 修改：`planetController` — 每日首次进入星球自动 +1 星辉，自动贡献联盟。

### Task-RANK-005 — 每日宇宙事件（Daily Mission V1）
- 新增：`dailyEngine.getDailyMission(date)` — 6 条事件，日期确定性选取。
- 新增：`storage.KEYS.MISSION_COMPLETED_DATE` — 防重复完成。
- 修改：`planetController` — 每日首次自动完成事件，奖励 +2 星辉。
- 修改：`pages/planet/index` — 新增「🎯 今日宇宙」事件卡片（图标/文案/奖励/完成状态）。

### Task-RANK-006 — 排行榜星辉排序
- 修改：`leaderboardService.getLeaderboard()` — 按 starlight DESC → userCount DESC → name ASC 排序。
- 修改：`pages/ranking/index.wxml` — 第一名显示 👑。

### Task-RANK-007 — 银河居民排行榜
- 新增：`leaderboardService.joinPersonalLeaderboard()` / `getPersonalLeaderboard()` — 个人排行数据层。
- 新增：`storage.KEYS.PERSONAL_LEADERBOARD` — 个人排行 Storage Key。
- 修改：`leaderboardService.addStarLight()` — 联盟星辉自动同步到个人排行。
- 修改：`planetController` — 首次创建星球时自动加入个人排行。
- 修改：`pages/ranking/index` — 新增 Tab 切换（星座联盟 / 银河居民）+ 个人排行空状态。

### Task-BUG-004 — 星球页导航修复
- 修复：星球页无返回按钮问题。新增 ← 首页 导航。
- 新增：`onGoHome()` — getCurrentPages() 判断 navigateBack 或 reLaunch。

### Task-USER-001 — 用户模型 V2（微信兼容）
- 重写：`userService.js` — 13 字段完整模型（id/nickname/avatar/openid/unionid/authorized/birthday/constellation/starlight/joinDate/lastActive/growthDays/version:2）。
- 新增：V1→V2 自动迁移 — 旧格式无 version 字段时自动升级，用户无感知。
- 修改：`leaderboardService.js` — 个人排行从 user 模型读取 nickname，字段统一为 `unionid`/`authorized`。
- 修改：`planetController.js` — 首次创建时写入 joinDate/lastActive/version，每次进入更新 lastActive。
- 后续接入微信登录后，仅需填写 `nickname/avatar/openid`，排行榜无需任何改动。

### Task-USER-002 — 建立 Authorization Service（认证层）
- 新增：`services/authService.js` — 9 个统一认证接口（getCurrentUser/isAuthorized/authorize/logout/getUserId/getNickname/getAvatar/isGuest）。
- 修改：`planetController` — 读取用户改用 `authService.getCurrentUser()`。
- 修改：`leaderboardService` — `joinPersonalLeaderboard` 通过 authService 获取 id/nickname/avatar。
- 修改：`pages/settings/index` — 读取用户改用 `authService.getCurrentUser()`。
- 🔐 后续接入微信登录仅需修改 authService，其余代码零改动。

### Task-CLOUD-001 — 初始化微信云开发
- 修改：`app.js` — 云开发初始化 + Cloud Ready 日志 + 基础库版本检测。
- 新增：`utils/cloudConfig.js` — 统一管理 6 个云集合名称（禁止硬编码字符串）。
- 新增：`docs/CLOUD_ARCHITECTURE.md` — 云开发架构文档（集合设计/权限/扩展）。

### Task-CLOUD-002 — 接入真实云环境
- 修改：`app.js` — 环境 ID 替换为 `cloud1-d3g8wetaeeee3e839`，启动日志升级为完整环境信息。
- 修改：`utils/cloudConfig.js` — ENV_ID 使用真实环境 ID。
- ☁️ **项目已连接真实云环境 cloud1。**

### Task-CLOUD-003 — CloudUserService（云用户服务）
- 新增：`services/cloudUserService.js` — 5 个云数据库 CRUD 接口（getUser/createUser/updateUser/saveUser/exists）。
- 所有接口返回 Promise，统一异常处理，禁止页面直接访问 `wx.cloud.database()`。
- ☁️ **当前状态：Service 已完成，尚未接入任何业务。**

### Task-CLOUD-004 — 微信登录授权
- 重写：`services/authService.js` — 接入 `wx.login()` + `wx.getUserProfile()`，获取昵称/头像/OpenID。
- 新增：`loginWithWechat()` → 三步流程（getUserProfile → login → cloudUserService 同步）。
- 修改：`pages/index/index` — 新增授权检查 +「开始微信之旅」按钮。
- 🔐 **项目正式支持微信登录。**

### Task-RANK-CLOUD-001 — 星座联盟排行榜迁移至云数据库
- 新增：`services/cloudLeaderboardService.js` — `constellation_stats` 集合 CRUD（init/getLeaderboard/joinLeague/leaveLeague/addStarlight）。
- 重写：`services/leaderboardService.js` — 数据源从 Storage 迁移至云数据库。
- 修改：`controllers/leaderboardController.js` + `pages/ranking/index.js` — 适配异步 Promise。
- ☁️ **排行榜已迁移至云数据库。所有用户实时可见排名变化。**

### Task-RANK-CLOUD-002 — 个人排行榜迁移至云数据库
- 新增：`services/cloudPersonalLeaderboardService.js` — `getTop10()` / `getMyRank()` 查询 users 集合。
- 修改：`leaderboardService.js` — 个人排行从 Storage 迁移至云。
- 修改：`pages/ranking/index` — 显示微信头像+昵称+星座 + 底部「我的排名」。
- ☁️ **Top10 + 我的排名 全部来自云数据库。**

### Task-CLOUD-005 — 用户数据全面云端化
- 重写：`services/userService.js` — 新增 `loadUser()`（缓存优先 + 后台云端同步）+ `pushCloud()`。
- 修改：`services/cloudUserService.js` — 新增 `syncUser()` 统一同步接口。
- 修改：`controllers/planetController.js` — 星辉/成长变更后自动 `pushCloud()`。
- 修改：`pages/index/index.js` — 启动时使用 `loadUser()` 加载用户。
- ☁️ **云数据库为唯一真实数据源，Storage 降级为缓存。**

### Task-BUG-004 — 星球页导航修复
- 修复：`pages/planet/index` — 新增 ← 首页 导航按钮 + 智能返回逻辑。

---
|------|------|
| KI-002 | `joinDate` 未持久化 | ✅ 已关闭（云数据库迁移完成） |
| KI-003 | `lastVisitTime` 未持久化 | ✅ 已关闭 |
| KI-004 | Timeline 数据未持久化 | ✅ 已关闭 |


## 2026-07-26 — 排行榜系统架构修复

### 问题现象

测试阶段发现：两个微信账号分别登录时，排行榜只能看到自己的数据。

- 微信A：星座榜只能看到自己的星座，个人榜只能看到自己的排名。
- 微信B：同样只能看到自己的数据。

### 根因

`users` 集合数据库权限设置为 **"仅创建者可读写"**。

微信云开发在客户端 `_db()` 查询时会自动注入权限过滤：

```
cloudPersonalLeaderboardService.getTop10()
  → _db().collection('users').get()
    → 云数据库权限过滤
    → 只返回 _openid 匹配当前用户的文档
```

因此 `getTop10()` 实际只返回了调用者自己的数据，排行榜退化为单用户视图。

### 修复

将 `users` 集合权限调整为 **"所有用户可读，仅创建者可写"**（云开发控制台 → 数据库 → users → 权限设置）。

### 影响

1. 星座排行榜恢复全局聚合（从 users 实时计算 12 星座的 userCount + starlight）。
2. 个人排行榜恢复全服 Top10（按 starlight 降序）。
3. `getMyRank()` 恢复全服排名计算。
4. 两个微信账号可互相看到对方的排行榜数据。

### 经验

排行榜、匹配、社交类功能依赖公共数据查询时，数据库权限必须纳入架构设计检查清单。客户端 `_db()` 查询不等同于服务端查询——微信云开发会自动注入 `_openid` 过滤。


## 2026-07-27 — Beta 排行榜优化记录

### 星座榜数据源重构

- 修改：`services/cloudLeaderboardService.js` `getLeaderboard()` — 从 `constellation_stats` 读取改为从 `users` 集合实时聚合。
- 数据源变为 `users`（唯一真实数据源），不再依赖 `constellation_stats`。
- 聚合条件：`birthday != '' && constellation != ''`（仅统计已完成建星流程的用户）。
- `constellation_stats` 集合保留但不再被读取。

### CloudBase 数据库权限修复

- 修复：`users` 集合权限从「仅创建者可读写」调整为「所有用户可读，仅创建者可写」。
- 根因：微信云开发客户端 `_db()` 查询会自动注入 `_openid` 过滤，导致排行榜退化为单用户视图。

### 个人榜固定 Top10 结构

- 新增：`pages/ranking/index.js` `padTop10()` — 不足 10 人时补齐空位。
- 空位展示：「等待星辰」+「虚位以待」+ 0 星光。
- 移除个人榜空状态页面。

### 星座榜前三名奖牌设计

- 修改：`pages/ranking/index.wxml` — 星座榜前三名从 👑 皇冠改为 🥇🥈🥉 奖牌，与个人榜风格统一。
- 第 4 名以后保持普通数字排名。

### 撤销星座榜奖牌样式调整

- 修改：`pages/ranking/index.wxml` — 星座榜前三名奖牌（🥇🥈🥉）经过测试视觉效果未达到预期，恢复为原始皇冠 👑 样式。
- 个人榜奖牌设计保持不变。
## v1.3.3

### 修复

#### 1. 修复用户重新进入小程序后状态恢复异常问题

问题描述：

用户删除微信入口后重新搜索进入小程序时，本地 Storage 被清理，但云端用户数据仍然存在。

此前由于 authService 用户恢复流程未完整同步云端字段，导致：

- 每日任务完成状态丢失。
- 用户头像、昵称授权状态丢失。
- 排行榜用户信息需要重新确认授权后才能正常显示。

修复内容：

- 完善 authService._hydrateFromCloud 云端用户数据恢复逻辑。
- 增加每日任务状态字段恢复：
  - lastCheckinDate
  - checkinStreak
  - lastHoroscopeDate
  - lastMatchDate
  - lastExploreDate
  - lastExploreTestDate
  - lastPuzzleDate
- 增加 profileAuthorized 状态恢复。
- 优化首页认证完成后的状态刷新流程。

修复后：

- 删除小程序入口重新进入后，可以恢复用户完整状态。
- 每日任务完成状态保持一致。
- 用户头像昵称无需重复授权。

## v1.3.2

### 修复

#### 1. 修复星座排行榜数据统计不完整问题

问题描述：

星座排行榜与个人排行榜数据来源均为 users 集合，但由于客户端查询分页逻辑问题，部分用户数据未参与星座聚合统计。

表现：

- 个人排行榜存在用户，但对应星座人数显示异常。
- 部分星座人数和星光统计与实际用户数据不一致。

修复内容：

- 优化 cloudLeaderboardService 数据读取逻辑。
- 增加稳定排序保证分页一致性。
- 调整分页读取策略，确保完整读取 users 用户数据。

修复后：

- 星座排行榜人数与 users 数据一致。
- 星座排行榜星光统计与个人数据保持一致。