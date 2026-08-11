// pages/planet/index.js V2.1
var pc = require('../../controllers/planetController.js');
var ie = require('../../utils/interactionEngine.js');
var safeArea = require('../../utils/safeArea.js');

function genAtmo(n, t) {
  var a = [];
  var i;
  for (i = 0; i < n; i++) {
    var s = t ? 1 : (Math.random() * 3 + 1);
    a.push({
      i: i,
      t: Math.floor(Math.random() * 100) + '%',
      l: Math.floor(Math.random() * 100) + '%',
      w: s.toFixed(0) + 'rpx',
      h: s.toFixed(0) + 'rpx',
      d: (Math.random() * 4 + 2).toFixed(1),
      y: (Math.random() * 6).toFixed(1)
    });
  }
  return a;
}

function computeLifeTree(age) {
  var stages = [
    { min: 1,  max: 3,   icon: '🌰', current: '星芽期',  level: 'Lv.1', next: '嫩叶期' },
    { min: 4,  max: 7,   icon: '🌿', current: '嫩叶期',  level: 'Lv.2', next: '花苞期' },
    { min: 8,  max: 30,  icon: '🌷', current: '花苞期',  level: 'Lv.3', next: '繁花期' },
    { min: 31, max: 99,  icon: '🌸', current: '繁花期',  level: 'Lv.4', next: '星树期' },
    { min: 100,max: 365, icon: '🌳', current: '星树期',  level: 'Lv.5', next: '古树期' },
    { min: 366,max: Infinity, icon: '🏛️', current: '古树期', level: 'Lv.Max', next: '已满级' }
  ];
  var current;
  for (var i = 0; i < stages.length; i++) {
    if (age >= stages[i].min && age <= stages[i].max) { current = stages[i]; break; }
  }
  if (!current) current = stages[0];

  var range = current.max - current.min + 1;
  var offset = age - current.min;
  var pct = range > 0 ? Math.floor((offset / range) * 100) : 100;
  if (pct > 100) pct = 100;
  if (pct < 0) pct = 0;

  return {
    icon: current.icon,
    currentStage: current.current,
    currentLevel: current.level,
    progress: pct + '%',
    nextStage: current.next
  };
}

/**
 * 根据已有数据生成星球状态展示
 */
