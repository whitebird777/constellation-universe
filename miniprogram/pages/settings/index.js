// settings.js
var resetUniverseService = require('../../services/resetUniverseService.js');
var safeArea = require('../../utils/safeArea.js');

function genAtmo(n,t) { var a=[]; for(var i=0;i<n;i++) { var s=t?1:(Math.random()*3+1); a.push({i:i,t:Math.floor(Math.random()*100)+'%',l:Math.floor(Math.random()*100)+'%',w:s.toFixed(0)+'rpx',h:s.toFixed(0)+'rpx',d:(Math.random()*4+2).toFixed(1),y:(Math.random()*6).toFixed(1)}); } return a; }

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    showFeedback: false,
    showPrivacy: false,
    stars: genAtmo(65),
    dust: genAtmo(12, true),
    isAdmin: false
  },

  onLoad: function () {
    this._checkAdmin();
  },

  _checkAdmin: function () {
    var that = this;
    if (!wx.cloud) {
      that.setData({ isAdmin: false });
      return;
    }
    wx.cloud.callFunction({
      name: 'checkAdmin',
      success: function (res) {
        var result = res && res.result;
        that.setData({ isAdmin: !!(result && result.isAdmin) });
      },
      fail: function (err) {
        console.warn('[Settings] checkAdmin failed:', err);
        that.setData({ isAdmin: false });
      }
    });
  },

  onReset() {
    var that = this;
    wx.showModal({
      title: '重新创建我的星球',
      content: '确定要重新创建我的星球吗？\r\n\r\n当前星球数据将被删除，你可以重新选择生日创建新的星球。',
      cancelText: '取消',
      confirmText: '重新开始',
      confirmColor: '#e54545',
      success: function (res) {
        if (res.confirm) {
          console.log('[SETTINGS-RESET] user confirmed reset');
          wx.showLoading({ title: '重置中...' });
          resetUniverseService.reset().then(function (result) {
            wx.hideLoading();
            if (!result.ok) {
              wx.showToast({ title: result.error, icon: 'none' });
            } else {
              wx.showToast({ title: '宇宙已重新开启 ✨', icon: 'success' });
            }
          });
        }
      }
    });
  },

  onAbout() {
    wx.showModal({
      title: '星座宇宙',
      content: '星座宇宙\r\n\r\n从一颗星星开始，\r\n创造属于你的宇宙。\r\n\r\n在这里，\r\n每一颗星辰都有自己的故事。\r\n\r\n当前版本：1.3.0',
      showCancel: false,
      confirmText: '好的'
    });
  },

  onBack() {
    console.log('[SETTING BACK] navigateBack');
    wx.navigateBack({ delta: 1 });
  },

  onFeedback() {
    this.setData({ showFeedback: true });
  },

  closeFeedback() {
    this.setData({ showFeedback: false });
  },

  onContactCallback: function () {
    // 客服会话回调（无需额外处理）
  },

  onPrivacy() {
    this.setData({ showPrivacy: true });
  },

  closePrivacy() {
    this.setData({ showPrivacy: false });
  },

  onGoHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // ── 管理员：宇宙重启 ──
  onAdminReset: function () {
    wx.navigateTo({
      url: '/pages/admin/reset/index'
    });
  }
});
