// constellation.js — 星座确认 → 进入星球
// 身份（openid）已在首页创建时建立，此处不再二次登录。
var { getConstellation, getConstellationIcon } = require('../../utils/constellation.js');
var userService = require('../../services/userService.js');
var authService = require('../../services/authService.js');
var safeArea = require('../../utils/safeArea.js');

function genAtmo(n, t) {
  var a = [];
  for (var i = 0; i < n; i++) {
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

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    loading: true,
    icon: '',
    name: '',
    stars: genAtmo(80),
    dust: genAtmo(20, true)
  },

  _entering: false,

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onLoad() {
    var user = userService.getUser();
    var birthday = user.birthday;

    if (!birthday) {
      wx.showToast({ title: '请先选择生日', icon: 'none' });
      setTimeout(function () {
        wx.navigateBack();
      }, 1000);
      return;
    }

    setTimeout(
      function () {
        var name = getConstellation(birthday);
        var icon = getConstellationIcon(name);
        this.setData({ loading: false, icon: icon, name: name });
      }.bind(this),
      1000
    );
  },

  onEnter() {
    if (this._entering) return;
    this._entering = true;

    var that = this;
    var name = this.data.name;
    if (!name) {
      this._entering = false;
      return;
    }

    // 游客直接保存星座、进入星球，不强制微信身份
    userService.saveUser({ constellation: name });
    that._entering = false;
    wx.redirectTo({ url: '/pages/planet/index' });
  }
});