function computeVibe(dailyEarned, age) {
  var starlight;
  if (dailyEarned >= 20) {
    starlight = { icon: '✨', text: '星光充盈' };
  } else if (dailyEarned > 0) {
    starlight = { icon: '✨', text: '星光汇聚中' };
  } else {
    starlight = { icon: '✨', text: '等待新的星光' };
  }

  var weathers = [
    { icon: '🌙', text: '宁静星夜' },
    { icon: '⭐', text: '星云环绕' },
    { icon: '🌠', text: '流星划过' },
    { icon: '☁️', text: '星雾轻笼' }
  ];
  var weatherIdx = age % weathers.length;
  var weather = weathers[weatherIdx];

  var visit = { icon: '🪐', text: '欢迎回来' };

  return { starlight: starlight, weather: weather, visit: visit };
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    constellation: '',
    constellationIcon: '',
    age: 1,
    stage: '',
    appearance: { planet: '🌍', layers: [] },
    feedback: null,
    offlineFeedback: null,
    stars: [],
    dust: [],
    progress: '0%',
    farmPlot: null,
    dailyEarned: 0,
    dailyCap: 40,
    personalStarlight: 0,
    remainCap: 40,
    loadError: '',
    meteors: [],
    lifeTree: { icon: '🌰', currentStage: '星芽期', currentLevel: 'Lv.1', progress: '0%', nextStage: '嫩叶期' },
    vibe: { starlight: { icon: '✨', text: '等待新的星光' }, weather: { icon: '🌙', text: '宁静星夜' }, visit: { icon: '🪐', text: '欢迎回来' } }
  },

  _timer: null,
  _meteorTimer: null,

  onLoad: function () {
    this.setData({
      stars: genAtmo(80),
      dust: genAtmo(15, true),
      meteors: this._genMeteors()
    });
    this._load();
    this._startMeteorTimer();
  },

  onShow: function () {
    if (this.data.constellation) {
      this._refreshFarmOnly();
    }
    this._startTick();
  },

  onHide: function () {
    this._stopTick();
  },

  onUnload: function () {
    this._stopTick();
    this._stopMeteorTimer();
  },

  _genMeteors: function () {
    var pool = [];
    var total = 8;
    var i;
    for (i = 0; i < total; i++) {
      var bright = Math.random() < 0.15;
      pool.push({
        id: i,
        top: Math.floor(Math.random() * 40),
        left: Math.floor(Math.random() * 50) + 40,
        dur: (Math.random() * 2 + 2).toFixed(1),
        delay: (Math.random() * 3).toFixed(1),
        size: bright ? 4 : (Math.floor(Math.random() * 2) + 2),
        bright: bright,
        visible: i < (Math.floor(Math.random() * 3) + 3)
      });
    }
    return pool;
  },

  _startMeteorTimer: function () {
    var that = this;
    this._meteorTimer = setInterval(function () {
      that.setData({ meteors: that._genMeteors() });
    }, (Math.random() * 5 + 5) * 1000);
  },

  _stopMeteorTimer: function () {
    if (this._meteorTimer) {
      clearInterval(this._meteorTimer);
      this._meteorTimer = null;
    }
  },

  _load: function () {
    var result;
    try {
      result = pc.loadPlanet();
    } catch (e) {
      console.error('[planet] loadPlanet exception', e);
      this.setData({ loadError: '星球加载失败，请返回重试' });
      wx.showToast({ title: '星球加载失败', icon: 'none' });
      return;
    }

    if (!result || !result.ok) {
      wx.showToast({ title: (result && result.error) || '加载失败', icon: 'none' });
      setTimeout(function () {
        wx.navigateBack({ fail: function () {
          wx.reLaunch({ url: '/pages/index/index' });
        }});
      }, 1000);
      return;
    }

    var farm = result.farm || {};
    var plot = null;
    if (farm.plots && farm.plots.length) {
      plot = farm.plots[0];
    }

    this.setData({
      loadError: '',
      constellation: result.constellation,
      constellationIcon: result.constellationIcon,
      age: result.age,
      stage: result.stage,
      appearance: result.appearance || { planet: '🌍', layers: [] },
      offlineFeedback: result.offlineFeedback,
      progress: result.progress || '0%',
      farmPlot: plot,
      dailyEarned: farm.dailyEarned || 0,
      dailyCap: farm.dailyCap || 40,
      remainCap: farm.remainCap != null ? farm.remainCap : 40,
      personalStarlight: result.personalStarlight || 0,
      lifeTree: computeLifeTree(result.age || 1),
      vibe: computeVibe(farm.dailyEarned || 0, result.age || 1)
    });

    if (result.offlineFeedback) {
      var that = this;
      setTimeout(function () {
        that.setData({ offlineFeedback: null });
      }, 4000);
    }

    this._startTick();
  },

  _applyFarmResult: function (result) {
    if (!result || !result.ok) {
      wx.showToast({ title: (result && result.error) || '操作失败', icon: 'none' });
      return;
    }
    var snap = result.snapshot || {};
    var plot = (snap.plots && snap.plots[0]) || null;
    this.setData({
      farmPlot: plot,
      dailyEarned: snap.dailyEarned || 0,
      dailyCap: snap.dailyCap || 40,
      remainCap: snap.remainCap != null ? snap.remainCap : 0,
      personalStarlight: result.personalStarlight != null
        ? result.personalStarlight
        : this.data.personalStarlight,
      vibe: computeVibe(snap.dailyEarned || 0, this.data.age)
    });
    wx.showToast({
      title: result.message || '完成',
      icon: 'none',
      duration: 2200
    });
  },

  _refreshFarmOnly: function () {
    try {
      var snap = pc.refreshFarm();
      var plot = (snap.plots && snap.plots[0]) || null;
      this.setData({
        farmPlot: plot,
        dailyEarned: snap.dailyEarned || 0,
        dailyCap: snap.dailyCap || 40,
        remainCap: snap.remainCap != null ? snap.remainCap : 0
      });
    } catch (e) {
      console.error('[planet] refreshFarm failed', e);
    }
  },

  _startTick: function () {
    this._stopTick();
    var that = this;
    this._timer = setInterval(function () {
      that._refreshFarmOnly();
    }, 1000);
  },

  _stopTick: function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  onGoHome: function () {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  onGlobeTap: function () {
    var feedback = ie.createInteraction('touch');
    this.setData({ feedback: feedback });
    var that = this;
    setTimeout(function () {
      that.setData({ feedback: null });
    }, 2000);
  },

  onBadges: function () {
    wx.showToast({ title: '更多徽章正在路上 ✨', icon: 'none' });
  },

  onWater: function () {
    var plot = this.data.farmPlot;
    if (!plot || !plot.canWater) {
      wx.showToast({
        title: plot && plot.stage === 'ready' ? '先收获再浇灌' : '暂时无法浇灌',
        icon: 'none'
      });
      return;
    }
    this._applyFarmResult(pc.waterFarm(plot.id));
  },

  onHarvest: function () {
    var plot = this.data.farmPlot;
    if (!plot || !plot.canHarvest) {
      wx.showToast({ title: '还没成熟哦', icon: 'none' });
      return;
    }
    this._applyFarmResult(pc.harvestFarm(plot.id));
  }

});
