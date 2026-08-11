/**
 * dailyEngine.js — Daily Engine V2
 *
 * 每日宇宙快照 + 每日事件（Daily Mission）。
 * 纯函数设计，不依赖页面、不依赖 globalData。
 *
 * V1.1：接入 Living World Engine
 * V2.0：新增 getDailyMission(date) 每日事件系统
 */

var lwe = require('./livingWorldEngine.js');
var te = require('./timeEngine.js');

var MESSAGES = {
  Seed: [
    { icon: '☀️', message: '今天阳光很好，植物吸收了更多能量。' },
    { icon: '💨', message: '微风拂过星球表面，带来了远方的种子。' },
    { icon: '🦠', message: '土壤中的微生物开始活跃起来。' }
  ],
  Sprout: [
    { icon: '💧', message: '清晨的露珠挂在嫩叶上，折射出微弱的光芒。' },
    { icon: '🌱', message: '嫩芽正在努力向上生长，它的根须越来越深。' },
    { icon: '🌤️', message: '星球的自转让昼夜交替，嫩芽学会了追随阳光。' }
  ],
  Growing: [
    { icon: '🌧️', message: '雨季来临，雨水滋润了每一寸土地。' },
    { icon: '🪶', message: '一只路过的候鸟在树上短暂停留，留下了一根羽毛。' },
    { icon: '🌳', message: '树木的根系在地下交织成网，星球的地基更加稳固。' }
  ],
  Living: [
    { icon: '🌲', message: '森林在呼吸，星球以你自己的节奏运转着。' },
    { icon: '⛰️', message: '远处的山脉传来了微弱的地质回响，星球正在成长。' },
    { icon: '✨', message: '夜空中的星座注视着你，宇宙认可了这颗星球的诞生。' }
  ]
};

var MISSIONS = [
  { icon: '🌱', text: '今天，去星田浇灌一次。',           reward: 1 },
  { icon: '✨', text: '今天，收获一次成熟的星光。',       reward: 5 },
  { icon: '🌠', text: '今天，去探索一次宇宙。',           reward: 0 },
  { icon: '🌙', text: '今天，回来看看你的星球。',         reward: 0 },
  { icon: '🪐', text: '今天，为星座联盟贡献星光。',       reward: 5 },
  { icon: '⭐', text: '今天，把一束星光送给你的星座联盟。', reward: 5 }
];

function getDailySnapshot(params) {
  var age = params.age;
  var date = params.date;

  if (!age || isNaN(age) || age < 1) {
    console.warn('[Daily] invalid age=' + age + ' — falling back to age=1');
    age = 1;
  }

  var stageKey = te.getGrowthStageKey(age);
  var list = MESSAGES[stageKey] || MESSAGES['Seed'];
  var index = (age - 1) % list.length;
  if (index < 0) index = 0;
  var item = list[index];
  if (!item) {
    console.error('[Daily] item undefined — age=' + age + ' key=' + stageKey + ' idx=' + index);
    item = MESSAGES['Seed'][0];
  }

  var world = lwe.getWorldState(date);
  return { icon: item.icon, title: '今日宇宙', message: item.message, world: world };
}

/**
 * 获取今日事件 — 基于日期确定性
 */
function getDailyMission(date) {
  var sum = 0;
  for (var i = 0; i < date.length; i++) sum += date.charCodeAt(i);
  var m = MISSIONS[sum % MISSIONS.length];
  return { icon: m.icon, text: m.text, reward: m.reward };
}

module.exports = {
  getDailySnapshot: getDailySnapshot,
  getDailyMission: getDailyMission
};
