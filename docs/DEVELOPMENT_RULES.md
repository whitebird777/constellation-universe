# Development Rules

## 1. Engine 修改规则

任何已经存在的 Engine：

- timeEngine
- growthEngine
- dailyEngine
- interactionEngine

如果需要修改接口、数据结构或核心逻辑：

**必须先创建 Issue。**

未经确认，不直接破坏已有设计。

## 2. 向后兼容原则

新增功能优先扩展。

不要轻易修改已有接口。

## 3. MVP 原则

功能优先保证可运行。

不要提前实现未来版本能力。

## 4. 文档同步原则

任何代码变更，必须同步：

- CHANGELOG.md
- SPRINT.md

涉及架构变更，同步：

- PROJECT.md
- 相关 SPEC 文档。

## 5. 问题记录原则

发现问题，优先记录 Known Issue，不要隐藏问题。

## 6. Sprint 完成原则（Rule-006）

任何 Sprint 完成后，必须进入 MVP Review，禁止无限增加功能而跳过体验验证。

产品必须经过完整体验验证后才能进入下一阶段开发。

## 7. Engine 复用原则（Rule-007）

优先复用已有 Engine。只有当现有 Engine 无法满足需求时，才允许新增新的 Engine。

新增 Engine 时，必须说明为什么不能扩展已有 Engine。

## 8. Service 单一职责原则（Rule-008）

每个 Service 只负责本领域的数据读写与数据迁移，不承担业务计算。

所有业务规则应放在 Engine 中，页面仅负责展示与交互。

```
Service → 数据
Engine  → 规则
Page    → 展示
```

## 9. Storage Key 唯一来源原则（Rule-009）

项目中所有持久化 Key 必须统一定义于 Storage Adapter（`utils/storage.js`），禁止在业务代码中出现重复字符串。

## 10. Page 轻量化原则（Rule-010）

页面应保持轻量，仅负责组织数据与展示，不承担业务计算和数据持久化职责。

## 11. 数据流唯一原则（Rule-011）

所有持久化数据必须经过 Service；所有业务计算必须经过 Engine；Page 不得绕过任何一层直接访问底层。

## 12. Engine 纯函数原则（Rule-012）

Engine 不依赖页面、Storage、Service 或全局状态，只依赖输入参数进行计算，保证可测试、可复用、可预测。

## 13. 禁止跨层调用原则（Rule-013）

任何一层只能调用相邻层，不允许跨层访问。

| 层 | 允许调用 | 禁止调用 |
|------|---------|---------|
| **Page** | Service、Engine | Storage、Database |
| **Service** | Storage | Page、Engine |
| **Engine** | 无（纯函数） | Service、Storage、Page |
| **Storage** | 无（纯读写） | 任何上层（不包含业务逻辑） |

## 14. Controller 协调原则（Rule-014）

Controller 负责组织页面流程与协调多个 Service/Engine；不得承载业务规则，不得直接操作 Storage；业务规则仍归 Engine，数据读写仍归 Service。

## 15. 体验价值原则（Rule-015）

每新增一个功能，都必须能够回答：**它为用户增加了什么体验价值？**

如果无法回答，则不应进入 MVP。
