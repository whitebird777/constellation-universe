// pages/zodiac/resonance/index.js — 星座共鸣
var ZODIAC = require('../../../data/zodiac.js').ZODIAC;
var identityService = require('../../../services/identityService.js');
var safeArea = require('../../../utils/safeArea.js');

function genStars(n) {
  var a = [];
  for (var i = 0; i < n; i++) {
    var sz = Math.floor(Math.random() * 2) + 1;
    a.push({
      i: i,
      s: 'width:' + sz + 'rpx;height:' + sz + 'rpx;top:' + Math.floor(Math.random() * 100) + '%;left:' + Math.floor(Math.random() * 100) + '%;animation:starPulse ' + (Math.random() * 4 + 2).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite alternate;'
    });
  }
  return a;
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    zodiac: null,
    stars: genStars(40),
    rankingTotal: 0,
    rankingList: []
  },

  onLoad: function (opts) {
    var id = opts.id || '';
    var zodiac = null;
    for (var i = 0; i < ZODIAC.length; i++) {
      if (ZODIAC[i].id === id) {
        zodiac = ZODIAC[i];
        break;
      }
    }
    if (!zodiac) zodiac = ZODIAC[0];
    this.setData({ zodiac: zodiac });

    // 加载共鸣排名数据
    var that = this;
    wx.cloud.callFunction({
      name: 'getResonanceRanking',
      data: { zodiacId: zodiac.id }
    }).then(function (cfRes) {
      var result = cfRes && cfRes.result;
      if (result) {
        that.setData({
          rankingTotal: result.totalUsers || 0,
          rankingList: result.ranking || []
        });
      }
    }).catch(function () {
      // 云函数异常 → 保持默认空数据
    });
  },

  onBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  onSelectTags: function () {
    var that = this;

    // 游客身份判断：未创建星球 → 引导弹窗
    if (!identityService.hasCompletedOnboarding()) {
      wx.showModal({
        title: '🌍 开启你的星球',
        content: '创建属于你的星球后，\n即可参与星座共鸣。\n\n留下你的星座印象，\n让你的选择成为星座画像的一部分。',
        cancelText: '稍后看看',
        confirmText: '创建星球',
        confirmColor: '#C8A96E',
        success: function (res) {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/index/index' });
          }
        }
      });
      return;
    }

    var id = this.data.zodiac ? this.data.zodiac.id : '';
    wx.navigateTo({
      url: '/pages/zodiac/resonance/select/index?id=' + id
    });
  },

  onCommunity: function () {
    wx.showToast({
      title: '功能尚未开放，敬请期待 ✨',
      icon: 'none',
      duration: 2000
    });
  }
});
