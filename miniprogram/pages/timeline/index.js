// timeline.js
var timelineService = require('../../services/timelineService.js');
var safeArea = require('../../utils/safeArea.js');

function genAtmo(n,t) { var a=[]; for(var i=0;i<n;i++) { var s=t?1:(Math.random()*3+1); a.push({i:i,t:Math.floor(Math.random()*100)+'%',l:Math.floor(Math.random()*100)+'%',w:s.toFixed(0)+'rpx',h:s.toFixed(0)+'rpx',d:(Math.random()*4+2).toFixed(1),y:(Math.random()*6).toFixed(1)}); } return a; }

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    events: [],
    stars: genAtmo(70),
    dust: genAtmo(12, true),
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onLoad() {
    var events = timelineService.getTimeline();
    this.setData({ events: events });
  },

  onShow() {
    // 每次进入页面时刷新（支持从其他页面返回后更新）
    var events = timelineService.getTimeline();
    this.setData({ events: events });
  }
});
