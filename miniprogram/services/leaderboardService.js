/**
 * leaderboardService.js — 十二星宫联盟 Service
 * 数据源已迁移至云数据库 constellation_stats。
 * 产品文案：星光（代码字段 starlight 兼容云库）。
 */
var cloudLB = require('./cloudLeaderboardService.js');
var cloudPersonal = require('./cloudPersonalLeaderboardService.js');
var cloudUserService = require('./cloudUserService.js');
var authService = require('./authService.js');
var storage = require('../utils/storage.js');

// 首次调用时自动初始化云数据库
var _initialized = false;
function _ensureInit() {
  if (!_initialized) {
    _initialized = true;
    cloudLB.init().then(function (r) {
      if (r && !r.initialized && r.error) {
        _initialized = false;
      }
    });
  }
}

function getLeaderboard() {
  _ensureInit();
  return cloudLB.getLeaderboard();
}

/**
 * 增加星光：星座联盟云表 +（可选）仅联盟侧
 * 个人星光由 farmService / userService 统一维护，避免重复累加。
 * 若调用方已写个人缓存，可传 opts.skipPersonal = true（默认跳过个人，仅写联盟）。
 *
 * 兼容旧调用：addStarLight(name, amount) 只更新联盟；
 * 个人榜请先 userService.saveUser({ starlight }) 再 pushCloud。
 */
function addStarLight(name, amount) {
  if (!amount || amount <= 0) return Promise.resolve(0);
  _ensureInit();
  return cloudLB.addStarlight(name, amount);
}

/**
 * 同步个人星光到云 users 表（修复个人榜不更新）
 */
function syncPersonalStarlight(openid, starlight) {
  if (!openid || openid === 'local-user') {
    return Promise.resolve({ success: false });
  }
  return cloudUserService.updateUser(openid, {
    starlight: starlight || 0,
    updatedAt: new Date()
  });
}

function getTotalStarLight() {
  return getLeaderboard().then(function (d) { return d.totalStarlight; });
}

function joinLeague(name) {
  if (storage.get(storage.KEYS.JOINED_LEAGUE)) return { joined: false };
  _ensureInit();
  cloudLB.joinLeague(name);
  storage.set(storage.KEYS.JOINED_LEAGUE, true);
  return { joined: true, constellation: name };
}

function leaveLeague(name) {
  if (!storage.get(storage.KEYS.JOINED_LEAGUE)) return { left: false };
  cloudLB.leaveLeague(name);
  storage.remove(storage.KEYS.JOINED_LEAGUE);
  return { left: true };
}

/* ====== 个人排行榜（云数据库） ====== */

function joinPersonalLeaderboard(name) {
  // 个人资料已在 cloudUserService.createUser 时创建
  // 此处仅保留接口兼容，不再写本地 Storage
  return { joined: true, constellation: name };
}

function getPersonalLeaderboard() {
  return cloudPersonal.getTop10();
}

function getMyRank() {
  return cloudPersonal.getMyRank(authService.getUserId());
}

module.exports = {
  getLeaderboard: getLeaderboard,
  joinLeague: joinLeague,
  leaveLeague: leaveLeague,
  addStarLight: addStarLight,
  getTotalStarLight: getTotalStarLight,
  joinPersonalLeaderboard: joinPersonalLeaderboard,
  getPersonalLeaderboard: getPersonalLeaderboard,
  getMyRank: getMyRank,
  syncPersonalStarlight: syncPersonalStarlight
};
