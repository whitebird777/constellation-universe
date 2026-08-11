/**
 * userService.js — 用户服务层 V2
 *
 * Cloud First 架构：
 *   loadUser()  → Storage 缓存优先 + 后台云端同步
 *   saveUser()  → 写 Storage 缓存 + 异步 pushCloud
 *   pushCloud() → cloudUserService.syncUser()
 *
 * Storage = 缓存 | Cloud = 唯一真实数据源
 */

var storage = require('../utils/storage');
var cloudUserService = require('./cloudUserService.js');

/** Reset 后递增，使 reset 前启动的 loadUser 异步回调全部失效 */
var userEpoch = 0;

var DEFAULT_USER_V2 = {
  id: 'local-user', nickname: '未命名旅行者', avatar: '',
  openid: '', unionid: '', authorized: false, profileAuthorized: false,
  hasBoundWechat: false,
  status: 'guest',
  birthday: '', constellation: '', starlight: 0,
  joinDate: '', lastActive: '', growthDays: 0, version: 2
};

function invalidateUserSession() {
  userEpoch++;
}

function _isV1(u) { return u && u.version === undefined; }

function _migrateV2(old) {
  var m = {
    id: 'local-user', nickname: '未命名旅行者', avatar: '',
    openid: '', unionid: '', authorized: false, profileAuthorized: false,
    hasBoundWechat: false,
    status: (old.birthday || old.constellation) ? 'active' : 'guest',
    birthday: old.birthday || '', constellation: old.constellation || '',
    starlight: 0, joinDate: '', lastActive: '', growthDays: 0, version: 2
  };
  storage.set(storage.KEYS.USER, m);
  console.log('[Storage] Migrated V1 -> V2');
  return m;
}

function _readCache() {
  console.log('[USR-CACHE] _readCache enter');
  var u = storage.get(storage.KEYS.USER);
  if (_isV1(u)) {
    return _migrateV2(u);
  }
  if (u) {
    // 防御：有 birthday 但无 openid 且 id 异常 → 回退游客
    if (u.birthday && !u.openid && u.id && u.id !== 'local-user') {
      console.warn('[Guard] Illegal state: birthday without openid — reset guest');
      storage.remove(storage.KEYS.USER);
      return Object.assign({}, DEFAULT_USER_V2);
    }
    // 兼容旧缓存：缺 profileAuthorized 字段时，仅凭真实资料信息推断
    // V4：不再以 authorized 推断 profileAuthorized（会导致未授权用户被误标）
    if (u.profileAuthorized === undefined) {
      var looksAuthed = !!(u.avatar || (u.nickname && u.nickname !== '未命名旅行者' && u.nickname !== '微信用户'));
      u.profileAuthorized = looksAuthed;
    }
    return u;
  }
  return Object.assign({}, DEFAULT_USER_V2);
}

function _writeCache(u) {
  u.version = 2;
  storage.set(storage.KEYS.USER, u);
}

/**
 * 加载用户：缓存优先 + 后台云端同步
 */
