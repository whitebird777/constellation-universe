/**
 * storage.js — Storage Adapter V1
 *
 * 统一的本地存储适配层。
 * 当前基于 wx.setStorageSync / wx.getStorageSync，
 * 后续迁移数据库时仅修改本模块，调用方无需任何改动。
 *
 * 使用方式：
 *   var storage = require('../../utils/storage.js');
 *   storage.set(storage.KEYS.USER, { birthday: '2000-01-01' });
 *   var user = storage.get(storage.KEYS.USER);
 */

/**
 * 统一 Storage Key 常量
 * 所有业务代码必须引用此处，禁止直接写字符串 key
 */
var KEYS = {
  USER:           'user',
  PLANET:         'planet',
  TIMELINE:       'timeline',
  LEADERBOARD:    'leaderboard',
  JOINED_LEAGUE:       'joined_league',
  LAST_STARLIGHT_DATE:  'last_starlight_date',
  MISSION_COMPLETED_DATE: 'mission_completed_date',
  PERSONAL_LEADERBOARD:  'personal_leaderboard',
  // Star field / farm local state
  FARM: 'farm',
  // Daily checkin
  CHECKIN_DATE: 'checkin_date',
  CHECKIN_STREAK: 'checkin_streak'
};

/**
 * 读取数据
 * @param {string} key — 使用 KEYS 常量
 * @returns {*} 存储的值，不存在返回 null
 */
function get(key) {
  try {
    var value = wx.getStorageSync(key);
    return value !== '' && value !== undefined ? value : null;
  } catch (e) {
    console.error('[storage] get failed:', key, e);
    return null;
  }
}

/**
 * 写入数据
 * @param {string} key — 使用 KEYS 常量
 * @param {*} value — 要存储的值
 * @returns {boolean} 成功返回 true
 */
function set(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('[storage] set failed:', key, e);
    return false;
  }
}

/**
 * 删除指定 key 的数据
 * @param {string} key
 * @returns {boolean}
 */
function remove(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('[storage] remove failed:', key, e);
    return false;
  }
}

/**
 * 清空所有本地存储
 * @returns {boolean}
 */
function clear() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('[storage] clear failed:', e);
    return false;
  }
}

module.exports = {
  KEYS: KEYS,
  get: get,
  set: set,
  remove: remove,
  clear: clear
};
