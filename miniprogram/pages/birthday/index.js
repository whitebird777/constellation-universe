// birthday.js — 填写生日后进入星座确认
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
    birthday: '',
    displayDate: '请点击选择日期',
    canContinue: false,
    stars: genAtmo(70),
    dust: genAtmo(14, true)
  },

  _saving: false,

  onLoad() {
    var user = userService.getUser();
    if (user.birthday) {
      this.setData({
        birthday: user.birthday,
        displayDate: user.birthday,
        canContinue: true
      });
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onPickerChange(e) {
    var birthday = e.detail.value;
    this.setData({
      birthday: birthday,
      displayDate: birthday,
      canContinue: true
    });
  },

  onContinue() {
    if (!this.data.canContinue || this._saving) return;
    this._saving = true;

    var that = this;
    var birthday = this.data.birthday;

    // 游客直接保存生日，不强制微信身份
    userService.saveUser({ birthday: birthday });
    that._saving = false;
    wx.redirectTo({ url: '/pages/constellation/index' });
  }
});
