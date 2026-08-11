/**
 * horoscopeEngine.js — 每日星座主题 Engine V4
 * 基于 constellation + date 确定性生成
 *
 * V4 合规修改：
 *   - 删除所有数字评分
 *   - "今日适合/不适合" → 中性表达
 *   - "幸运X" / "宇宙为你" / "星辰轨迹" 已清理
 */
function _hash(str) {
  var h = 0, i;
  for (i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function _pick(arr, seed) { return arr[seed % arr.length]; }

var ENERGY = [
  '内心坚定且充满力量。重要的事务可以安排在状态最好的时段。',
  '情绪像潮汐一样起伏。不用勉强自己，顺着节奏来就好。',
  '动力正在酝酿。它还没成形，但已能感受到它的存在。',
  '像一颗沉稳的星球，不急不躁，用自己的节奏影响着周围。'
];
var EMOTION = [
  '与重要的人敞开心扉，能获得意想不到的支持和温暖。',
  '试试多倾听。不急着给建议，安静地听他们说。',
  '情感世界在经历温和的重组。不必害怕变化。',
  '温柔对待自己，是最好的自我关怀。'
];
var CAREER = [
  '主动沟通会带来新的可能。保持专业和耐心。',
  '专注于手头的事，细节里藏着答案。重要决定前，先做好整理。',
  '你的努力正在积累。即使暂时没有反馈。',
  '大胆说出你的想法。一直不敢开口的话，勇敢讲出来。'
];
var GROWTH = [
  '花时间反思和规划，每一次努力都可能带来改变。',
  '成长不需要和别人比较。看看一周前的自己。',
  '每颗星球有自己的运行节奏。你的节奏就是最好的。',
  '今天学到的每一个小知识，会在未来派上用场。'
];
var ADVICES = [
  { action: '联系一位能帮你成长的人，或完成一件拖延的重要任务。', remind: '稳扎稳打，比冲动冒险更稳妥。' },
  { action: '花30分钟整理你的计划。思路清晰，比盲目行动更有效率。', remind: '不要在疲惫时做决定。' },
  { action: '想学新东西时，可以读一本想读的书，或探索一个新领域。', remind: '知识不会辜负你。' },
  { action: '给自己一个安静的时刻。感受此刻的存在。', remind: '有时候，停下来就是最好的前进。' }
];
var COLORS = [
  { name: '深蓝', hex: '#1a3a5c' }, { name: '银灰', hex: '#a0a8b0' },
  { name: '紫罗兰', hex: '#5c4a8c' }, { name: '星空蓝', hex: '#2a4a7c' }
];
var ITEMS = ['黑色笔记本', '金属饰品', '琉璃摆件', '星光手链', '羽毛笔', '星图挂画'];
var TIMES = ['14:00 - 16:00', '10:00 - 12:00', '18:00 - 20:00', '08:00 - 10:00'];
var WELCOMES = [
  '每天，你的星球都在书写新的篇章',
  '宇宙很大，今天也值得探索',
  '你的旅程正在展开',
  '今天，也别忘了仰望星空'
];

function getHoroscope(constellation, date) {
  var seed = _hash(constellation + '-' + date);

  return {
    date: date, constellation: constellation,
    welcome: _pick(WELCOMES, seed),
    dimensions: [
      { icon: '🔥', label: '今日状态', tip: _pick(ENERGY, seed) },
      { icon: '❤️', label: '情感共鸣', tip: _pick(EMOTION, seed + 1) },
      { icon: '💼', label: '事业探索', tip: _pick(CAREER, seed + 2) },
      { icon: '🌱', label: '成长方向', tip: _pick(GROWTH, seed + 3) }
    ],
    recommend: {
      color: _pick(COLORS, seed),
      numbers: [(seed % 30) + 1, ((seed * 3) % 30) + 1, ((seed * 7) % 30) + 1],
      time: _pick(TIMES, seed + 5),
      item: _pick(ITEMS, seed + 6)
    },
    advice: _pick(ADVICES, seed + 7)
  };
}

module.exports = { getHoroscope: getHoroscope };
