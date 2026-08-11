// pages/zodiac/detail/index.js — 星座档案
var ZODIAC = require('../../../data/zodiac.js').ZODIAC;
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
    stars: genStars(40)
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
  },

  onBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  onResonance: function () {
    var id = this.data.zodiac ? this.data.zodiac.id : '';
    wx.navigateTo({
      url: '/pages/zodiac/resonance/index?id=' + id
    });
  }
});
