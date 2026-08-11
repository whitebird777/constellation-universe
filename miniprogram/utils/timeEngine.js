/**
 * timeEngine.js — Universe Time Engine V1
 *
 * 统一管理 StarUniverse 中所有时间与成长阶段计算。
 * 纯函数设计，不依赖页面、不依赖 app.globalData。
 *
 * 使用方式：
 *   var te = require('../../utils/timeEngine.js');
 *   var today = te.getToday();
 *   var age = te.getUniverseAge('2026-07-01');
 *   var stage = te.getGrowthStage(age);
 */

/**
 * 成长阶段定义
 * 基于宇宙年龄（天数）映射到星球成长阶段
 */
var GROWTH_STAGES = [
  { maxDay: 3,   key: 'Seed',    stage: '🌱 种子期' },  // 第 1-3 天
  { maxDay: 7,   key: 'Sprout',  stage: '🌿 萌芽期' },  // 第 4-7 天
  { maxDay: 30,  key: 'Growing', stage: '🌳 成长期' },  // 第 8-30 天
  { maxDay: Infinity, key: 'Living', stage: '🌍 繁荣期' } // 第 31 天起
];

/**
 * 获取今天的日期字符串
 * @returns {string} "YYYY-MM-DD"
 */
function getToday() {
  var d = new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length === 1) m = '0' + m;
  if (day.length === 1) day = '0' + day;
  return y + '-' + m + '-' + day;
}

/**
 * 获取加入日期
 * 如果已有记录则返回，否则以今天作为首次加入日期
 * @param {string} [existing] — 已有的 joinDate（来自 globalData 或数据库）
 * @returns {string} "YYYY-MM-DD"
 */
function getJoinDate(existing) {
  if (existing) return existing;
  return getToday();
}

/**
 * 计算宇宙年龄（天数）
 * 规则：当前日期 - 加入日期 + 1（加入当天为第 1 天）
 * @param {string} joinDate — "YYYY-MM-DD"
 * @returns {number} 宇宙年龄（天）
 */
function getUniverseAge(joinDate) {
  if (!joinDate) {
    console.error('[timeEngine] getUniverseAge called with empty joinDate, falling back to today');
    joinDate = getToday();
  }
  var now = new Date();
  var join = new Date(joinDate);
  var diff = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
  if (isNaN(diff)) {
    console.error('[timeEngine] getUniverseAge failed — joinDate=' + joinDate + ' parsed as Invalid Date, falling back to age=1');
    return 1;
  }
  var age = diff + 1;
  // 防御：age 必须 ≥ 1
  if (age < 1) {
    console.warn('[timeEngine] getUniverseAge clamped — computed age=' + age + ' from joinDate=' + joinDate);
    age = 1;
  }
  return age;
}

/**
 * 根据宇宙年龄获取当前成长阶段
 * @param {number} age — 宇宙年龄（天）
 * @returns {string} 成长阶段名称
 */
function getGrowthStage(age) {
  for (var i = 0; i < GROWTH_STAGES.length; i++) {
    if (age <= GROWTH_STAGES[i].maxDay) {
      return GROWTH_STAGES[i].stage;
    }
  }
  return '🌍 繁荣期';
}

/**
 * 根据宇宙年龄获取成长阶段内部 key（供 Engine 间调用）
 * @param {number} age
 * @returns {string}
 */
function getGrowthStageKey(age) {
  for (var i = 0; i < GROWTH_STAGES.length; i++) {
    if (age <= GROWTH_STAGES[i].maxDay) {
      return GROWTH_STAGES[i].key;
    }
  }
  return 'Living';
}

module.exports = {
  getToday: getToday,
  getJoinDate: getJoinDate,
  getUniverseAge: getUniverseAge,
  getGrowthStage: getGrowthStage,
  getGrowthStageKey: getGrowthStageKey
};
