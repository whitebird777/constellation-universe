/**
 * authService.js — Authorization Service V5
 *
 * 两套能力，职责分离：
 *
 * 1) ensureWechatIdentity()
 *    静默拿 openid（不弹窗）
 *    用途：App 启动恢复老用户、生日/星座页兜底
 *
 * 2) loginWithWechat()  ★ 创建星球主路径
 *    必须在用户点击的同步调用栈中调用
 *    流程：
 *      wx.getUserProfile（弹出微信授权）
 *        → wx.login + 云函数 login（openid）
 *        → 保存 nickname/avatar/openid
 *        → 标记 profileAuthorized = true
 *
 * 重要约束：
 *   - getUserProfile 前面不能有 await / 异步间隙，否则弹窗不出现
 *   - 仅 openid 不等于「用户已授权资料」
 *   - 有防重入、超时，避免开发者工具假死
 */

var userService = require('./userService.js');
var cloudUserService = require('./cloudUserService.js');

var AUTH_KEY = 'wechat_authorized';
var LOGIN_TIMEOUT_MS = 8000;
/** 用户看授权弹窗可能较久，交互超时给足时间 */
var PROFILE_TIMEOUT_MS = 60000;

var _loginPromise = null;
var _profileLoginPromise = null;

/** 重置认证模块级状态（供 Reset 调用） */
function resetAuthState() {
  _loginPromise = null;
  _profileLoginPromise = null;
  console.log('[Auth] resetAuthState — cleared all cached login promises');
}

function getCurrentUser() {
  return userService.getUser();
}

/**
 * 是否已拿到微信 openid（技术身份，不等于资料授权）
 */
function hasOpenId() {
  var user = userService.getUser();
  return !!(user.openid && user.openid !== 'local-user');
}

/**
 * 是否已完成用户资料授权（getUserProfile 成功过）
 */
function hasProfileAuth() {
  var user = userService.getUser();
  return user.profileAuthorized === true;
}

/**
 * 创建星球前是否还需要弹授权
 * - 未完成资料授权 → 需要弹
 * - 已完成 onboarding（有生日+星座）→ 不再弹
 */
function needsProfileAuth() {
  var user = userService.getUser();
  if (user.birthday && user.constellation && hasOpenId()) {
    return false;
  }
  return !hasProfileAuth();
}

/** @deprecated 兼容：以 openid 为准 */
function isAuthorized() {
  return hasOpenId();
}

function isGuest() {
  return !hasOpenId();
}

function getUserId() {
  var user = userService.getUser();
  return hasOpenId() ? user.openid : 'local-user';
}

function getNickname() {
  return userService.getUser().nickname || '未命名旅行者';
}

function getAvatar() {
  return userService.getUser().avatar || '';
}

function _withTimeout(promise, ms, message) {
  return new Promise(function (resolve) {
    var settled = false;
    var timer = setTimeout(function () {
      if (settled) return;
      settled = true;
      resolve({ success: false, error: message || '操作超时，请重试' });
    }, ms);

    promise.then(function (res) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(res);
    }, function (err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        success: false,
        error: (err && err.message) || '操作失败，请稍后重试'
      });
    });
  });
}

