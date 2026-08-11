# 数据存储架构

## 云数据库权限设计

### users 集合

**Beta 阶段：** 所有用户可读，仅创建者可写。

**原因：** 排行榜需要查询全部用户数据进行聚合。个人榜 `getTop10()` 依赖 `.orderBy('starlight','desc')` 全量扫描，如果权限设为"仅创建者可读写"，微信云开发会自动注入 `_openid` 过滤，导致排行榜退化为只返回当前用户数据。

**正式上线前需审查：**
- 敏感字段（如 openid 本身）不应通过客户端直接暴露给其他用户。
- 建议：拆分公共用户资料集合（`user_profiles`）和私密用户资料（`user_private`），公共集合仅存储排行榜/社交所需的昵称、头像、星座、星光等字段。
- 或使用云函数代理查询，避免客户端直接访问 `users` 集合。

### constellation_stats 集合（已弃用）

排行榜 V2 重构后，星座榜改为从 `users` 集合实时聚合，`constellation_stats` 集合不再被读取。该集合保留但不再更新。

---

## 分层设计

```
Storage Layer（存储层）
    ↑
Service Layer（服务层）
    ↑
Database（数据库 — 未来）
```

### 当前 MVP

- **Storage Layer**：`app.globalData`（临时）
- **Service Layer**：`miniprogram/services/`（接口定义）
- **Database**：微信云开发（CloudBase），`users` + `constellation_stats` 集合

### 迁移路径

1. Service 接口保持不变
2. 仅修改 Service 内部实现
3. 页面和 Engine 无需任何改动
