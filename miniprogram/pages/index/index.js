/**
 * pages/index/index.js — 星座联盟 · 功能入口大厅
 *
 * 创建流程（验收关键路径）：
 *   点击「创建我的星球」
 *     → 按完成度进入 birthday / constellation / planet
 *
 * 身份认证由顶栏「身份认证」按钮负责，目前分为：
 *   1. 绑定微信身份（静默，已自动完成）
 *   2. 完善居民资料（打开微信头像昵称授权弹窗）
 */
var userService = require('../../services/userService.js');
var identityService = require('../../services/identityService.js');
var authService = require('../../services/authService.js');
var safeArea = require('../../utils/safeArea.js');
var musicService = require('../../services/musicService.js');
var storage = require('../../utils/storage.js');
var timelineService = require('../../services/timelineService.js');
var te = require('../../utils/timeEngine.js');

/**
 * 昵称展示格式化
 * - 无资料授权 → '旅行者'
 * - 微信用户 → 最长6个中文字符，超出加"..."
 * 不修改原始 user.nickname，只返回展示用字符串。
 */
function formatNickname(nickname) {
  if (!nickname || nickname === '未命名旅行者') return '旅行者';
  if (nickname.length <= 6) return nickname;
  return nickname.slice(0, 6) + '...';
}

/**
 * 打卡奖励：7天循环
 * 第1-3天 +5，第4-6天 +10，第7天 +20
 */
var CHECKIN_REWARDS = [5, 5, 5, 10, 10, 10, 20];

/**
 * 随机正能量语录
 */
var CHECKIN_QUOTES = [
  '坚持今天的小事，也是在靠近更好的自己。',
  '每一次努力，都会留下属于自己的星光。',
  '星光不负赶路人，宇宙记得你的每一步。',
  '你的星球因你的坚持而更加闪耀。',
  '今天的一小步，是宇宙里的一大步。',
  '在浩瀚星空里，你的坚持就是光。',
  '每一天的打卡，都是一次对自己的温柔约定。',
  '星星从不问为什么，它们只是持续发光。',
  '哪怕只有微光，也足以照亮前行的路。',
  '宇宙很大，但你的每一份努力都会被看见。'
];

