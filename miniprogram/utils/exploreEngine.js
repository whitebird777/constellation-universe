/**
 * exploreEngine.js — Explore Engine V2
 *
 * 提供探索系统核心能力。
 * 纯函数设计，不依赖页面、不依赖 Storage。
 *
 * 设计原则：探索的价值不来自奖励，而来自未知。
 *
 * 使用方式：
 *   var ee = require('../../utils/exploreEngine.js');
 *   var event = ee.getRandomExplore('2026-07-09', 5);
 */

/**
 * V2 探索事件库（36 条，6 个分类 × 6 条）
 * 全部为治愈、安静的宇宙场景，零奖励、零失败
 */
var EVENTS = [
  // ====== 星云（6）======
  { icon: '☁️',  title: '漂浮的星云',         description: '紫色的光雾缓缓飘过你的飞船。没有声音。只有时间正在流动。' },
  { icon: '🌌',  title: '微弱的星云',         description: '它几乎看不见。但你知道它在那里。' },
  { icon: '💜',  title: '紫罗兰星云',         description: '一片紫色在黑暗中缓缓旋转。你很想知道它的中心是什么。' },
  { icon: '🌀',  title: '螺旋星云',           description: '它的形状像一只眼睛，静静地注视着你。' },
  { icon: '🫧',  title: '气泡星云',           description: '它像一颗透明的泡泡，漂浮在宇宙深处。' },
  { icon: '🎀',  title: '丝带星云',           description: '一条柔和的光带在黑暗中缓缓展开，像是宇宙的丝绸。' },

  // ====== 遗迹（6）======
  { icon: '🪨',  title: '古老遗迹',           description: '有人曾来过这里。只是，已经不知道过去了多久。' },
  { icon: '🏛️',  title: '失落的门',           description: '一扇门漂浮在虚空中。没有人知道它通向哪里。' },
  { icon: '📜',  title: '石碑',               description: '上面刻着无法解读的文字。也许是某个文明的告别。' },
  { icon: '🗿',  title: '孤独的雕像',         description: '它面向一颗已经熄灭的恒星，已经站了亿万年。' },
  { icon: '⚱️',  title: '时间胶囊',           description: '一个密封的容器，里面装着另一个时代的记忆。' },
  { icon: '🏚️',  title: '废弃的空间站',       description: '舷窗里的灯光早已熄灭。只有尘埃在缓缓飘浮。' },

  // ====== 天体现象（6）======
  { icon: '🌠',  title: '恒星喷发',           description: '远方的一颗恒星，释放出耀眼的光芒。' },
  { icon: '💥',  title: '超新星遗迹',         description: '一颗恒星死亡后留下的痕迹，仍在微弱地发光。' },
  { icon: '🌑',  title: '全食',               description: '一颗行星正好挡住了它的恒星。宇宙暗了整整三分钟。' },
  { icon: '🌈',  title: '引力透镜',           description: '一个星系弯曲了背后的光，形成一道环。' },
  { icon: '⚡',  title: '磁暴',               description: '一阵电磁风暴掠过你的传感器。仪表盘上闪烁了一秒。' },
  { icon: '🔥',  title: '日冕',               description: '你远远看到一颗恒星的边缘，火焰般的等离子体在跳跃。' },

  // ====== 漂流（6）======
  { icon: '🛰️',  title: '漂流探测器',         description: '它已经失去了方向。却仍然坚持飞向远方。' },
  { icon: '🚀',  title: '废弃的飞船',         description: '引擎早已冷却。你不知道它在这里漂了多久。' },
  { icon: '📡',  title: '微弱的信号',         description: '一个断断续续的信号从深空中传来，像是在说："我不孤单。"' },
  { icon: '💿',  title: '金色唱片',           description: '上面刻着陌生的图案和声音。也许是某个文明的自我介绍。' },
  { icon: '🧭',  title: '失落的导航信标',     description: '它曾经指引飞船穿越这片星域。现在已经没有人需要它了。' },
  { icon: '🪞',  title: '反射碎片',           description: '一片金属碎片在星光下闪烁。你看到了自己的倒影。' },

  // ====== 宇宙生命（6）======
  { icon: '🪼',  title: '发光生命体',         description: '它缓缓游过你的身旁。没有停留。也没有害怕。' },
  { icon: '🦋',  title: '宇宙蝴蝶',           description: '它的翅膀闪烁着星光，轻轻落在你的舷窗上。' },
  { icon: '🌻',  title: '向阳植物',           description: '一株植物在微弱的星光中生长。它不需要太多，只需要一点点光。' },
  { icon: '🐋',  title: '星鲸',               description: '一个巨大的身影缓缓游过。它的歌声让你的飞船微微震动。' },
  { icon: '🕊️',  title: '白色飞鸟',           description: '一只不知道从哪里飞来的鸟，在你的星球边缘短暂停留。' },
  { icon: '🌿',  title: '藤蔓',               description: '一条藤蔓从裂缝中生长出来。在一片黑暗中，它是唯一的绿色。' },

  // ====== 宁静（6）======
  { icon: '🌌',  title: '漫长的沉默',         description: '今天，什么也没有发生。你只是安静地看着星空。' },
  { icon: '🌙',  title: '月光',               description: '一颗卫星反射着遥远恒星的光。一切都沐浴在温柔的白光里。' },
  { icon: '💫',  title: '静止的尘埃',         description: '细微的尘埃悬浮在空中。它们动得很慢。慢到几乎像是永恒。' },
  { icon: '🕯️',  title: '唯一的星光',         description: '视野里只有一颗星星。它安静地亮着，像是在等你。' },
  { icon: '🌊',  title: '无声的潮汐',         description: '远处一颗行星的海洋正在涨潮。你听不到声音，但能感受到它的节奏。' },
  { icon: '🤍',  title: '空白',               description: '今天，宇宙什么也没有给你。但光是存在在这里，就已经足够。' }
];

/**
 * 基于日期和年龄的确定性索引
 * 同一天同一用户的同一星球年龄 → 相同事件
 */
function getIndex(dateStr, age) {
  var key = dateStr + '-' + age;
  var sum = 0;
  for (var i = 0; i < key.length; i++) {
    sum += key.charCodeAt(i);
  }
  return sum % EVENTS.length;
}

/**
 * 获取一次探索事件
 *
 * @param {string} [date] — "YYYY-MM-DD" 日期
 * @param {number} [age]  — 宇宙年龄
 * @returns {{ icon: string, title: string, description: string }}
 */
function getRandomExplore(date, age) {
  if (!date) {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length === 1) m = '0' + m;
    if (day.length === 1) day = '0' + day;
    date = y + '-' + m + '-' + day;
  }

  var index = getIndex(date, age || 1);
  return EVENTS[index];
}

module.exports = {
  getRandomExplore: getRandomExplore
};
