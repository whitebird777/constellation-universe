# Daily Engine

## 1. 定义

## 2. 输入

## 3. 输出

## 4. 配置规则

## 5. World Integration（V1）

```
Daily Engine
    ↓ 调用
Living World Engine ──→ getWorldState(date)
    ↓ 返回
world: { mood, sky, event, description }
    ↓ 注入
Daily Result
```

未来 Planet、Explore、Timeline 均可读取 `world` 字段。

## 6. 后续扩展
