// explore.js
var ee = require('../../utils/exploreEngine.js');
var te = require('../../utils/timeEngine.js');
var planetService = require('../../services/planetService.js');
var timelineService = require('../../services/timelineService.js');
var leaderboardService = require('../../services/leaderboardService.js');
var userService = require('../../services/userService.js');
var authService = require('../../services/authService.js');
var safeArea = require('../../utils/safeArea.js');

function genAtmo(n,t) { var a=[]; for(var i=0;i<n;i++) { var s=t?1:(Math.random()*3+1); a.push({i:i,t:Math.floor(Math.random()*100)+'%',l:Math.floor(Math.random()*100)+'%',w:s.toFixed(0)+'rpx',h:s.toFixed(0)+'rpx',d:(Math.random()*4+2).toFixed(1),y:(Math.random()*6).toFixed(1)}); } return a; }

function _hasPlanet(user) {
  return !!(user && user.birthday && user.constellation);
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    icon: '', title: '', description: '',
    stars: genAtmo(85), dust: genAtmo(20, true),
    recorded: false,
    noPlanet: false
  },

  onLoad() {
    var user = userService.getUser();
    if (!_hasPlanet(user)) {
      this.setData({ noPlanet: true });
      return;
    }
    this.setData({ noPlanet: false });

    var planet = planetService.getPlanet();
    var age = te.getUniverseAge(planet.joinDate || te.getToday());
    var today = te.getToday();
    var event = ee.getRandomExplore(today, age);

    // 云端优先判断：users.lastExploreDate 防止 Storage 丢失后重复领取
    var recorded = false;
    if (user.lastExploreDate === today) {
      recorded = true;
    } else {
      recorded = (wx.getStorageSync('explore_recorded_date') === today);
      if (recorded) {
        userService.saveUser({ lastExploreDate: today });
      }
    }

    this.setData({
      icon: event.icon, title: event.title, description: event.description,
      recorded: recorded
    });
  },

  onCreatePlanet: function () {
    wx.navigateBack({ delta: 1 });
  },

  onRecord() {
    if (this.data.recorded) return;
    var user = authService.getCurrentUser(); var today = te.getToday();

    timelineService.addTimelineEvent({
      icon: '🚀', title: '今天踏上了一段星座探索旅程',
      description: '你在探索中发现了一颗新的星域，把它记录进了宇宙日志。', date: today
    });
    if (user.constellation) leaderboardService.addStarLight(user.constellation, 5);
    userService.saveUser({ starlight: (userService.getUser().starlight || 0) + 5 });

    // 写入云端 users.lastExploreDate 防止 Storage 丢失后重复领取
    userService.saveUser({ lastExploreDate: today });
    wx.setStorageSync('explore_recorded_date', today);
    this.setData({ recorded: true });
    wx.showToast({ title: '已记录 +5⭐', icon: 'success' });
  },

  onBack() { wx.navigateBack({ delta: 1 }); }
});
