// pages/profile/edit/index.js — 居民资料完善
var identityService = require('../../../services/identityService.js');
var identityUpgradeService = require('../../../services/identityUpgradeService.js');
var userService = require('../../../services/userService.js');
var safeArea = require('../../../utils/safeArea.js');

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    avatar: '',
    nickname: '',
    submitted: false
  },

  onLoad: function () {
    this.checkPrivacyAuthorize();

    var saved = userService.getUser();
    this.setData({
      avatar: saved.avatar || '',
      nickname: saved.nickname || ''
    });
  },

  checkPrivacyAuthorize: function () {
    if (typeof wx.requirePrivacyAuthorize !== 'function') { return; }
    wx.requirePrivacyAuthorize({
      success: function () {},
      fail: function () {}
    });
  },

  onChooseAvatar: function (e) {
    var url = (e.detail && e.detail.avatarUrl) || '';
    if (!url) {
      wx.showToast({ title: '头像选择失败，请重试', icon: 'none' });
      return;
    }
    this.setData({ avatar: url });
    wx.showToast({ title: '微信头像已就绪', icon: 'success', duration: 1200 });
  },

  onNicknameBlur: function (e) {
    var val = (e.detail && e.detail.value) || '';
    if (val && val.trim()) { this.setData({ nickname: val.trim() }); }
  },

  onNicknameInput: function (e) {
    this.setData({ nickname: e.detail.value || '' });
  },

  onBack: function () { wx.navigateBack({ delta: 1 }); },

  onSubmit: function () {
    if (this.data.submitted) return;

    var avatar = this.data.avatar;
    var nickname = this.data.nickname;

    if (!avatar) {
      wx.showToast({ title: '请点击上方头像区域使用微信头像', icon: 'none' });
      return;
    }
    if (!nickname || !nickname.trim()) {
      wx.showToast({ title: '请点击下方输入区使用微信昵称', icon: 'none' });
      return;
    }

    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '头像和昵称将用于展示你的居民身份信息，确认后即可保存资料。',
      cancelText: '取消',
      confirmText: '确认保存',
      success: function (modalRes) {
        if (!modalRes.confirm) return;

        that.setData({ submitted: true });
        wx.showLoading({ title: '保存中...', mask: true });

        identityUpgradeService.completeProfile({
          avatar: avatar,
          nickname: nickname.trim()
        }).then(function (res) {
          wx.hideLoading();
          if (res.success) {
            wx.showToast({ title: '居民资料保存成功', icon: 'success' });
            setTimeout(function () { wx.navigateBack({ delta: 1 }); }, 1200);
          } else {
            that.setData({ submitted: false });
            wx.showToast({ title: res.error || '保存失败，请稍后重试', icon: 'none' });
          }
        }).catch(function () {
          wx.hideLoading();
          that.setData({ submitted: false });
          wx.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
        });
      }
    });
  }
});
