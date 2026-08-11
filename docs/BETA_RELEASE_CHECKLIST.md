# Beta 上线前代码审计整改计划

> 基于 Codex 5.6 只读审计结果。本文档覆盖 V4 身份系统、排行榜、头像、隐私等关键模块。

---

## 第一部分：必须 Beta 上线前修复

### 1.1 `wx.getUserProfile` 回收兼容

| 项目 | 内容 |
|------|------|
| **问题描述** | `authService.loginWithWechat()` 仍调用 `wx.getUserProfile()`。微信已回收该接口，返回值中 `nickName` 固定为 "微信用户"、`avatarUrl` 为默认头像 |
| **来源文件** | `services/authService.js` 第 282-310 行 |
| **风险等级** | 🔴 高（审核风险 + 用户体验） |
| **修复方案** | 资料页已改用 `chooseAvatar` + `type="nickname"`。`loginWithWechat()` 保留用于兼容旧调用链，但不再作为新用户资料入口。正式发布前需将首页 CTA 与 `loginWithWechat` 解耦确认完毕 |
| **影响架构** | 否——资料获取已切换至新方案 |

### 1.2 个人排行榜头像跨用户可见

| 项目 | 内容 |
|------|------|
| **问题描述** | 用户头像存为 `cloud://` 文件 ID，客户端直接使用该地址无法被其他用户看到 |
| **来源文件** | `services/cloudPersonalLeaderboardService.js`、`cloudfunctions/getAvatarUrls/` |
| **风险等级** | 🔴 高（核心功能异常） |
| **修复方案** | 已新增 `getAvatarUrls` 云函数 + `_resolveAvatars()` 批量转换。需验证云函数已部署、排行榜 Console 出现 `[RESOLVE AVATARS]` 日志 |
| **影响架构** | 否——新增云函数，不改变数据模型 |

### 1.3 数据库 `users` 集合权限

| 项目 | 内容 |
|------|------|
| **问题描述** | 权限需设为「所有用户可读，仅创建者可写」，否则排行榜只能看到自己的数据 |
| **来源文件** | 云开发控制台 → 数据库 → users → 权限设置 |
| **风险等级** | 🔴 高（排行榜退化为单用户视图） |
| **修复方案** | 控制台中调整权限。已验证生效 |
| **影响架构** | 否 |

### 1.4 隐私保护指引

| 项目 | 内容 |
|------|------|
| **问题描述** | 微信审核要求小程序包含隐私说明。设置页已新增弹窗，需检查隐私文本与实际数据收集一致 |
| **来源文件** | `pages/settings/index.wxml` 隐私弹窗内容 |
| **风险等级** | 🟡 中（审核风险） |
| **修复方案** | 已实现。上线前确认弹窗内容与 `app.json` 隐私配置一致 |
| **影响架构** | 否 |

### 1.5 `navigationBarTitleText` 配置

| 项目 | 内容 |
|------|------|
| **问题描述** | 需确认为 "星座宇宙" 而非 "云开发 QuickStart" |
| **来源文件** | `app.json` |
| **风险等级** | 🟡 中（审核风险） |
| **修复方案** | 已确认为 "星座宇宙" |
| **影响架构** | 否 |

---

## 第二部分：Beta 后优化

### 2.1 `constellation_stats` 集合清理

| 项目 | 内容 |
|------|------|
| **当前暂缓原因** | 星座榜已改为从 `users` 实时聚合，旧集合不影响功能 |
| **未来处理** | Beta 稳定后删除或归档该集合 |

### 2.2 排行榜 `getMyRank()` 全量扫描

| 项目 | 内容 |
|------|------|
| **当前暂缓原因** | 当前用户量小（<100），`orderBy('starlight').get()` 全量扫描无性能问题 |
| **未来处理** | 用户量 >1000 时改为云函数聚合或增加索引 |

### 2.3 `constellation_stats` 非原子写入

| 项目 | 内容 |
|------|------|
| **当前暂缓原因** | 星座榜已不再依赖 `constellation_stats`，该集合仅保留不更新 |
| **未来处理** | 如果需要恢复使用，改为 `_.inc()` 原子操作 |

### 2.4 防刷星光机制

| 项目 | 内容 |
|------|------|
| **当前暂缓原因** | Beta 阶段内测用户有限 |
| **未来处理** | 增加每日操作次数限制、异常行为检测 |

---

## 第三部分：已完成清理

### 3.1 资料页重构

- ✅ 首页弹窗 → 独立页面 `pages/profile/edit/`
- ✅ 资料完善流程不再调用 `wx.getUserProfile`
- ✅ 使用 `button open-type="chooseAvatar"` + `input type="nickname"`
- ✅ 头像上传至云存储 (`wx.cloud.uploadFile`)

### 3.2 头像 Cloud ID 持久化

- ✅ 用户选择头像后立即上传云存储
- ✅ 数据库存储 `cloud://` 永久地址而非 `wxfile://` 临时路径
- ✅ 排行榜通过 `getAvatarUrls` 云函数转换为可访问 HTTPS URL

### 3.3 身份系统 V4

- ✅ `hasBoundWechat` — 微信 openid 绑定状态
- ✅ `profileAuthorized` — 资料完善状态
- ✅ 三段式身份：guest → guest_resident → wechat
- ✅ `userService._readCache()` 迁移逻辑不再以 `authorized` 推断 `profileAuthorized`

### 3.4 星座榜数据源切换

- ✅ 从 `constellation_stats` 切换到 `users` 实时聚合
- ✅ 无需维护双写一致性

### 3.5 个人榜固定 Top10

- ✅ `padTop10()` 补齐空位
- ✅ 前三名金银铜奖牌

### 3.6 设置页

- ✅ 问题反馈弹窗
- ✅ 隐私保护指引弹窗
- ✅ Reset 移至最底部独立卡片

### 3.7 探索限制重置入口

- ✅ 已在设置页增加「重置探索限制」调试入口

### 3.8 旧测试入口清理

- ✅ 删除设置页「清空星座榜数据」按钮
- ✅ `resetUniverseService` 移除 `resetAllStats()` 调用

---

## 第四部分：上线发布流程

### 4.1 审核通过后

1. **清理测试用户数据**
   - 云开发控制台删除测试 openid 对应的 `users` 记录
   - 重置 `constellation_stats` 所有字段为 0（如果需要）

2. **检查数据库**
   - 确认 `users` 集合权限为「所有用户可读，仅创建者可写」
   - 确认无 `wxfile://` 残留的 avatar 字段

3. **检查云函数**
   - `login` — 已部署
   - `getAvatarUrls` — 需确认部署状态
   - ~~`quickstartFunctions`~~ — 已删除（微信示例，无业务引用）

4. **检查隐私配置**
   - 微信公众平台 → 小程序管理 → 用户隐私保护指引
   - 确认与设置页弹窗内容一致

5. **发布正式版本**
   - 上传代码 → 提交审核
   - `app.json` `navigationBarTitleText` 确认为 "星座宇宙"
   - 版本号标记为 1.0.0
