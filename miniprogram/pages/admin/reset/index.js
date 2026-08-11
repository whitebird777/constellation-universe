// admin/reset/index.js — 管理员宇宙重启
var safeArea = require('../../../utils/safeArea.js');

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
    stars: genAtmo(65),
    dust: genAtmo(12, true),
    password: '',
    loading: false,
    showResult: false,
    resultOk: false,
    resultReport: {}
  },

  onBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  onPasswordInput: function (e) {
    this.setData({ password: e.detail.value || '' });
  },

  onCancel: function () {
    wx.navigateBack({ delta: 1 });
  },

  onConfirm: function () {
    var that = this;
    var password = that.data.password || '';

    if (!password) {
      wx.showToast({ title: '请输入管理员密码', icon: 'none' });
      return;
    }

    that.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'resetUniverse',
      data: { password: password },
      success: function (res) {
        that.setData({ loading: false });
        var result = res && res.result;

        if (!result) {
          wx.showToast({ title: '重启失败，请重试', icon: 'none' });
          return;
        }

        if (result.success) {
          that.setData({
            showResult: true,
            resultOk: true,
            resultReport: result.result || {}
          });
        } else if (result.reason === 'wrong_password') {
          wx.showToast({ title: '密码错误', icon: 'none' });
        } else if (result.reason === 'unauthorized') {
          wx.showToast({ title: '无权限', icon: 'none' });
        } else {
          wx.showToast({ title: '执行失败', icon: 'none' });
        }
      },
      fail: function (err) {
        that.setData({ loading: false });
        console.error('[AdminReset] callFunction failed:', err);
        wx.showToast({ title: '重启失败，请检查网络', icon: 'none' });
      }
    });
  },

  onDismissResult: function () {
    this.setData({ showResult: false });
    wx.navigateBack({ delta: 1 });
  }
});
