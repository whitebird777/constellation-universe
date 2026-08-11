/**
 * constellation.js — 星座计算模块
 *
 * 提供根据生日计算十二星座的统一方法。
 * 不依赖页面、不依赖 app.globalData，可被任意模块安全引用。
 *
 * 使用方式：
 *   const { getConstellation } = require('../../utils/constellation.js');
 *   const name = getConstellation('2000-03-25');   // → '白羊座'
 *   const name = getConstellation(new Date(2000, 2, 25)); // → '白羊座'
 */

/**
 * 星座日期边界表
 *
 * 每个条目包含：
 *   name  — 星座中文名称
 *   sM,sD — 起始月、起始日（含）
 *   eM,eD — 结束月、结束日（含）
 *
 * 日期范围覆盖全年 365/366 天，无遗漏无重叠。
 * 摩羯座跨年边界（12.22–1.19）被拆为两条记录，
 * 分别覆盖年末和年初，匹配逻辑自动处理。
 */
var BOUNDS = [
  { name: '摩羯座', sM: 1,  sD: 1,  eM: 1,  eD: 19 },
  { name: '水瓶座', sM: 1,  sD: 20, eM: 2,  eD: 18 },
  { name: '双鱼座', sM: 2,  sD: 19, eM: 3,  eD: 20 },
  { name: '白羊座', sM: 3,  sD: 21, eM: 4,  eD: 19 },
  { name: '金牛座', sM: 4,  sD: 20, eM: 5,  eD: 20 },
  { name: '双子座', sM: 5,  sD: 21, eM: 6,  eD: 21 },
  { name: '巨蟹座', sM: 6,  sD: 22, eM: 7,  eD: 22 },
  { name: '狮子座', sM: 7,  sD: 23, eM: 8,  eD: 22 },
  { name: '处女座', sM: 8,  sD: 23, eM: 9,  eD: 22 },
  { name: '天秤座', sM: 9,  sD: 23, eM: 10, eD: 23 },
  { name: '天蝎座', sM: 10, sD: 24, eM: 11, eD: 22 },
  { name: '射手座', sM: 11, sD: 23, eM: 12, eD: 21 },
  { name: '摩羯座', sM: 12, sD: 22, eM: 12, eD: 31 }
];

/**
 * 判断 (month, day) 是否落在指定区间内（含两端）
 */
function inRange(month, day, sM, sD, eM, eD) {
  if (month < sM || month > eM) return false;
  if (month === sM && day < sD) return false;
  if (month === eM && day > eD) return false;
  return true;
}

/**
 * 从输入中提取月份和日期
 * @param {Date|string} date — Date 对象或 "YYYY-MM-DD" 字符串
 * @returns {{ month: number, day: number }}
 */
function parseDate(date) {
  var month;
  var day;

  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      throw new Error('constellation: 无效的 Date 对象');
    }
    month = date.getMonth() + 1; // getMonth() 返回 0-11
    day = date.getDate();
  } else if (typeof date === 'string') {
    var parts = date.split('-');
    if (parts.length !== 3) {
      throw new Error('constellation: 日期字符串格式必须为 YYYY-MM-DD');
    }
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('constellation: 日期字符串包含无效的月份或日期');
    }
  } else {
    throw new Error('constellation: 参数必须为 Date 对象或 YYYY-MM-DD 字符串');
  }

  return { month: month, day: day };
}

/**
 * 根据生日获取星座中文名称
 *
 * @param {Date|string} date — Date 对象，或 "YYYY-MM-DD" 格式字符串
 * @returns {string} 星座中文名称，如 "白羊座"
 *
 * @example
 *   getConstellation('2000-03-21');   // → '白羊座'
 *   getConstellation('2000-04-19');   // → '白羊座'
 *   getConstellation('2000-04-20');   // → '金牛座'
 *   getConstellation(new Date());      // → 当前日期对应的星座
 */
function getConstellation(date) {
  var parsed = parseDate(date);
  var month = parsed.month;
  var day = parsed.day;

  for (var i = 0; i < BOUNDS.length; i++) {
    var b = BOUNDS[i];
    if (inRange(month, day, b.sM, b.sD, b.eM, b.eD)) {
      return b.name;
    }
  }

  // 理论上不会走到这里（日期范围覆盖全年），保留兜底
  throw new Error('constellation: 无法匹配星座，请检查输入日期');
}

/**
 * Unicode 星座符号映射表
 * 十二星座 → 对应 Unicode 天文符号
 */
var ICON_MAP = {
  '白羊座': '♈', // ♈
  '金牛座': '♉', // ♉
  '双子座': '♊', // ♊
  '巨蟹座': '♋', // ♋
  '狮子座': '♌', // ♌
  '处女座': '♍', // ♍
  '天秤座': '♎', // ♎
  '天蝎座': '♏', // ♏
  '射手座': '♐', // ♐
  '摩羯座': '♑', // ♑
  '水瓶座': '♒', // ♒
  '双鱼座': '♓'  // ♓
};

/**
 * 根据星座中文名称获取 Unicode 图标
 * @param {string} name — 星座中文名称，如 "狮子座"
 * @returns {string} Unicode 符号
 */
function getConstellationIcon(name) {
  return ICON_MAP[name] || '☆'; // 兜底返回 ☆
}

module.exports = {
  getConstellation: getConstellation,
  getConstellationIcon: getConstellationIcon
};
