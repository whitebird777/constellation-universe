/**
 * identityUpgradeService.js — 游客 → 微信居民 → 正式居民升级
 *
 * 三段式身份升级：
 *   1. guest           → openid 绑定（居民身份，静默已自动完成）
 *   2. guest_resident  → 资料完善（avatar + nickname 主动填写）
 *   3. wechat          → 正式居民
 *
 * upgradeToResident()    : 仅绑定 openid（静默登录已绑定则立即返回）
 * completeProfile(data)  : 接收 {avatar, nickname} → 写入 profileAuthorized = true
 *
 * 使用方式：
 *   ups.completeProfile({ avatar:'...', nickname:'...' }).then(function (res) { ... });
 */
var identityService = require('./identityService.js');
var authService = require('./authService.js');
var userService = require('./userService.js');

/** 绑定微信居民身份（静默登录，不弹窗） */
function upgradeToResident() {
  if (identityService.hasBoundWechat()) {
    return Promise.resolve({ success: true, alreadyBound: true, identity: identityService.getIdentity() });
  }
  return authService.ensureWechatIdentity().then(function (res) {
    if (!res || !res.success) {
      return { success: false, error: (res && res.error) || '微信身份绑定失败', identity: identityService.getIdentity() };
    }
    return { success: true, identity: identityService.getIdentity(), openid: res.openid };
  });
}

/** 完善居民资料（接收已经选好的 avatar + nickname，直接写入） */
function completeProfile(data) {
  if (!data || (!data.avatar && !data.nickname)) {
    return Promise.resolve({ success: false, error: '请填写头像和昵称' });
  }
  if (identityService.isWechatUser()) {
    return Promise.resolve({ success: true, alreadyComplete: true, identity: identityService.getIdentity() });
  }
  var patch = { profileAuthorized: true, authorized: true, hasBoundWechat: true };
  if (data.avatar) patch.avatar = data.avatar;
  if (data.nickname) patch.nickname = data.nickname;
  userService.saveUser(patch);

  // 头像为 chooseAvatar 临时路径时上传至云存储
  var avatarUrl = data.avatar;
  if (avatarUrl && avatarUrl.indexOf('cloud://') !== 0 && avatarUrl.indexOf('http') !== 0 && avatarUrl.indexOf('wxfile://') === 0) {
    wx.cloud.uploadFile({
      cloudPath: 'avatars/' + Date.now() + '.png',
      filePath: avatarUrl,
      success: function (uploadRes) {
        userService.saveUser({ avatar: uploadRes.fileID });
      },
      fail: function () {}
    });
  }

  userService.pushCloud();
  return Promise.resolve({ success: true, identity: identityService.getIdentity(), user: userService.getUser() });
}

/** @deprecated 升级为资料完善，不再使用 getUserProfile */
function upgradeToWechatProfile() {
  if (identityService.isWechatUser()) {
    return Promise.resolve({ success: true, alreadyWechat: true, identity: identityService.getIdentity() });
  }
  return authService.loginWithWechat().then(function (res) {
    if (!res || !res.success) {
      return { success: false, cancelled: !!(res && res.cancelled), error: (res && res.error) || '资料授权失败', identity: identityService.getIdentity() };
    }
    userService.pushCloud();
    return { success: true, identity: identityService.getIdentity(), user: userService.getUser(), openid: res.openid };
  });
}

/** @deprecated 兼容旧接口，等同于 upgradeToWechatProfile */
function upgradeIdentity() {
  return upgradeToWechatProfile();
}

module.exports = {
  upgradeToResident: upgradeToResident,
  completeProfile: completeProfile,
  upgradeToWechatProfile: upgradeToWechatProfile,
  upgradeIdentity: upgradeIdentity
};
