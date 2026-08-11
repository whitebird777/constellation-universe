# StarUniverse 项目文档

## Product Rule

任何新功能，在开发之前，必须先回答：

**它属于 User、Planet、Universe 三个领域之一。**

| 领域 | 定义 | 示例 |
|------|------|------|
| **User** | 用户自身的身份、数据、状态 | 生日、星座、偏好 |
| **Planet** | 用户拥有的星球及其内部变化 | 星球成长、装饰、事件 |
| **Universe** | 全局共享的世界、社交与发现 | 排行榜、拜访、全局事件 |
| **Living World** | 整个世界自然运行规则 | 天气、自然、生物、天空、季节、神秘事件 |

## Application Architecture

```
Application Layer（页面层）
    │  pages/
    ↓
Service Layer（服务层）
    │  services/
    ↓
Engine Layer（引擎层）
    │  utils/
    ↓
Storage Layer（存储层）
       app.globalData → 未来 Database
```

| 层级 | 目录 | 职责 |
|------|------|------|
| Application | `pages/` | 页面渲染、用户交互、事件绑定 |
| Service | `services/` | 数据读写封装、接口定义 |
| Engine | `utils/` | 纯函数逻辑、计算、转换 |
| Storage | `app.globalData` | 数据持久化（临时）→ Database（未来） |

## Development Principle

系统能力一旦建立，应保持稳定。任何破坏已有架构的修改，都必须经过评估后执行。

---

## AI Development Rules（V1）

> 后续所有 AI 开发均遵循本规范。

### Rule 1：MVP First

任何新增功能必须优先保证产品可以上线验证。

**禁止：**
- 为了"未来可能用到"而增加复杂系统
- 一次性开发大量功能
- 未经验证的大规模重构

所有开发均以 MVP 为原则。

### Rule 2：微信审核优先

任何新增功能必须首先确认符合微信小程序审核规范。

**禁止增加：**
- 赌博玩法 / 赌博暗示
- 虚拟货币交易
- 裂变诱导
- 分享强制
- 广告欺诈
- 现金收益承诺

如存在风险，必须先调整产品设计。

### Rule 3：禁止无关修改

新增功能时，只允许修改相关模块。

**禁止**为了优化代码风格而修改无关文件。

例如新增 Farm：
- ✅ 允许修改：`farmEngine` / `farmService` / `planetController`
- ❌ 禁止顺便重写：`authService` / `leaderboardService` / `cloudUserService`

（除非明确提出需求。）

### Rule 4：必须保持兼容

任何修改必须保证旧用户数据：不丢失、自动迁移、Storage 兼容、Cloud 兼容。

**禁止**直接修改已有数据结构。

### Rule 5：新增功能必须回归测试

每完成一个功能，必须验证以下全部正常：

```
① 首页      ② 微信授权    ③ 我的星球   ④ 排行榜    ⑤ 云同步
⑥ Timeline  ⑦ 关于页      ⑧ 设置       ⑨ Storage   ⑩ Cloud
```

不得只测试新增页面。

### Rule 6：防御式编程

所有 Storage / Cloud / API / Engine / Controller 的输入数据均视为**可能为空**。

所有读取必须进行：Null Check / Undefined Check / NaN Check / 默认值兜底。

**禁止**直接 `item.icon`，必须先 `if (item)` 再读取。

### Rule 7：统一架构

所有业务必须遵守：

```
Page → Controller → Service → Engine → Storage / Cloud
```

**禁止** Page 直接操作数据库。

### Rule 8：新增功能必须可关闭

任何新玩法必须能够一键关闭（如 `enableFarm = false`）。

**禁止**把玩法写死。

### Rule 9：每次提交必须输出

修改完成后 AI 必须输出：

| 项目 | 内容 |
|------|------|
| 修改文件 | 列出所有变更文件 |
| 修改原因 | 为什么改 |
| 风险 | 可能影响什么 |
| 回归测试项 | 需要验证哪些功能 |
| 是否影响审核 | 是否涉及微信规范 |
| 是否影响云数据库 | Schema 变更 etc |
| 是否影响旧用户 | 迁移成本 |

**禁止**只说"完成。"

### Rule 10：Beta 优先

所有开发都以尽快上线 Beta、验证市场为目标。

**禁止**无限增加功能。
