# IdentityV3_Review.md — 游客身份系统 V3 审计报告

## 修改文件列表

| 文件 | 修改内容 |
|------|----------|
| `services/userService.js` | ① `saveUser()` 移除 openid 守卫 → 所有用户（含游客）均调用 `cloudUserService.syncUser()` |
| `services/userService.js` | ② `pushCloud()` 移除 openid 守卫 → 游客数据可同步云端 |
| `services/userService.js` | ③ `loadUser()` 移除 openid 守卫 → 启动时游客也可触发后台云端同步 |
| `services/identityService.js` | ④ `getIdentity()` wechat 判定移除 `authorized === true` 条件 → 仅以 `profileAuthorized` 判断 |
| `services/cloudUserService.js` | ⑤ `syncUser()` 移除 `openid === 'local-user'` 拦截 → 仅以 `!openid` 判断 |

## 为什么修改

**旧架构问题**：`userService` 的 `saveUser()`、`pushCloud()`、`loadUser()` 三处都检查 `user.openid && user.openid !== 'local-user'`，导致静默登录前的游客完全不会同步云端。没有 users 云端记录 → 游客无法参与排行榜、无法 Cloud First。

**修复**：移除所有 openid 守卫条件。`app.js` 在 `onLaunch` 时调用 `silentLoginOnLaunch()` 已经通过 `_doSilentLogin()` 拿到真实 openid 并写入了 Storage。当后续任何 `saveUser()` 被调用时，openid 已经在 user 对象中，`cloudUserService.syncUser()` 会触发 `exists` 检查 → 不存在则 CREATE，存在则 UPDATE。

## 新的数据流

```
App.onLaunch
  ↓
silentLoginOnLaunch()
  ↓
ensureWechatIdentity() → wx.login → 云函数 login → 真实 openid
  ↓
userService.saveUser({ openid, id: openid })
  ↓
cloudUserService.syncUser(user)     ← V3：游客也同步
  ↓
cloudUserService.saveUser(user)
  ├ exists(openid) === false  →  createUser(user)   [首次 CREATE]
  └ exists(openid) === true   →  updateUser(openid)  [后续 UPDATE]
  ↓
users 集合文档:
  {
    openid: "oXXXX...",
    nickname: "未命名旅行者",
    avatar: "",
    authorized: false,
    profileAuthorized: false,
    birthday: "",
    constellation: "",
    starlight: 0,
    ...
  }
```

## 游客生命周期

```
1. 首次打开小程序
   → App 静默 login → 获得 openid
   → userService.saveUser({ openid }) → 同步云端 CREATE
   → Storage: { openid:"oXXX", nickname:"未命名旅行者", authorized:false, profileAuthorized:false }
   → identity: guest
   
2. 创建星球（生日 → 星座 → 星球）
   → saveUser({ birthday })  → 云端 UPDATE
   → saveUser({ constellation }) → 云端 UPDATE
   → 进入 planet → saveUser({ joinDate, lastActive }) → 云端 UPDATE
   
3. 游玩（星光、农场、timeline）
   → saveUser({ starlight })  → 云端 UPDATE
   → 排行榜可见（以 openid 为依据）
   
4. 身份认证（可选）
   → loginWithWechat() → getUserProfile + openid
   → _bindProfileAndOpenId → saveUser({ nickname, avatar, authorized:true, profileAuthorized:true })
   → 云端 UPDATE（不 CREATE）
   → identity: wechat
```

## 微信用户生命周期

```
1. 已经是游客（拥有 openid + 数据）
   ↓
2. 点击「身份认证」
   → identityUpgradeService.upgradeIdentity()
   → authService.loginWithWechat()
   → getUserProfile(弹窗) + 静默 login
   → _bindProfileAndOpenId(nickname, avatar)
   → userService.saveUser({ nickname, avatar, authorized:true, profileAuthorized:true })
   → 云端 UPDATE（同一个 openid，不会 CREATE）
   ↓
3. 身份升级完成
   → identity: wechat
   → 所有数据保留（birthday/constellation/starlight/planet/farm/timeline）
   → 排行榜显示昵称和头像
```

## 为什么这样设计

1. **openid 是唯一标识**：无论游客还是微信用户，都以 openid 标识。`authorized` / `profileAuthorized` 只表示是否完成了资料授权，不表示"是否是用户"。

2. **Cloud First**：游客第一条记录就进入云端。Storage 是缓存，Cloud 是唯一真实数据源。

3. **身份认证不创建新记录**：`cloudUserService.saveUser()` 使用 upsert 逻辑（exists → UPDATE, !exists → CREATE）。同一个 openid 永远不会创建第二条记录。

4. **解耦授权与创建**：`authorized` 不是身份门槛，是资料丰富度标记。排行榜、成长、星光均以 openid 为依据。

## 是否影响微信审核

**不影响**。`wx.login` 静默获取 openid 不需要用户授权，微信审核允许。`getUserProfile` 仅在用户主动点击「身份认证」时触发，符合微信规范。

## 是否兼容旧数据

**兼容**。`_readCache()` 中的兼容逻辑保持不变：
- 旧缓存缺少 `profileAuthorized` 字段时自动补 `false`
- 旧缓存中已有非默认昵称/头像时，`profileAuthorized` 自动推断为 `true`
- `cloudUserService.syncUser()` 中的 upsert 逻辑不变

## 是否兼容 Cloud First

**完全兼容**。`userService` 和 `cloudUserService` 的 Cloud First 架构保持不变。唯一变化是移除了 openid 守卫，让游客也能享受 Cloud First。
