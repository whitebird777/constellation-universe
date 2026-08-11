/**
 * planetRenderEngine.js — Planet Evolution V1
 *
 * 根据宇宙年龄动态生成星球视觉表现。
 * 纯函数设计，不依赖页面、不依赖 globalData。
 *
 * 使用方式：
 *   var pre = require('../../utils/planetRenderEngine.js');
 *   var appearance = pre.getPlanetAppearance(7);
 *   // → { planet: '🌍', layers: ['🌱', '🌿', '🌳'] }
 */

/**
 * 视觉层级定义
 * 每个层级对应一个 growthEngine 里程碑 day
 */
var VISUAL_LAYERS = [
  { day: 1,  icon: '🌱' },
  { day: 3,  icon: '🌿' },
  { day: 7,  icon: '🌳' },
  { day: 15, icon: '🦋' },
  { day: 30, icon: '🌲' }
];

/**
 * 根据宇宙年龄获取星球外观
 *
 * @param {number} age — 宇宙年龄（天）
 * @returns {{ planet: string, layers: string[] }}
 */
function getPlanetAppearance(age) {
  var layers = [];

  for (var i = 0; i < VISUAL_LAYERS.length; i++) {
    if (VISUAL_LAYERS[i].day <= age) {
      layers.push(VISUAL_LAYERS[i].icon);
    }
  }

  return {
    planet: '🌍',
    layers: layers
  };
}

module.exports = {
  getPlanetAppearance: getPlanetAppearance
};
