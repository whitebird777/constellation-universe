// match/index.js
var authService = require('../../services/authService.js');
var constellationUtil = require('../../utils/constellation.js');
var matchEngine = require('../../utils/matchEngine.js');
var te = require('../../utils/timeEngine.js');
var timelineService = require('../../services/timelineService.js');
var leaderboardService = require('../../services/leaderboardService.js');
var userService = require('../../services/userService.js');
var safeArea = require('../../utils/safeArea.js');

function genStars(n) {
  var a = [];
  for (var i = 0; i < n; i++) {
    var sz = Math.floor(Math.random()*3+1);
    a.push({i:i, s:'width:'+sz+'rpx;height:'+sz+'rpx;top:'+Math.floor(Math.random()*100)+'%;left:'+Math.floor(Math.random()*100)+'%;animation:starPulse '+(Math.random()*4+2).toFixed(1)+'s ease-in-out '+(Math.random()*6).toFixed(1)+'s infinite alternate;'});
  }
  return a;
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    myConstellation: '', myIcon: '',
    partnerConstellation: '', partnerIcon: '',
    stars: '', dimensions: [], analysis: '',
    names: matchEngine.NAMES, pickerIndex: 0, recorded: false,
    starsBG: genStars(60)
  },

  onLoad() {
    var user = authService.getCurrentUser();
    if (!user.birthday || !user.constellation) {
      wx.showToast({ title: '请先创建你的星球', icon: 'none' });
      setTimeout(function(){wx.navigateBack()},1200); return;
    }
    var myName = constellationUtil.getConstellation(user.birthday);
    var myIcon = constellationUtil.getConstellationIcon(myName);

    // 默认选第一个不是自己的星座
    var pIdx = 0;
    for (var i = 0; i < matchEngine.NAMES.length; i++) {
      if (matchEngine.NAMES[i] !== myName) { pIdx = i; break; }
    }

    var today = te.getToday();

    // 云端优先判断：users.lastMatchDate 防止 Storage 丢失后重复领取
    var recorded = false;
    if (user.lastMatchDate === today) {
      recorded = true;
    } else {
      recorded = (wx.getStorageSync('match_recorded_date') === today);
      if (recorded) {
        userService.saveUser({ lastMatchDate: today });
      }
    }

    this.setData({ recorded: recorded });
    this._compute(myName, myIcon, matchEngine.NAMES[pIdx], pIdx);
  },

  _compute(myName, myIcon, partnerName, pIdx) {
    var today = te.getToday();
    var data = matchEngine.getMatch(myName, partnerName, today);
    this.setData({
      myConstellation: myName, myIcon: myIcon,
      partnerConstellation: partnerName, partnerIcon: constellationUtil.getConstellationIcon(partnerName),
      stars: data.stars, dimensions: data.dimensions, analysis: data.analysis,
      pickerIndex: pIdx
    });
  },

  onPickerChange(e) {
    var idx = e.detail.value;
    this._compute(this.data.myConstellation, this.data.myIcon, matchEngine.NAMES[idx], idx);
  },

  onRecord() {
    if (this.data.recorded) return;
    var user = authService.getCurrentUser(); var today = te.getToday();

    timelineService.addTimelineEvent({
      icon: '❤️', title: '今日完成了星座趣味匹配',
      description: '你完成了' + this.data.myConstellation + '与' + this.data.partnerConstellation + '的星座趣味匹配。', date: today
    });
    if (user.constellation) leaderboardService.addStarLight(user.constellation, 5);
    userService.saveUser({ starlight: (userService.getUser().starlight || 0) + 5 });

    // 写入云端 users.lastMatchDate 防止 Storage 丢失后重复领取
    userService.saveUser({ lastMatchDate: today });
    wx.setStorageSync('match_recorded_date', today);
    this.setData({ recorded: true });
    wx.showToast({ title: '已记录 +5⭐', icon: 'success' });
  },

  onBack() { wx.navigateBack({ delta: 1 }); }
});
