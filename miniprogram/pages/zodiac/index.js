// pages/zodiac/index.js
var ZODIAC = require('../../data/zodiac.js').ZODIAC;
var safeArea = require('../../utils/safeArea.js');

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
    zodiacList: ZODIAC,
    stars: genStars(60),
    exploredCount: 0,
    elementGroups: [
      { icon: '🔥', name: '火象星座', signs: '白羊座 · 狮子座 · 射手座' },
      { icon: '🌊', name: '水象星座', signs: '巨蟹座 · 天蝎座 · 双鱼座' },
      { icon: '🌬️', name: '风象星座', signs: '双子座 · 天秤座 · 水瓶座' },
      { icon: '🌍', name: '土象星座', signs: '金牛座 · 处女座 · 摩羯座' }
    ]
  },

  onLoad: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'getExplorationProgress'
    }).then(function (cfRes) {
      var result = cfRes && cfRes.result;
      if (result) {
        that.setData({ exploredCount: result.count || 0 });
      }
    }).catch(function () {
      // 云函数异常 → 保持默认0
    });
  },

  onBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  onTapZodiac: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '/pages/zodiac/detail/index?id=' + id + '&name=' + name
    });
  }
});
