/**
 * timelineEngine.js — Timeline V1
 *
 * 管理宇宙日志（Timeline）事件。
 * 纯函数设计，不直接依赖 app.globalData。
 *
 * 使用方式：
 *   var tle = require('../../utils/timelineEngine.js');
 *   var updated = tle.addEvent(timeline, { title: '...', icon: '🌱' });
 */

/**
 * 向 Timeline 追加一条事件
 * @param {Array} timeline — 当前 timeline 数组
 * @param {{ icon: string, title: string, description: string, date?: string }} params
 * @returns {Array} 新的 timeline 数组（不可变）
 */
function addEvent(timeline, params) {
  var now = new Date();
  var date = params.date || formatDate(now);

  var event = {
    id: String(now.getTime()),
    date: date,
    icon: params.icon || '📖',
    title: params.title,
    description: params.description || ''
  };

  return [event].concat(timeline || []);
}

/**
 * 获取排序后的 Timeline（最新在前）
 * @param {Array} timeline — 当前 timeline 数组
 * @returns {Array}
 */
function getTimeline(timeline) {
  if (!timeline || !timeline.length) return [];

  return timeline.slice().sort(function (a, b) {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length === 1) m = '0' + m;
  if (day.length === 1) day = '0' + day;
  return y + '-' + m + '-' + day;
}

module.exports = {
  addEvent: addEvent,
  getTimeline: getTimeline
};