function _hydrateFromCloud(openid) {
  return cloudUserService.getUser(openid).then(function (cloudUser) {
    if (!cloudUser || cloudUser.success === false) return null;

    var patch = {};
    if (cloudUser.birthday) patch.birthday = cloudUser.birthday;
    if (cloudUser.constellation) patch.constellation = cloudUser.constellation;
    if (cloudUser.nickname && cloudUser.nickname !== '微信用户') {
      patch.nickname = cloudUser.nickname;
    }
    if (cloudUser.avatar) patch.avatar = cloudUser.avatar;
    if (cloudUser.starlight !== undefined) patch.starlight = cloudUser.starlight;
    if (cloudUser.growthDays !== undefined) patch.growthDays = cloudUser.growthDays;
    if (cloudUser.joinDate) patch.joinDate = cloudUser.joinDate;
    if (cloudUser.lastActive) patch.lastActive = cloudUser.lastActive;

    // V2：恢复每日任务日期字段（v1.3.2 新增），防止 Storage 丢失后所有任务状态消失
    if (cloudUser.lastCheckinDate) patch.lastCheckinDate = cloudUser.lastCheckinDate;
    if (cloudUser.checkinStreak !== undefined) patch.checkinStreak = cloudUser.checkinStreak;
    if (cloudUser.lastHoroscopeDate) patch.lastHoroscopeDate = cloudUser.lastHoroscopeDate;
    if (cloudUser.lastMatchDate) patch.lastMatchDate = cloudUser.lastMatchDate;
    if (cloudUser.lastExploreDate) patch.lastExploreDate = cloudUser.lastExploreDate;
    if (cloudUser.lastExploreTestDate) patch.lastExploreTestDate = cloudUser.lastExploreTestDate;
    if (cloudUser.lastPuzzleDate) patch.lastPuzzleDate = cloudUser.lastPuzzleDate;
    // 恢复资料授权状态，避免用户重新进入后被认为未授权导致排行榜不显示头像昵称
    if (cloudUser.profileAuthorized !== undefined) patch.profileAuthorized = cloudUser.profileAuthorized;

    if (Object.keys(patch).length) {
      userService.saveUser(patch);
    }
    return cloudUser;
  }).catch(function (err) {
    console.warn('[Auth] hydrateFromCloud failed:', err);
    return null;
  });
}

/**
 * 静默登录：只拿 openid，不弹窗，不标记 profileAuthorized
 */
function _doSilentLogin() {
  console.log('[AUTH-07] _doSilentLogin enter');
  return new Promise(function (resolve) {
    if (!wx.cloud) {
      console.log('[AUTH-08] cloud unavailable');
      resolve({ success: false, error: '云开发未初始化' });
      return;
    }

    console.log('[AUTH-09] wx.login start');
    wx.login({
      success: function () {
        console.log('[AUTH-10] wx.login success');
        console.log('[AUTH-11] cloud.callFunction(login) start');
        wx.cloud.callFunction({
          name: 'login',
          success: function (cfRes) {
            var openid = cfRes && cfRes.result && cfRes.result.openid;
            if (!openid) {
              console.log('[AUTH-14] no openid → fail');
              resolve({ success: false, error: '获取身份失败，请稍后重试' });
              return;
            }

            // P0-1 修复：先 hydrate 云端数据到本地，再 saveUser/syncUser
            // 避免以空默认用户数据覆盖云端已有用户记录
            var payload = { openid: openid, id: openid, authorized: true, hasBoundWechat: true };
            _hydrateFromCloud(openid).then(function () {
              userService.saveUser(payload);
              resolve({ success: true, openid: openid, user: userService.getUser() });
            });
          },
          fail: function (err) {
            console.error('[Auth] cloud.login failed:', err);
            resolve({ success: false, error: '登录失败，请稍后重试' });
          }
        });
      },
      fail: function (err) {
        console.error('[Auth] wx.login failed:', err);
        resolve({ success: false, error: '登录失败，请稍后重试' });
      }
    });
  });
}

/**
 * 静默确保 openid（不弹授权窗）
 */
function ensureWechatIdentity() {
  if (hasOpenId()) {
    var user = userService.getUser();
    return Promise.resolve({
      success: true,
      openid: user.openid,
      user: user,
      cached: true
    });
  }

  if (_loginPromise) {
    return _loginPromise;
  }

  _loginPromise = _withTimeout(_doSilentLogin(), LOGIN_TIMEOUT_MS, '登录超时，请重试')
    .then(function (res) {
      _loginPromise = null;
      return res;
    });

  _loginPromise.catch(function () {
    _loginPromise = null;
  });

  return _loginPromise;
}

/**
 * 绑定资料到本地 + 确保 openid
 * （getUserProfile 成功后调用）
 */
function _bindProfileAndOpenId(nickname, avatar) {
  return ensureWechatIdentity().then(function (idRes) {
    if (!idRes || !idRes.success || !idRes.openid) {
      return {
        success: false,
        error: (idRes && idRes.error) || '获取身份失败，请重试',
        profileOk: false
      };
    }

    var patch = {
      nickname: nickname || '未命名旅行者',
      avatar: avatar || '',
      authorized: true,
      hasBoundWechat: true,
      profileAuthorized: true,
      openid: idRes.openid,
      id: idRes.openid
    };

    userService.saveUser(patch);

    try {
      wx.setStorageSync(AUTH_KEY, true);
    } catch (e) {}

    return {
      success: true,
      openid: idRes.openid,
      user: userService.getUser(),
      profileOk: true
    };
  });
}