function getTodayStr() {
  var d = new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length === 1) m = '0' + m;
  if (day.length === 1) day = '0' + day;
  return y + '-' + m + '-' + day;
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    welcomeTitle: '欢迎来到星座宇宙',
    welcomeSub: '开启属于你的第一颗星球',
    buttonText: '创建我的星球',
    musicPlaying: false,
    brightStars: [], mediumStars: [], dimStars: [], distantStars: [], dust: [],
    checkinDone: false,
    checkinModal: false,
    checkinReward: 0,
    checkinQuote: ''
  },

  _meteors: [],
  _canvasCtx: null,
  _canvasW: 0,
  _canvasH: 0,
  _animTimer: null,
  _starting: false,

  onLoad() {
    console.log('[IDX-00] index onLoad');
    this._refreshUserState();
    this._refreshCheckinState();
    this._genAtmosphere();
    this._waitAuthThenRefresh();
  },

  _waitAuthThenRefresh: function () {
    console.log('[IDX-01] _waitAuthThenRefresh enter');
    var that = this;
    try {
      var app = getApp();
      if (app && typeof app.whenAuthReady === 'function') {
        console.log('[IDX-02] await whenAuthReady');
        app.whenAuthReady().then(function () {
          console.log('[IDX-03] whenAuthReady resolved');
          that._refreshUserState();
          that._refreshCheckinState();
        });
        return;
      }
    } catch (e) {}
    console.log('[IDX-04] fallback: ensureWechatIdentity');
    authService.ensureWechatIdentity().then(function () {
      console.log('[IDX-05] ensureWechatIdentity resolved');
      that._refreshUserState();
      that._refreshCheckinState();
    });
  },

  /**
   * 是否已完成建星流程（与身份无关，游客和微信用户均可判断）
   */
  _hasPlanet: function (user) {
    return !!(user && user.birthday && user.constellation);
  },

  _refreshUserState: function () {
    var user = userService.getUser();
    var hasPlanet = this._hasPlanet(user);
    var isAuth = identityService.hasProfileAuthorized();
    var displayName = formatNickname(user.nickname);

    if (hasPlanet) {
      this.setData({
        welcomeTitle: '欢迎回来, ' + displayName,
        welcomeSub: '你的星球一直在等你。',
        buttonText: '进入我的星球'
      });
    } else if (isAuth) {
      this.setData({
        welcomeTitle: '你好, ' + displayName,
        welcomeSub: '开启属于你的第一颗星球',
        buttonText: '创建我的星球'
      });
    } else {
      this.setData({
        welcomeTitle: '欢迎回来，旅行者',
        welcomeSub: '开启属于你的第一颗星球',
        buttonText: '创建我的星球'
      });
    }
  },

  /* ── 每日星光打卡 ── */

  /**
   * 刷新打卡状态：云端优先 + 本地兜底
   * 防止删除小程序后本地 Storage 丢失导致重复领取
   */
  _refreshCheckinState: function () {
    var today = getTodayStr();

    // 1. 云端优先：从用户数据读取 lastCheckinDate
    var user = userService.getUser();
    if (user && user.lastCheckinDate === today) {
      // 云端已记录今日打卡 → 同步本地，禁止重复
      storage.set(storage.KEYS.CHECKIN_DATE, today);
      this.setData({ checkinDone: true });
      return;
    }

    // 2. 本地兜底：云端无记录时以本地为准
    var lastDate = storage.get(storage.KEYS.CHECKIN_DATE);
    this.setData({ checkinDone: lastDate === today });
  },

  /**
   * 判断连续打卡是否中断
   */
  _isStreakBroken: function (lastDate, today) {
    if (!lastDate) return true;
    var last = new Date(lastDate);
    var now = new Date(today);
    var diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    // 昨天打卡 → 连续；其他 → 中断
    return diff !== 1;
  },

  /**
   * 点击打卡
   * V2：打卡状态写入 cloud users.lastCheckinDate / checkinStreak，防止本地丢失后重复领取
   */
  onCheckin: function () {
    var today = getTodayStr();
    var user = userService.getUser();

    // 云端校验：users 表已有今日记录 → 不重复
    if (user && user.lastCheckinDate === today) {
      storage.set(storage.KEYS.CHECKIN_DATE, today);
      this.setData({ checkinDone: true });
      return;
    }

    // 本地校验
    var lastDate = storage.get(storage.KEYS.CHECKIN_DATE);
    if (lastDate === today) {
      return;
    }

    // 计算连续天数（优先云端 streak，其次本地 streak）
    var streak = (user && user.checkinStreak) ? user.checkinStreak : (storage.get(storage.KEYS.CHECKIN_STREAK) || 0);
    if (this._isStreakBroken(user && user.lastCheckinDate ? user.lastCheckinDate : lastDate, today)) {
      streak = 0;
    }

    // 当前周期天数（1-indexed）
    var dayInCycle = (streak % 7) + 1;
    var reward = CHECKIN_REWARDS[dayInCycle - 1] || 5;

    // 更新打卡状态
    streak = streak + 1;
    storage.set(storage.KEYS.CHECKIN_DATE, today);
    storage.set(storage.KEYS.CHECKIN_STREAK, streak);

    // 写入云端 users 表：防止本地 Storage 丢失后重复领取
    userService.saveUser({ lastCheckinDate: today, checkinStreak: streak });

    // 发放星光（复用 farmService.grantStarlight 模式）
    var fs;
    try {
      fs = require('../../services/farmService.js');
    } catch (e) {
      console.error('[checkin] require farmService failed', e);
    }
    if (fs && typeof fs.grantStarlight === 'function') {
      fs.grantStarlight(reward);
    } else {
      // fallback: 直接写入 userService
      userService.saveUser({ starlight: (user.starlight || 0) + reward });
      userService.pushCloud();
    }

    // 写入宇宙日志
    try {
      timelineService.addTimelineEvent({
        icon: '⭐',
        title: '完成每日星光打卡',
        description: '获得 +' + reward + '星光，连续打卡第' + streak + '天',
        date: today
      });
    } catch (e) {
      console.error('[checkin] timeline failed', e);
    }

    // 弹窗
    var idx = Math.floor(Math.random() * CHECKIN_QUOTES.length);
    this.setData({
      checkinDone: true,
      checkinModal: true,
      checkinReward: reward,
      checkinQuote: CHECKIN_QUOTES[idx]
    });
  },

  onCloseCheckinModal: function () {
    this.setData({ checkinModal: false });
  },

  onReady() {
    this._initMeteorCanvas();
  },

  onShow() {
    this._refreshUserState();
    this._refreshCheckinState();
    this._startMeteorLoop();
    this.setData({ musicPlaying: musicService.isPlaying() });
  },

  onHide() {
    this._stopMeteorLoop();
  },

  onUnload() {
    this._stopMeteorLoop();
  },

  /* ── Canvas 星尘 + 微流星系统 ── */

  _dustParticles: [],
  _rareMeteor: null,
  _meteorCooldown: 0,

  _initMeteorCanvas: function () {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('#meteorCanvas').fields({ node: true, size: true }).exec(function (res) {
      if (!res || !res[0] || !res[0].node) return;
      var canvas = res[0].node;
      var ctx = canvas.getContext('2d');
      var dpr = wx.getSystemInfoSync().pixelRatio;
      that._canvasW = res[0].width;
      that._canvasH = res[0].height;
      canvas.width = that._canvasW * dpr;
      canvas.height = that._canvasH * dpr;
      ctx.scale(dpr, dpr);
      that._canvasCtx = ctx;

      // 初始化 40 颗星尘粒子
      that._dustParticles = [];
      for (var i = 0; i < 40; i++) {
        that._dustParticles.push(that._spawnDust());
      }
      that._meteorCooldown = Math.random() * 150 + 100;
      that._startMeteorLoop();
    });
  },

  _spawnDust: function () {
    return {
      x: Math.random() * this._canvasW,
      y: Math.random() * this._canvasH,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.25 + 0.05),
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.3 + 0.2,
      twinkle: Math.random() * Math.PI * 2
    };
  },

  _spawnRareMeteor: function () {
    return {
      x: Math.random() * this._canvasW * 0.3 + this._canvasW * 0.6,
      y: Math.random() * this._canvasH * 0.15,
      vx: -(Math.random() * 0.8 + 0.6),
      vy: Math.random() * 0.6 + 0.4,
      life: 1,
      decay: Math.random() * 0.012 + 0.008
    };
  },

  _startMeteorLoop: function () {
    if (this._animTimer) return;
    var that = this;
    this._animTimer = setInterval(function () {
      if (!that._canvasCtx) return;
      that._drawCanvas();
    }, 40); // ~25fps, lighter on CPU
  },

  _stopMeteorLoop: function () {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  },

  _drawCanvas: function () {
    var ctx = this._canvasCtx;
    var W = this._canvasW;
    var H = this._canvasH;
    ctx.clearRect(0, 0, W, H);

    // ── 星尘粒子 ──
    for (var i = 0; i < this._dustParticles.length; i++) {
      var d = this._dustParticles[i];

      // 缓慢漂移
      d.x += d.vx;
      d.y += d.vy;
      d.twinkle += 0.02;

      // 边界回绕
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      if (d.x < -10) d.x = W + 10;
      if (d.x > W + 10) d.x = -10;

      // 微弱闪烁
      var flicker = Math.sin(d.twinkle) * 0.15 + 0.85;
      var alpha = (d.alpha * flicker).toFixed(2);

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,200,235,' + alpha + ')';
      ctx.fill();
    }

    // ── 稀有流星 ──
    this._meteorCooldown -= 1;
    if (!this._rareMeteor && this._meteorCooldown <= 0) {
      this._rareMeteor = this._spawnRareMeteor();
    }

    if (this._rareMeteor) {
      var m = this._rareMeteor;
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;

      if (m.life <= 0 || m.y > H + 30 || m.x < -30) {
        this._rareMeteor = null;
        this._meteorCooldown = Math.random() * 200 + 200; // 10-15s @25fps
      } else {
        // 极淡拖尾，3段
        for (var seg = 3; seg >= 0; seg--) {
          var ratio = seg / 3;
          var sx = m.x - m.vx * ratio * 5;
          var sy = m.y - m.vy * ratio * 5;
          var alpha = (m.life * ratio * 0.35).toFixed(2);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - m.vx * ratio * 3, sy - m.vy * ratio * 3);
          ctx.strokeStyle = 'rgba(180,200,230,' + alpha + ')';
          ctx.lineWidth = ratio * 1.5 + 0.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
    }
  },

  /* ── 星空背景 ── */

  _genAtmosphere: function () {
    var d = {};
    d.brightStars = this._stars(15,3,4);
    d.mediumStars = this._stars(35,2,3);
    d.dimStars = this._stars(25,1,2);
    d.distantStars = this._stars(10,1,1);
    d.dust = this._dust(20);
    this.setData(d);
  },

  _stars: function (n, sMin, sMax) {
    var a = [];
    for (var i = 0; i < n; i++) {
      var sz = Math.floor(Math.random()*(sMax-sMin+1)+sMin);
      a.push({i:i, s:'width:'+sz+'rpx;height:'+sz+'rpx;top:'+Math.floor(Math.random()*100)+'%;left:'+Math.floor(Math.random()*100)+'%;animation:starPulse '+(Math.random()*4+2).toFixed(1)+'s ease-in-out '+(Math.random()*6).toFixed(1)+'s infinite alternate;'});
    }
    return a;
  },

  _dust: function (n) {
    var a = [];
    for (var i = 0; i < n; i++) {
      a.push({i:i, s:'width:1rpx;height:1rpx;top:'+Math.floor(Math.random()*100)+'%;left:'+Math.floor(Math.random()*100)+'%;animation:dustFloat '+(Math.random()*8+8).toFixed(1)+'s ease-in-out '+(Math.random()*10).toFixed(1)+'s infinite;'});
    }
    return a;
  },

  /* ── 页面事件 ── */

  /**
   * 按完成度路由：
   * 已有 birthday + constellation → planet
   * 有 birthday 无 constellation → constellation
   * 否则 → birthday
   */
  _routeAfterIdentity: function (user) {
    if (this._hasPlanet(user)) {
      wx.redirectTo({ url: '/pages/planet/index' });
      return;
    }
    if (user.birthday) {
      wx.redirectTo({ url: '/pages/constellation/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/birthday/index' });
  },

  /**
   * 中央 CTA · 创建/进入我的星球
   * - 已有星球(birthday+constellation) → 直进星球
   * - 有生日无星座 → 星座页
   * - 否则 → 生日页
   * 注意：不再触发微信授权，授权由顶栏「身份认证」按钮负责。
   */
  onStart() {
    var user = userService.getUser();

    // 已有星球 → 直接进入
    if (this._hasPlanet(user)) {
      wx.redirectTo({ url: '/pages/planet/index' });
      return;
    }

    // 继续未完成的创建流程（不弹窗）
    this._routeAfterIdentity(user);
  },

  onTimeline()  { wx.navigateTo({ url: '/pages/timeline/index' }); },
  onFortune()   { wx.navigateTo({ url: '/pages/horoscope/index' }); },
  onMatch()     { wx.navigateTo({ url: '/pages/match/index' }); },
  onExplore()   { wx.navigateTo({ url: '/pages/explore/index' }); },
  onRanking()   { wx.navigateTo({ url: '/pages/ranking/index' }); },
  onSettings()  { wx.navigateTo({ url: '/pages/settings/index' }); },
  onZodiacWiki(){ wx.navigateTo({ url: '/pages/zodiac/index' }); },
  onExploreTest() { wx.navigateTo({ url: '/pages/exploreTest/index' }); },
  onComingSoon() { wx.showToast({ title: '待开发，敬请期待', icon: 'none' }); },
  onPuzzle()    { wx.navigateTo({ url: '/pages/puzzle/index' }); },

  /**
   * 居民资料完善 → 跳转独立页面
   */
  onIdentity() {
    var isWechat = identityService.isWechatUser();
    if (isWechat) {
      wx.showToast({ title: '居民资料已完成', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/profile/edit/index' });
  },

  /* ── 深空背景音乐 ── */
  onToggleMusic: function () {
    var result = musicService.toggle();
    this.setData({ musicPlaying: result.playing });
  },

});
