/**
 * StarUniverse — App Entry
 * 云开发环境：cloud1 / cloud1-d3g8wetaeeee3e839
 *
 * 启动时静默获取 openid，不弹授权窗，不阻塞页面渲染。
 */
App({
  onLaunch: function () {
    this.globalData = {
      env: 'cloud1-d3g8wetaeeee3e839',
      authReady: false,
      authPromise: null
    };

    if (!wx.cloud) {
      console.warn('[APP-02] cloud unavailable');
      this.globalData.authPromise = Promise.resolve({
        success: false,
        error: '云开发不可用'
      });
      return;
    }

    wx.cloud.init({
      env: 'cloud1-d3g8wetaeeee3e839',
      traceUser: true
    });

    // 静默登录：建立 openid，老用户可回填生日/星座
    var authService = require('./services/authService.js');
    var that = this;
    this.globalData.authPromise = authService.silentLoginOnLaunch().then(function (res) {
      that.globalData.authReady = true;
      if (res && res.success) {
        var user = res.user || authService.getCurrentUser();
        that.globalData.openid = user.openid || '';
        that.globalData.birthday = user.birthday || '';
        that.globalData.constellation = user.constellation || '';
      }
      return res;
    });
  },

  /**
   * 页面可 await 启动登录完成（已结束则立即返回）
   */
  whenAuthReady: function () {
    if (this.globalData.authPromise) {
      return this.globalData.authPromise;
    }
    // Reset 后 authPromise 清空 → 启动新一轮静默登录
    var authService = require('./services/authService.js');
    var that = this;
    this.globalData.authPromise = authService.silentLoginOnLaunch().then(function (res) {
      that.globalData.authReady = true;
      if (res && res.success) {
        var user = res.user || authService.getCurrentUser();
        that.globalData.openid = user.openid || '';
        that.globalData.birthday = user.birthday || '';
        that.globalData.constellation = user.constellation || '';
      }
      return res;
    });
    return this.globalData.authPromise;
  }
});
