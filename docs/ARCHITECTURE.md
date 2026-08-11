# StarUniverse Architecture

## 1. 项目总体架构（Overview）

## 2. 目录结构（Directory Structure）

## 3. 分层架构（Application / Controller / Service / Engine / Storage）

```
Page（展示 + 交互）
  │
  ▼
Controller（协调）         ← 新增
  ├────────► Service ────► Storage
  │
  └────────► Engine

Page 只负责：生命周期 → 交互 → setData() → 页面跳转
```

## 4. Engine 体系（Engine System）

### Engine Input Principle

- Engine 永远不直接访问 Storage。
- Engine 永远不读取 Service。
- Engine 只接收调用方传入的数据。
- Engine 必须保持纯函数（Pure Function）设计。
- 同样的输入必须得到同样的输出。

## 5. Service 体系（Service Layer）

> Service 负责数据；Engine 负责规则；Page 负责展示。

### Page Responsibility

页面只允许负责：

- 页面生命周期（`onLoad` / `onShow` 等）
- 用户交互（点击、滑动等）
- 调用 Service 获取数据
- 调用 Engine 获取计算结果
- 更新页面 `data`

页面禁止：

- 在 Page 中实现业务规则
- 在 Page 中直接操作 Storage
- 在 Page 中直接访问数据库
- 在 Page 中写复杂计算逻辑

## 6. Repository（Future）

## 7. Database（Future）

## 8. 数据流（Data Flow）

### Standard Data Flow

两条数据流，职责分离，禁止混用：

**数据流（Data Flow）— 负责数据获取、保存、持久化：**

```
Page → Service → Storage → Database (Future)
```

**规则流（Rule Flow）— 负责规则计算、状态转换、业务逻辑：**

```
Page → Engine → Result → Page
```

| 流 | 路径 | 职责 |
|------|------|------|
| 数据流 | Page → Service → Storage | 读取、保存、持久化 |
| 规则流 | Page → Engine → Result | 计算、转换、业务逻辑 |

### 层间调用关系

```
Page
 │
 ├──► Service
 │        │
 │        ▼
 │     Storage
 │
 └──► Engine
```

**禁止的跨层调用：**

```
Page ─────► Storage    ❌
Page ─────► Database   ❌
Engine ───► Storage    ❌
Engine ───► Service    ❌
Service ──► Engine     ❌
```

## 9. 开发流程（Development Workflow）

## 10. 后续扩展（Future）
