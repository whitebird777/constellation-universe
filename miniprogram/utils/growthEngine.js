/**
 * growthEngine.js — Growth Engine V1
 *
 * 根据宇宙年龄返回星球当前成长节点。
 * 纯函数设计，不依赖页面、不依赖 globalData。
 *
 * 使用方式：
 *   var ge = require('../../utils/growthEngine.js');
 *   var node = ge.getGrowthNode(7);
 *   // → { day: 7, title: '第一棵树', icon: '🌳', description: '...' }
 */

/**
 * 成长节点表
 * 按 day 升序排列，每个节点代表一个里程碑事件
 */
var MILESTONES = [
  {
    day: 1,
    title: '第一株植物',
    icon: '🌱',
    description: '你的星球迎来了第一株植物。'
  },
  {
    day: 3,
    title: '第一片嫩叶',
    icon: '🌿',
    description: '一株植物长出了第一片嫩叶，空气变得清新。'
  },
  {
    day: 7,
    title: '第一棵树',
    icon: '🌳',
    description: '一棵小树从土壤中生长出来，星球有了第一片绿荫。'
  },
  {
    day: 15,
    title: '第一只蝴蝶',
    icon: '🦋',
    description: '第一只蝴蝶飞过你的星球，生命开始扩散。'
  },
  {
    day: 30,
    title: '第一片森林',
    icon: '🌲',
    description: '树木连成了一片森林，你的星球已经充满生机。'
  }
];

/**
 * 根据宇宙年龄获取当前成长节点
 *
 * 规则：返回 day <= age 的最大里程碑节点。
 * 例如 age=2 → 返回 day=1 的节点（尚未触发 day=3）。
 *
 * @param {number} age — 宇宙年龄（天）
 * @returns {{ day: number, title: string, icon: string, description: string }}
 */
function getGrowthNode(age) {
  var node = MILESTONES[0];

  for (var i = 0; i < MILESTONES.length; i++) {
    if (MILESTONES[i].day <= age) {
      node = MILESTONES[i];
    } else {
      break;
    }
  }

  return node;
}

module.exports = {
  getGrowthNode: getGrowthNode
};
