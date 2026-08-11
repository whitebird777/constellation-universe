/**
 * livingWorldEngine.js — Living World Engine V1
 *
 * 提供基于日期的确定性世界状态。
 * 同一日期 → 同一世界状态，确保所有用户当天看到一致的宇宙背景。
 *
 * 纯函数设计：不读取 Storage、不读取 Service、不访问页面。
 *
 * 使用方式：
 *   var lwe = require('../../utils/livingWorldEngine.js');
 *   var state = lwe.getWorldState('2026-07-09');
 *   // → { mood: 'Quiet', sky: 'Deep Blue', event: '宇宙安静', description: '...' }
 */

/**
 * 世界状态定义表
 * 每个状态包含 mood（气氛）、sky（天空）、event（事件中文）、description（描述）
 */
var STATES = [
  {
    mood: 'Quiet',
    sky: 'Deep Blue',
    event: '宇宙安静',
    description: '今天的宇宙格外宁静，星光温柔地洒在每一个星球上。'
  },
  {
    mood: 'Bright Stars',
    sky: 'Starlit',
    event: '繁星',
    description: '无数恒星在远方闪烁，夜空比平时更加明亮。'
  },
  {
    mood: 'Meteor Shower',
    sky: 'Streaked',
    event: '流星雨',
    description: '一场流星雨正在划过宇宙，许多星球上都能看到这场盛景。'
  },
  {
    mood: 'Blue Moon',
    sky: 'Indigo',
    event: '蓝月',
    description: '一颗蓝色的卫星升到了夜空的最高处，整个宇宙笼罩在静谧的蓝光中。'
  },
  {
    mood: 'Nebula Bloom',
    sky: 'Violet',
    event: '星云盛放',
    description: '远处的星云正在缓慢膨胀，紫色与粉色的光芒交织在一起。'
  },
  {
    mood: 'Cosmic Wind',
    sky: 'Silver',
    event: '宇宙风',
    description: '一阵看不见的宇宙风吹过星系，带来了遥远世界的微弱回响。'
  }
];

/**
 * 将日期字符串转为数值索引
 * 使用简单的字符码求和取模，确保同一天返回相同结果
 */
function dateToIndex(dateStr) {
  var sum = 0;
  for (var i = 0; i < dateStr.length; i++) {
    sum += dateStr.charCodeAt(i);
  }
  return sum % STATES.length;
}

/**
 * 获取指定日期的世界状态
 *
 * @param {string} date — "YYYY-MM-DD" 格式日期
 * @returns {{ mood: string, sky: string, event: string, description: string }}
 */
function getWorldState(date) {
  if (!date) {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length === 1) m = '0' + m;
    if (day.length === 1) day = '0' + day;
    date = y + '-' + m + '-' + day;
  }

  var index = dateToIndex(date);
  return STATES[index];
}

module.exports = {
  getWorldState: getWorldState
};
