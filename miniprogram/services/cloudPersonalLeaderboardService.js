/**
 * cloudPersonalLeaderboardService.js — 云个人排行榜 Service
 * 数据源：users 集合
 *
 * V4.1.4：不再直接使用 cloud:// avatar 地址。
 * 通过云函数 getAvatarUrls 统一转换临时 HTTPS URL，
 * 保证不同微信用户之间头像可见。
 */
var CLOUD = require('../utils/cloudConfig.js').CLOUD;
var db = null;

function _db() { if (!db) db = wx.cloud.database(); return db; }

  /** 批量转换 cloud:// fileID → HTTPS */
function _resolveAvatars(list) {
  var files = [];
  for (var i = 0; i < list.length; i++) {
    files.push(list[i].avatar || '');
  }
  // 没有 cloud:// 地址 → 直接返回
  var hasCloud = false;
  for (var j = 0; j < files.length; j++) {
    if (files[j] && files[j].indexOf('cloud://') === 0) { hasCloud = true; break; }
  }
  if (!hasCloud) {
    return Promise.resolve(list);
  }

  console.log('[RESOLVE AVATARS] calling getAvatarUrls, count=' + files.length);
  return wx.cloud.callFunction({
    name: 'getAvatarUrls',
    data: { files: files }
  }).then(function (cfRes) {
    var result = (cfRes && cfRes.result) || {};
    var urls = result.urls || [];

    for (var k = 0; k < list.length; k++) {
      var entry = urls[k];
      if (entry && entry.ok && entry.url) {
        list[k].avatar = entry.url;
      } else {
        // 转换失败 → 清空 avatar，前端显示默认头像
        list[k].avatar = '';
      }
    }
    return list;
  }).catch(function (err) {
    console.error('[RESOLVE AVATARS] cloud.callFunction failed:', err);
    // 云函数调用失败 → 清空所有云文件头像
    for (var m = 0; m < list.length; m++) {
      if (list[m].avatar && list[m].avatar.indexOf('cloud://') === 0) {
        list[m].avatar = '';
      }
    }
    return list;
  });
}

/** 获取 Top10（仅已完成建星流程的用户） */
function getTop10() {
  return _db().collection(CLOUD.USERS)
    .where({
      birthday: _db().command.neq(''),
      constellation: _db().command.neq('')
    })
    .field({
      nickname: true,
      avatar: true,
      constellation: true,
      starlight: true,
      profileAuthorized: true
    })
    .orderBy('starlight', 'desc')
    .limit(10)
    .get()
    .then(function (res) {
      var list = [];
      for (var i = 0; i < (res.data || []).length; i++) {
        var u = res.data[i];
        var isAuth = u.profileAuthorized === true;
        list.push({
          rank: i + 1,
          nickname: isAuth ? (u.nickname || '旅行者') : '旅行者',
          avatar: isAuth ? (u.avatar || '') : '',
          constellation: u.constellation || '',
          starlight: u.starlight || 0
        });
      }
      return _resolveAvatars(list);
    }).catch(function (err) {
      console.error('[CloudPersonal] getTop10 failed:', err);
      return [];
    });
}

/** 获取我的排名 + 星光（仅统计已完成建星流程的用户） */
function getMyRank(openid) {
  if (!openid || openid === 'local-user') return Promise.resolve({ rank: 0, totalUsers: 0, starlight: 0 });

  return _db().collection(CLOUD.USERS)
    .where({
      birthday: _db().command.neq(''),
      constellation: _db().command.neq('')
    })
    .orderBy('starlight', 'desc')
    .field({ openid: true, starlight: true })
    .get()
    .then(function (res) {
      var total = (res.data || []).length;
      var rank = 0, myStarlight = 0;
      for (var i = 0; i < total; i++) {
        if (res.data[i].openid === openid) { rank = i + 1; myStarlight = res.data[i].starlight || 0; break; }
      }
      return { rank: rank, totalUsers: total, starlight: myStarlight };
    }).catch(function () {
      return { rank: 0, totalUsers: 0, starlight: 0 };
    });
}

module.exports = {
  getTop10: getTop10,
  getMyRank: getMyRank
};
