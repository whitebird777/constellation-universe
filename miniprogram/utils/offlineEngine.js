/**
 * offlineEngine.js — Offline Growth System V1
 *
 * 计算用户离开期间星球发生的变化。
 * 纯函数设计，不依赖页面、不依赖 globalData。
 *
 * 使用方式：
 *   var oe = require('../../utils/offlineEngine.js');
 *   var result = oe.calculateOfflineGrowth({
 *     lastVisitTime: '2026-07-07',
 *     currentTime: '2026-07-08',
 *     age: 5
 *   });
 */

/**
 * 计算离线期间星球变化
 *
 * @param {{ lastVisitTime: string|null, currentTime: string, age: number }} params
 * @returns {{ changed: boolean, type: string, message: string }}
 */
function calculateOfflineGrowth(params) {
  var lastVisitTime = params.lastVisitTime;
  var currentTime = params.currentTime;

  // 首次访问，无离线事件
  if (!lastVisitTime) {
    return { changed: false, type: '', message: '' };
  }

  // 计算间隔天数
  var last = new Date(lastVisitTime);
  var now = new Date(currentTime);
  var daysAway = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  // 同一天回来，无变化
  if (daysAway <= 0) {
    return { changed: false, type: '', message: '' };
  }

  // 根据离开天数返回不同消息
  if (daysAway === 1) {
    return {
      changed: true,
      type: 'return',
      message: '你回来了。星球在夜晚安静地呼吸了一整夜。'
    };
  }

  if (daysAway <= 3) {
    return {
      changed: true,
      type: 'overnight',
      message: '你离开的这几天，星球上的植物又长高了一点。'
    };
  }

  return {
    changed: true,
    type: 'extended',
    message: '你离开了一段时间，星球已经发生了许多变化，去看看吧。'
  };
}

module.exports = {
  calculateOfflineGrowth: calculateOfflineGrowth
};
