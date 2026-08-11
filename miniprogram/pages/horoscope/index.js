// horoscope/index.js V4
var authService = require('../../services/authService.js');
var horoscopeEngine = require('../../utils/horoscopeEngine.js');
var constellationUtil = require('../../utils/constellation.js');
var timelineService = require('../../services/timelineService.js');
var leaderboardService = require('../../services/leaderboardService.js');
var userService = require('../../services/userService.js');
var te = require('../../utils/timeEngine.js');
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
    constellationName: '', constellationIcon: '',
    welcome: '', dimensions: [],
    recommend: null, advice: null,
    date: '', recorded: false, isOwner: false,
    stars: genStars(70)
  },

  onLoad(opts) {
    var user = authService.getCurrentUser();
    var name, icon, isOwner = false;
    if (opts && opts.name) {
      name = opts.name; icon = constellationUtil.getConstellationIcon(name) || '☆';
    } else if (user.birthday && user.constellation) {
      name = user.constellation;
      icon = constellationUtil.getConstellationIcon(name); isOwner = true;
    } else {
      wx.showToast({ title: '请先创建你的星球', icon: 'none' });
      setTimeout(function(){wx.navigateBack()},1200); return;
    }
    var today = te.getToday();
    var data = horoscopeEngine.getHoroscope(name, today);

    // 云端优先判断：users.lastHoroscopeDate 防止 Storage 丢失后重复领取
    var recorded = false;
    if (isOwner) {
      if (user.lastHoroscopeDate === today) {
        recorded = true;
      } else {
        recorded = (wx.getStorageSync('horoscope_recorded_date') === today);
        if (recorded) {
          // 旧 Storage 有效但云端未同步 → 补写云端
          userService.saveUser({ lastHoroscopeDate: today });
        }
      }
    }
    this.setData({
      constellationName: name, constellationIcon: icon,
      welcome: data.welcome,
      dimensions: data.dimensions, recommend: data.recommend, advice: data.advice,
      date: today, recorded: recorded, isOwner: isOwner
    });
  },

  onRecord() {
    if (this.data.recorded || !this.data.isOwner) return;
    var user = authService.getCurrentUser(); var today = te.getToday();
    timelineService.addTimelineEvent({
      icon:'✨', title:'记录了今日心情',
      description:'你记录了'+this.data.constellationName+'的每日主题分享。', date:today
    });
    if(user.constellation) leaderboardService.addStarLight(user.constellation,5);
    userService.saveUser({starlight:(userService.getUser().starlight||0)+5});

    // 写入云端 users.lastHoroscopeDate 防止 Storage 丢失后重复领取
    userService.saveUser({ lastHoroscopeDate: today });
    wx.setStorageSync('horoscope_recorded_date',today);
    this.setData({recorded:true}); wx.showToast({title:'已记录 +5⭐', icon:'success'});
  },

  onBack(){wx.navigateBack({delta:1})}
});
