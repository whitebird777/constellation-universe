// ranking.js
var lc = require('../../controllers/leaderboardController.js');
var safeArea = require('../../utils/safeArea.js');

function genAtmo() {
  var stars = []; var dust = [];
  for (var i = 0; i < 90; i++) {
    var sz = Math.floor(Math.random()*3+1);
    var dur = (Math.random()*4+2).toFixed(1);
    stars.push({i:i, s:'width:'+sz+'rpx;height:'+sz+'rpx;top:'+Math.floor(Math.random()*100)+'%;left:'+Math.floor(Math.random()*100)+'%;animation:starPulse '+dur+'s ease-in-out '+(Math.random()*6).toFixed(1)+'s infinite alternate;'});
  }
  for (var j = 0; j < 25; j++) {
    dust.push({i:j, s:'width:1rpx;height:1rpx;top:'+Math.floor(Math.random()*100)+'%;left:'+Math.floor(Math.random()*100)+'%;animation:dustFloat '+(Math.random()*8+8).toFixed(1)+'s ease-in-out '+(Math.random()*10).toFixed(1)+'s infinite;'});
  }
  return {stars:stars, dust:dust};
}
var atmo = genAtmo();

/** 补齐 Top10 固定10 名，不足以空位填充 */
function padTop10(list) {
  var result = [];
  for (var i = 0; i < 10; i++) {
    if (i < list.length) {
      result.push(list[i]);
    } else {
      result.push({
        rank: i + 1,
        nickname: '等待星辰',
        avatar: '',
        constellation: '虚位以待',
        starlight: 0,
        openid: '',
        placeholder: true
      });
    }
  }
  return result;
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    tab: 'constellation',
    totalUsers: 0, totalStarlight: 0,
    constellations: [],
    personal: [],
    myRank: { rank: 0, totalUsers: 0 },
    stars: atmo.stars, dust: atmo.dust
  },

  onLoad() {
    var that = this;
    lc.loadLeaderboard().then(function (data) {
      var mr = data.myRank;
      if (mr && mr.rank > 0 && mr.totalUsers > 0) {
        mr.percent = mr.rank === 1 ? 100 : Math.floor((mr.totalUsers - mr.rank) / mr.totalUsers * 100);
      }
      that.setData({
        totalUsers: data.constellation.totalUsers,
        totalStarlight: data.constellation.totalStarlight,
        constellations: data.constellation.constellations,
        personal: padTop10(data.personal),
        myRank: mr
      });
    }).catch(function () {
      that.setData({ constellations: [], personal: [] });
    });
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  onBack() { wx.navigateBack({ delta: 1 }); }
});
