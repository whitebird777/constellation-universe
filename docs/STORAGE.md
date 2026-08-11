# Storage

## 1. Storage 简介

## 2. Storage API

## 3. Storage Key

## 4. Storage Key Naming Rules

- 所有 Storage Key 必须统一在 `utils/storage.js` 中定义。
- 页面、Engine、Service 禁止直接写 Key 字符串。
- 新增 Key 必须同步更新 `STORAGE.md`。
- Key 名称全部使用大写常量（如 `USER`、`PLANET`、`TIMELINE`）。
- 后续数据库字段尽量与 Storage Key 保持一致，降低迁移成本。

### 当前 Key 清单

| 常量 | 值 | 说明 |
|------|-----|------|
| `KEYS.USER` | `"user"` | 用户数据 |
| `KEYS.PLANET` | `"planet"` | 星球数据 |
| `KEYS.TIMELINE` | `"timeline"` | Timeline 数据 |

## 4. 数据生命周期

## 5. 后续数据库迁移

## 6. 开发规范
