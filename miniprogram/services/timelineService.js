/**
 * timelineService.js — Timeline 服务层
 *
 * 封装 Timeline 数据的读写操作。
 * 使用 Storage Adapter 作为统一存储后端，
 * 后续接入数据库时仅修改本层实现，页面无需变动。
 *
 * 接口：
 *   getTimeline()           → 获取 Timeline 事件列表
 *   addTimelineEvent(event) → 添加一条 Timeline 事件
 *   saveTimeline(list)      → 批量保存 Timeline
 */

var storage = require('../utils/storage');
var tle = require('../utils/timelineEngine.js');

/**
 * 获取 Timeline 事件列表（按日期倒序）
 *
 * 读取优先级：
 *   1. Storage（已持久化）
 *   2. app.globalData（自动迁移 → 写入 Storage）
 *   3. 空数组 []
 *
 * @returns {Array}
 */
function getTimeline() {
  // 1. 从 Storage 读取
  var timeline = storage.get(storage.KEYS.TIMELINE);
  if (timeline) {
    return tle.getTimeline(timeline);
  }

  // 2. 兼容旧数据：从 globalData 迁移
  var app = getApp();
  if (app.globalData.timeline && app.globalData.timeline.length) {
    timeline = app.globalData.timeline;
    storage.set(storage.KEYS.TIMELINE, timeline);
    return tle.getTimeline(timeline);
  }

  // 3. 返回空数组
  return [];
}

/**
 * 添加一条 Timeline 事件
 *
 * 读取现有 → 追加事件 → 写入 Storage → 同步 globalData
 *
 * @param {{ icon: string, title: string, description: string, date?: string }} event
 * @returns {Array} 更新后的 Timeline
 */
function addTimelineEvent(event) {
  var raw = storage.get(storage.KEYS.TIMELINE) || [];
  var updated = tle.addEvent(raw, event);

  storage.set(storage.KEYS.TIMELINE, updated);

  // 过渡期同步 globalData
  var app = getApp();
  app.globalData.timeline = updated;

  return updated;
}

/**
 * 批量保存 Timeline
 *
 * @param {Array} list — 完整的 Timeline 事件列表
 * @returns {Array}
 */
function saveTimeline(list) {
  var updated = tle.getTimeline(list || []);
  storage.set(storage.KEYS.TIMELINE, updated);

  // 过渡期同步 globalData
  var app = getApp();
  app.globalData.timeline = updated;

  return updated;
}

module.exports = {
  getTimeline: getTimeline,
  addTimelineEvent: addTimelineEvent,
  saveTimeline: saveTimeline
};
