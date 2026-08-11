/**
 * identityService.js — 用户身份判断 V4
 *
 * 系统承认三种独立身份维度：
 *
 *   1. hasBoundWechat   — 微信 openid 是否已绑定（居民身份）
 *   2. profileAuthorized — 用户是否完成头像昵称授权（资料完善）
 *   3. onboarded        — 用户是否完成 birthday + constellation（星球主人）
 *
 * 三种维度解耦：
 *   游客居民 = 有 openid 但未完善资料
 *   正式居民 = 有 openid + 资料完善
 *
 * 不再将三个维度混入单一 getIdentity 实现。
 */
var userService = require('./userService.js');

/** 是否已绑定微信 openid（居民身份） */
function hasBoundWechat() {
  var user = userService.getUser();
  return !!(user.openid && user.openid !== 'local-user');
}

/** 是否已完成资料授权 */
function hasProfileAuthorized() {
  var user = userService.getUser();
  return !!(user.profileAuthorized === true && hasBoundWechat());
}

function getIdentity() {
  var user = userService.getUser();
  // 正式居民：openid + 资料完善
  if (hasBoundWechat() && user.profileAuthorized === true) {
    return { type: 'wechat', user: user };
  }
  // 游客居民：仅 openid
  if (hasBoundWechat()) {
    return { type: 'guest_resident', user: user };
  }
  // 纯游客
  return { type: 'guest', user: user };
}

function isWechatUser() {
  return getIdentity().type === 'wechat';
}

function hasCompletedOnboarding() {
  var user = userService.getUser();
  return !!(
    user.openid &&
    user.openid !== 'local-user' &&
    user.birthday &&
    user.constellation
  );
}

module.exports = {
  getIdentity: getIdentity,
  isWechatUser: isWechatUser,
  hasCompletedOnboarding: hasCompletedOnboarding,
  hasBoundWechat: hasBoundWechat,
  hasProfileAuthorized: hasProfileAuthorized
};
