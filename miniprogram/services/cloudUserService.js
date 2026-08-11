/**
 * cloudUserService.js — Cloud User Service
 *
 * 统一管理 users 集合的 CRUD 操作。
 * 整个项目禁止直接访问 wx.cloud.database()。
 * 所有云用户操作必须经过本 Service。
 */

var CLOUD = require('../utils/cloudConfig.js').CLOUD;
var db = null;
var inFlight = {};
/** Reset 删除后的 openid 禁止 sync/create，直到重新授权 unblock */
var blockedOpenids = {};

function _db() {
  if (!db) db = wx.cloud.database();
  return db;
}

function blockUser(openid) {
  if (openid) {
    blockedOpenids[openid] = true;
    delete inFlight[openid];
  }
}

function unblockUser(openid) {
  if (openid) {
    delete blockedOpenids[openid];
  }
}

function _error(method, err) {
  console.error('[CloudUserService] ' + method + ' failed:', err);
  return { success: false, error: err };
}

/**
 * 根据 openid 查询用户
 * @param {string} openid
 * @returns {object|null} 用户对象，不存在返回 null
 */
function getUser(openid) {
  try {
    return _db().collection(CLOUD.USERS).where({ openid: openid }).get()
      .then(function (res) {
        return res.data && res.data.length > 0 ? res.data[0] : null;
      })
      .catch(function (err) { return _error('getUser', err); });
  } catch (e) {
    return Promise.resolve(_error('getUser', e));
  }
}

/**
 * 新增用户
 * @param {object} user
 * @returns {{ success: boolean, id?: string }}
 */
function createUser(user) {
  try {
    return _db().collection(CLOUD.USERS).add({ data: user })
      .then(function (res) {
        return { success: true, id: res._id };
      })
      .catch(function (err) { return _error('createUser', err); });
  } catch (e) {
    return Promise.resolve(_error('createUser', e));
  }
}

function updateUser(openid, data) {
  try {
    return _db().collection(CLOUD.USERS).where({ openid: openid }).update({ data: data })
      .then(function () {
        return { success: true };
      })
      .catch(function (err) { return _error('updateUser', err); });
  } catch (e) {
    return Promise.resolve(_error('updateUser', e));
  }
}

/**
 * 保存用户（存在则更新，不存在则创建）
 * @param {object} user — 必须包含 openid
 * @returns {{ success: boolean, id?: string, created?: boolean }}
 */
function saveUser(user) {
  // 拦截已进入 inFlight 的旧 sync：reset 后禁止 create/update
  if (user && user.openid && blockedOpenids[user.openid]) {
    return Promise.resolve(null);
  }
  return exists(user.openid).then(function (exists) {
    if (user && user.openid && blockedOpenids[user.openid]) {
      return null;
    }
    if (exists) {
      return updateUser(user.openid, user).then(function () {
        return { success: true, created: false };
      });
    } else {
      return createUser(user).then(function (res) {
        return { success: res.success, id: res.id, created: true };
      });
    }
  });
}

/**
 * 判断用户是否存在
 * @param {string} openid
 * @returns {boolean}
 */
function exists(openid) {
  try {
    return _db().collection(CLOUD.USERS).where({ openid: openid }).count()
      .then(function (res) { return res.total > 0; })
      .catch(function () { return false; });
  } catch (e) {
    return Promise.resolve(false);
  }
}

/**
 * 统一同步用户数据到云（存在则更新，不存在则创建）
 * 这是唯一应该被 Controller 调用的云保存方法。
 */
function syncUser(user) {
  var syncId = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  var openid = user && user.openid;

  if (user && blockedOpenids[user.openid]) {
    return Promise.resolve(null);
  }

  if (!openid) {
    return Promise.resolve({ success: false, reason: 'no openid' });
  }

  // 防并发：同一个 openid 正在同步，直接返回已有 Promise
  if (inFlight[openid]) {
    return inFlight[openid];
  }

  var promise = saveUser(user).then(function (res) {
    if (!res) {
      return res;
    }
    return res;
  }).catch(function (err) {
    console.error('[SYNC FAIL]', syncId, err);
    return { success: false, error: err };
  });

  // finally 总是清除（兼容低版本 JS，用 then + catch 模拟）
  var cleanup = function () { delete inFlight[openid]; };
  promise.then(cleanup, cleanup);

  inFlight[openid] = promise;
  return promise;
}

/** 删除用户文档。容错：removed=0 也视为成功，不抛错。 */
function deleteUser(openid) {
  if (!openid || openid === 'local-user') {
    return Promise.resolve({ success: true, removed: 0 });
  }
  return _db().collection(CLOUD.USERS).where({ openid: openid }).remove()
    .then(function (res) {
      var removed = (res && res.stats) ? res.stats.removed : 0;
      if (removed === 0) {
        return { success: true, removed: 0, message: 'already removed' };
      }
      return { success: true, removed: removed };
    })
    .catch(function (err) {
      console.error('[DELETE USER] error:', err);
      return { success: false, error: err ? err.message : 'unknown' };
    });
}

module.exports = {
  getUser: getUser, createUser: createUser, updateUser: updateUser,
  saveUser: saveUser, exists: exists, syncUser: syncUser, deleteUser: deleteUser,
  unblockUser: unblockUser
};
