# Service Architecture

## 1. 为什么需要 Service Layer

## 2. 目录结构

## 3. Service 职责

## 4. 页面调用规范

## 5. 未来数据库迁移

## 6. Storage Adapter

```
Service Layer
    ↓
Storage Adapter（utils/storage.js）
    ↓
wx Storage（当前）
    ↓
Database（未来）
```

> 目前所有数据先经过 Storage Adapter。以后迁移数据库，仅修改 Adapter，调用方无感知。

## 7. 开发原则