/**
 * ★ 创建星球授权主入口
 *
 * 必须在 button/view 的 bindtap 同步调用栈中直接调用！
 * 内部第一句就是 getUserProfile，保证弹窗能出现。
 *
 * @returns {Promise<{success, openid?, user?, error?, cancelled?}>}
 */
function loginWithWechat() {
  if (_profileLoginPromise) {
    return _profileLoginPromise;
  }

  // 已授权过资料且已有 openid：不再弹窗
  if (hasProfileAuth() && hasOpenId()) {
    return Promise.resolve({
      success: true,
      openid: userService.getUser().openid,
      user: userService.getUser(),
      cached: true
    });
  }

  // ★ 已绑定 openid 但未授权资料 → 仍弹窗
  // ★ 完全无 openid → 也弹窗
  var raw = new Promise(function (resolve) {
    // ★ 必须同步调用，禁止前面有任何异步
    wx.getUserProfile({
      desc: '用于展示头像昵称并创建你的星球',
      success: function (profileRes) {
        var info = (profileRes && profileRes.userInfo) || {};
        var nickname = info.nickName || '未命名旅行者';
        var avatar = info.avatarUrl || '';

        wx.showLoading({ title: '连接宇宙...', mask: true });
        _bindProfileAndOpenId(nickname, avatar).then(function (res) {
          wx.hideLoading();
          resolve(res);
        }).catch(function (err) {
          wx.hideLoading();
          console.error('[Auth] bind after profile failed:', err);
          resolve({ success: false, error: '登录失败，请重试' });
        });
      },
      fail: function (err) {
        var msg = (err && err.errMsg) || '';
        console.warn('[Auth] getUserProfile fail:', msg, err);

        // 隐私协议未同意
        if (msg.indexOf('privacy') !== -1 || msg.indexOf('隐私') !== -1) {
          resolve({
            success: false,
            cancelled: true,
            error: '请先同意隐私协议后再授权'
          });
          return;
        }

        // 用户取消
        resolve({
          success: false,
          cancelled: true,
          error: '需要微信授权才能创建星球'
        });
      }
    });
  });

  _profileLoginPromise = _withTimeout(raw, PROFILE_TIMEOUT_MS, '授权超时，请重试')
    .then(function (res) {
      _profileLoginPromise = null;
      return res;
    });

  _profileLoginPromise.catch(function () {
    _profileLoginPromise = null;
  });

  return _profileLoginPromise;
}

/**
 * App 启动：静默 openid + 老用户资料回填（不弹窗）
 */
function silentLoginOnLaunch() {
  return ensureWechatIdentity().then(function (res) {
    if (!res.success) {
      console.warn('[Auth] launch silent login skipped:', res.error);
      return res;
    }

    var openid = res.openid || (res.user && res.user.openid);
    var user = userService.getUser();
    if (!openid || user.birthday) {
      return { success: true, openid: openid, user: user };
    }

    return _withTimeout(
      _hydrateFromCloud(openid).then(function () {
        return {
          success: true,
          openid: openid,
          user: userService.getUser()
        };
      }),
      2500,
      'hydrate-timeout'
    ).then(function (hydrated) {
      if (hydrated && hydrated.success) return hydrated;
      return {
        success: true,
        openid: openid,
        user: userService.getUser()
      };
    });
  });
}

function logout() {
  try {
    wx.removeStorageSync(AUTH_KEY);
  } catch (e) {}
  userService.saveUser({
    authorized: false,
    profileAuthorized: false,
    hasBoundWechat: false,
    openid: '',
    id: 'local-user',
    avatar: ''
  });
}

module.exports = {
  getCurrentUser: getCurrentUser,
  isAuthorized: isAuthorized,
  isGuest: isGuest,
  hasOpenId: hasOpenId,
  hasProfileAuth: hasProfileAuth,
  needsProfileAuth: needsProfileAuth,
  getUserId: getUserId,
  getNickname: getNickname,
  getAvatar: getAvatar,
  ensureWechatIdentity: ensureWechatIdentity,
  loginWithWechat: loginWithWechat,
  silentLoginOnLaunch: silentLoginOnLaunch,
  logout: logout,
  resetAuthState: resetAuthState
};