function loadUser() {
  var currentEpoch = userEpoch;
  var user = _readCache();

  // 后台同步云端（不阻塞用户进入）
  cloudUserService.syncUser(user).then(function () {
    if (currentEpoch !== userEpoch) {
      console.log('[LOAD USER] stale callback ignored');
      return null;
    }
    return cloudUserService.getUser(user.openid);
  }).then(function (cloudUser) {
      if (currentEpoch !== userEpoch) {
        console.log('[LOAD USER] stale callback ignored');
        return;
      }
      if (!cloudUser) return;
      var changed = false;

      // 昵称变化 → 自动同步
      if (cloudUser.nickname && cloudUser.nickname !== user.nickname && cloudUser.nickname !== '微信用户') {
        user.nickname = cloudUser.nickname; changed = true;
      }
      // 头像变化
      if (cloudUser.avatar && cloudUser.avatar !== user.avatar) {
        user.avatar = cloudUser.avatar; changed = true;
      }
      // 星光变化（云字段 starlight）
      if (cloudUser.starlight !== undefined && cloudUser.starlight !== user.starlight) {
        user.starlight = cloudUser.starlight; changed = true;
      }
      if (cloudUser.growthDays !== undefined && cloudUser.growthDays !== user.growthDays) {
        user.growthDays = cloudUser.growthDays; changed = true;
      }
      // 每日任务日期字段 — 云端同步到本地，防止 Storage 丢失后重复领取
      if (cloudUser.lastCheckinDate !== undefined && cloudUser.lastCheckinDate !== user.lastCheckinDate) {
        user.lastCheckinDate = cloudUser.lastCheckinDate; changed = true;
      }
      if (cloudUser.lastHoroscopeDate !== undefined && cloudUser.lastHoroscopeDate !== user.lastHoroscopeDate) {
        user.lastHoroscopeDate = cloudUser.lastHoroscopeDate; changed = true;
      }
      if (cloudUser.lastMatchDate !== undefined && cloudUser.lastMatchDate !== user.lastMatchDate) {
        user.lastMatchDate = cloudUser.lastMatchDate; changed = true;
      }
      if (cloudUser.lastExploreDate !== undefined && cloudUser.lastExploreDate !== user.lastExploreDate) {
        user.lastExploreDate = cloudUser.lastExploreDate; changed = true;
      }
      if (cloudUser.lastExploreTestDate !== undefined && cloudUser.lastExploreTestDate !== user.lastExploreTestDate) {
        user.lastExploreTestDate = cloudUser.lastExploreTestDate; changed = true;
      }
      if (cloudUser.lastPuzzleDate !== undefined && cloudUser.lastPuzzleDate !== user.lastPuzzleDate) {
        user.lastPuzzleDate = cloudUser.lastPuzzleDate; changed = true;
      }

      if (changed) {
        if (currentEpoch === userEpoch) {
          _writeCache(user);
        } else {
          console.log('[LOAD USER] stale callback ignored');
        }
      }
    }).catch(function (err) {
      if (currentEpoch !== userEpoch) {
        console.log('[LOAD USER] stale callback ignored');
        return;
      }
      console.error('[Cloud] Background sync failed:', err);
    });

  return user;
}

/**
 * 获取当前用户（同步，仅返回缓存）
 */
function getUser() {
  return _readCache();
}

/**
 * 保存用户到缓存 + 异步推送云端
 */
function saveUser(data) {
  var user = getUser();
  var fields = ['id','nickname','avatar','openid','unionid','authorized',
    'profileAuthorized','hasBoundWechat','status',
    'birthday','constellation','starlight','joinDate','lastActive','growthDays',
    'lastCheckinDate','checkinStreak',
    'lastHoroscopeDate','lastMatchDate','lastExploreDate','lastExploreTestDate','lastPuzzleDate'];
  for (var i=0;i<fields.length;i++) { var k=fields[i]; if(data[k]!==undefined) user[k]=data[k]; }

  // V3 状态同步（与 identityService 一致）
  if (user.profileAuthorized === true) {
    user.status = 'active';
  } else if (user.birthday) {
    user.status = 'active';
  } else {
    user.status = 'guest';
  }

  _writeCache(user);

  // V3：所有用户（含游客）均同步云端，openid 已在启动时获取
  cloudUserService.syncUser(user);

  // onLaunch 期间 getApp 可能尚未可用，必须兜底
  try {
    var app = getApp();
    if (app && app.globalData) {
      app.globalData.birthday = user.birthday;
      app.globalData.constellation = user.constellation;
      if (user.openid) app.globalData.openid = user.openid;
    }
  } catch (e) {}
}

/**
 * 推送本地变更到云端（供外部调用）
 */
function pushCloud() {
  var user = _readCache();
  cloudUserService.syncUser(user);
}

module.exports = {
  loadUser: loadUser,
  getUser: getUser,
  saveUser: saveUser,
  pushCloud: pushCloud,
  invalidateUserSession: invalidateUserSession
};
