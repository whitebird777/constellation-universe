/**
 * matchEngine.js — 星座匹配 Engine V1
 * 基于两个星座 + 日期确定性生成匹配数据
 */
function _hash(a, b) {
  var s = (a < b ? a + b : b + a), h = 0, i;
  for (i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

var NAMES = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];

var LOVE_TIPS = [
  '你们的情感节奏互补，一个热烈一个沉稳。',
  '默契在细节中生长，不需要太多言语。',
  '彼此是最好的倾听者，也是最好的陪伴。',
  '你们相处时的默契，珍贵而难得。'
];
var FRIEND_TIPS = [
  '一起探索宇宙的搭档，永远不会无聊。',
  '信任是你们友谊的基石，牢不可破。',
  '彼此懂得对方的沉默，这本身就是一种力量。',
  '你们的笑声能点亮整个银河。'
];
var CAREER_TIPS = [
  '互补的技能让你们成为最佳团队。',
  '一个提供创意，一个负责落地，配合得很顺畅。',
  '在专业领域彼此激励，共同成长。',
  '你们的合作像恒星与行星，各司其职却密不可分。'
];
var COMM_TIPS = [
  '不需要太多解释，一个眼神就能理解。',
  '坦诚是你们沟通的秘诀，从不隐藏真实想法。',
  '即使有分歧也能温柔地找到共识。',
  '你们的对话像星光一样自然流淌。'
];
var GROWTH_TIPS = [
  '彼此是最好的成长催化剂，一起变得更好。',
  '在陪伴中找到自己的方向，这很可贵。',
  '你们教会彼此如何更温柔地对待世界。',
  '每一次相处都是了解彼此的机会。'
];
var ANALYSES = [
  '你们的关系像两颗相邻的恒星，各自闪耀却又彼此照亮。在对方身上，你们看到了彼此欣赏的品质，这种互补让你们的联结如此特别。珍惜这份默契，它会随着时间越发深厚。',
  '你们各自用不同的方式表达与回应，形成了只有你们才懂的语言。即使沉默也不会尴尬，因为真正的理解不需要太多言语。你们在一起不是为了改变对方，而是为了成为更好的自己。',
  '你们的星轨以一种微妙的方式交织。有时像潮汐一样默契，有时又像风一样自由。这正是你们关系的美妙之处——不需要定义，不需要框架，只需要真实地做自己。每一步都有新的发现。'
];

function _stars(n) { var s = '', i; var c = Math.max(2, Math.min(10, Math.round(n))); for (i = 0; i < 10; i++) s += i < c ? '★' : '☆'; return s; }

function getMatch(myConstellation, partnerConstellation, date) {
  var seed = _hash(myConstellation, partnerConstellation) + _hash(date || '', '');
  var compat = 5 + (seed % 45) / 10;

  var today = date || '';
  var dateSeed = today ? _hash(today, 'advice') + seed : seed;

  return {
    partnerConstellation: partnerConstellation,
    compatibility: compat.toFixed(1),
    stars: _stars(compat),
    dimensions: [
      { icon: '❤️', label: '爱情契合', score: (4 + (seed % 60) / 10).toFixed(1), stars: _stars(4 + (seed % 60) / 10), tip: LOVE_TIPS[seed % 4] },
      { icon: '🤝', label: '友情契合', score: (4 + ((seed+1) % 60) / 10).toFixed(1), stars: _stars(4 + ((seed+1) % 60) / 10), tip: FRIEND_TIPS[(seed+1) % 4] },
      { icon: '💼', label: '事业契合', score: (4 + ((seed+2) % 60) / 10).toFixed(1), stars: _stars(4 + ((seed+2) % 60) / 10), tip: CAREER_TIPS[(seed+2) % 4] },
      { icon: '💬', label: '沟通默契', score: (4 + ((seed+3) % 60) / 10).toFixed(1), stars: _stars(4 + ((seed+3) % 60) / 10), tip: COMM_TIPS[(seed+3) % 4] },
      { icon: '🌱', label: '成长方向', score: (4 + ((seed+4) % 60) / 10).toFixed(1), stars: _stars(4 + ((seed+4) % 60) / 10), tip: GROWTH_TIPS[(seed+4) % 4] }
    ],
    advice: _actAdvice(dateSeed),
    analysis: ANALYSES[seed % ANALYSES.length],
    keywords: _keywords(seed)
  };
}

var KEYWORD_POOLS = [
  ['💛 默契','❤️ 信任','🌱 成长','⭐ 陪伴'],
  ['💛 理解','❤️ 包容','🌱 支持','⭐ 温暖'],
  ['💛 真诚','❤️ 倾听','🌱 鼓励','⭐ 守护'],
  ['💛 欣赏','❤️ 尊重','🌱 共鸣','⭐ 坚定']
];

function _keywords(seed) {
  return KEYWORD_POOLS[seed % KEYWORD_POOLS.length];
}

function _actAdvice(seed) {
  var pool = [
    '分享今天的一件开心事','主动表达感谢','一起完成一件小目标',
    '为对方写一句鼓励的话','抽时间好好聊一次天','互相分享一个梦想',
    '一起散步看星星','给对方一个意外的惊喜','记住对方今天说的一句话'
  ];
  var pick = [], used = {}, i;
  while (pick.length < 3) { var idx = (seed++) % pool.length; if (!used[idx]) { used[idx] = true; pick.push(pool[idx]); } }
  return pick;
}

var TIP_PLACES = ['星空咖啡馆','湖畔公园','天文馆','安静的图书馆','海边栈道','山顶观星台'];
var TIP_TIMES = ['傍晚 18:00-20:00','午后 14:00-16:00','深夜 22:00-00:00','清晨 06:00-08:00'];
var TIP_COLORS = ['深蓝','银灰','紫罗兰','星空蓝','象牙白','墨绿'];
function _tips(seed) {
  return {
    place: TIP_PLACES[seed % TIP_PLACES.length],
    time: TIP_TIMES[(seed+1) % TIP_TIMES.length],
    color: TIP_COLORS[(seed+2) % TIP_COLORS.length],
    number: (seed % 30) + 1
  };
}

function _dos(seed) {
  var pool = ['多倾听对方的想法','分享今天的收获','一起做一些小事','给对方一个惊喜','保持真诚的沟通','创造共同的回忆','写下对彼此的感谢'];
  var pick = []; var used = {}; var count = 3;
  while (pick.length < count) { var idx = (seed++) % pool.length; if (!used[idx]) { used[idx] = true; pick.push(pool[idx]); } }
  return pick;
}
function _donts(seed) {
  var pool = ['不要急于下结论','不要隐藏真实感受','不要忽略小细节','不要比较彼此','不要害怕表达','不要独自承担一切'];
  var pick = []; var used = {}; var count = 3;
  while (pick.length < count) { var idx = (seed++) % pool.length; if (!used[idx]) { used[idx] = true; pick.push(pool[idx]); } }
  return pick;
}

/** 随机推荐一个今日趣味星座 */
function getDailyRecommend(myConstellation, date) {
  var idx = _hash(myConstellation, date || '') % NAMES.length;
  var name = NAMES[idx];
  if (name === myConstellation) name = NAMES[(idx + 1) % NAMES.length];
  return name;
}

module.exports = { getMatch: getMatch, getDailyRecommend: getDailyRecommend, NAMES: NAMES };
