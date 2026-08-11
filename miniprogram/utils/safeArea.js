// 读取微信窗口状态栏高度，用于页面顶部安全区适配。
function getStatusBarHeight() {
  try {
    if (wx.getWindowInfo) {
      return wx.getWindowInfo().statusBarHeight || 0;
    }
    return wx.getSystemInfoSync().statusBarHeight || 0;
  } catch (e) {
    return 0;
  }
}

module.exports = {
  getStatusBarHeight: getStatusBarHeight
};
