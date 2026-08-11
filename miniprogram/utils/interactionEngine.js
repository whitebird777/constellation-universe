/**
 * interactionEngine.js — Planet Interaction V1
 *
 * 处理用户与星球的互动行为，返回系统反馈。
 * 纯函数设计，不依赖页面、不依赖 globalData。
 *
 * 使用方式：
 *   var ie = require('../../utils/interactionEngine.js');
 *   var resp = ie.createInteraction('touch');
 */

/**
 * 互动类型与对应反馈
 * 后续版本扩展更多 type
 */
var INTERACTIONS = {
  touch: {
    icon: '✨',
    title: '星球回应',
    message: '你的关注，让星球感受到温暖。'
  }
};

/**
 * 创建一次互动并返回反馈
 * @param {string} type — 互动类型，当前仅支持 'touch'
 * @returns {{ icon: string, title: string, message: string }}
 */
function createInteraction(type) {
  var interaction = INTERACTIONS[type] || INTERACTIONS['touch'];
  return {
    icon: interaction.icon,
    title: interaction.title,
    message: interaction.message
  };
}

module.exports = {
  createInteraction: createInteraction
};
