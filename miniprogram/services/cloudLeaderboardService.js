/**
 * cloudLeaderboardService.js — 云排行榜 Service
 *
 * 管理 constellation_stats 集合。永远只有 12 条数据。
 */
var CLOUD = require('../utils/cloudConfig.js').CLOUD;
var db = null;

function _db() { if (!db) db = wx.cloud.database(); return db; }
function _col() { return _db().collection(CLOUD.CONSTELLATIONS); }

var CONSTELLATIONS = [
  '白羊座','金牛座','双子座','巨蟹座','狮子座','处女座',
  '天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'
];

var ICON_MAP = {
  '白羊座':'♈','金牛座':'♉','双子座':'♊','巨蟹座':'♋','狮子座':'♌','处女座':'♍',
  '天秤座':'♎','天蝎座':'♏','射手座':'♐','摩羯座':'♑','水瓶座':'♒','双鱼座':'♓'
};

/**
 * 首次初始化 12 条星座数据
 */
function init() {
  return _col().count().then(function (res) {
    if (res.total >= 12) return { initialized: false };

    var promises = [];
    for (var i = 0; i < CONSTELLATIONS.length; i++) {
      promises.push(_col().add({ data: {
        constellation: CONSTELLATIONS[i],
        userCount: 0,
        starlight: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }}));
    }
    return Promise.all(promises).then(function () {
      console.log('[CloudLB] Initialized 12 constellations');
      return { initialized: true };
    });
  }).catch(function (err) {
    console.error('[CloudLB] init failed:', err);
    _initialized = false;
    return { initialized: false, error: err };
  });
}

/**
 * 获取星座排行榜（V2：从 users 集合实时聚合）
 * 只统计已完成建星流程的用户（birthday + constellation）
 *
 * V2.1：分页读取，突破云数据库 .get() 默认 20 条限制。
 * V2.2：增加 .orderBy('_id','asc') 保证分页确定性，修复 skip 遗漏。
 * V2.3：PAGE_SIZE 调整为 20。微信云客户端 collection.get() 单次最大返回 20 条，
 *        分页循环的判断必须以此为基准，否则最后一页会被误判为数据结束。
 */
// 微信云客户端 collection.get() 单次最大返回 20 条
// 分页必须按照 20 条进行递归读取
var PAGE_SIZE = 20;

function getLeaderboard() {
  // 初始化 12 星座统计
  var stats = {};
  for (var i = 0; i < CONSTELLATIONS.length; i++) {
    stats[CONSTELLATIONS[i]] = { userCount: 0, starlight: 0 };
  }

  var allUsers = []; // 调试：统计参与聚合的用户总数

  /**
   * 递归分页读取，聚合到 stats
   * skip 必须配合 orderBy 使用，否则记录顺序不确定导致遗漏
   */
  function fetchPage(skip) {
    return _db().collection(CLOUD.USERS)
      .where({
        birthday: _db().command.neq(''),
        constellation: _db().command.neq('')
      })
      .field({ constellation: true, starlight: true })
      .orderBy('_id', 'asc')
      .skip(skip)
      .limit(PAGE_SIZE)
      .get()
      .then(function (res) {
        var users = res.data || [];
        console.log('[CloudLB] fetchPage offset=' + skip + ' count=' + users.length);
        for (var j = 0; j < users.length; j++) {
          allUsers.push(users[j]);
          var c = users[j].constellation;
          if (c && stats[c] !== undefined) {
            stats[c].userCount += 1;
            stats[c].starlight += (users[j].starlight || 0);
          } else if (c && stats[c] === undefined) {
            // 异常星座名 → 记录日志
            console.warn('[CloudLB] unknown constellation: "' + c + '" (length=' + c.length + ')');
          }
        }

        // 如果本页不足 PAGE_SIZE，说明已取完
        if (users.length < PAGE_SIZE) {
          console.log('[CloudLB] aggregation complete — total users fetched: ' + allUsers.length);
          return null;
        }
        // 继续下一页
        return fetchPage(skip + PAGE_SIZE);
      });
  }

  return fetchPage(0).then(function () {
    // 组装为原返回结构
    var list = [];
    for (var k = 0; k < CONSTELLATIONS.length; k++) {
      var name = CONSTELLATIONS[k];
      list.push({
        id: k + 1,
        name: name,
        icon: ICON_MAP[name] || '☆',
        userCount: stats[name].userCount,
        starlight: stats[name].starlight
      });
    }

    // 排序：starlight DESC → userCount DESC → name ASC
    list.sort(function (a, b) {
      if (b.starlight !== a.starlight) return b.starlight - a.starlight;
      if (b.userCount !== a.userCount) return b.userCount - a.userCount;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    var totalUsers = 0, totalStarlight = 0;
    for (var m = 0; m < list.length; m++) {
      list[m].rank = m + 1;
      totalUsers += list[m].userCount;
      totalStarlight += list[m].starlight;
    }

    return { totalUsers: totalUsers, totalStarlight: totalStarlight, constellations: list };
  }).catch(function (err) {
    console.error('[CloudLB] getLeaderboard failed:', err);
    return { totalUsers: 0, totalStarlight: 0, constellations: [] };
  });
}

/**
 * 加入联盟：对应星座 userCount +1
 */
function joinLeague(name) {
  return _col().where({ constellation: name }).get().then(function (res) {
    if (!res.data.length) return { joined: false };
    var doc = res.data[0];
    return _col().doc(doc._id).update({
      data: { userCount: (doc.userCount || 0) + 1, updatedAt: new Date() }
    }).then(function () {
      console.log('[CloudLB] ' + name + ' +1 member');
      return { joined: true };
    });
  }).catch(function (err) {
    console.error('[CloudLB] joinLeague failed:', err);
    return { joined: false };
  });
}

/**
 * 退出联盟：对应星座 userCount -1（最低 0）
 */
function leaveLeague(name) {
  return _col().where({ constellation: name }).get().then(function (res) {
    if (!res.data.length) return { left: false };
    var doc = res.data[0];
    return _col().doc(doc._id).update({
      data: { userCount: Math.max(0, (doc.userCount || 1) - 1), updatedAt: new Date() }
    }).then(function () { return { left: true }; });
  }).catch(function () { return { left: false }; });
}

/**
 * 增加星光：对应星座 starlight += amount（云字段名保持 starlight）
 * 保证 starlight 不会低于 0
 */
function addStarlight(name, amount) {
  return _col().where({ constellation: name }).get().then(function (res) {
    if (!res.data.length) return 0;
    var doc = res.data[0];
    var oldVal = doc.starlight || 0;
    var newVal = Math.max(0, oldVal + amount);
    console.log('[CloudLB] starlight clamp', {
      constellation: name,
      old: oldVal,
      amount: amount,
      new: newVal
    });
    return _col().doc(doc._id).update({
      data: { starlight: newVal, updatedAt: new Date() }
    }).then(function () { return newVal; });
  }).catch(function () { return 0; });
}

/**
 * 开发测试工具：重置全部星座统计数据
 * 将 userCount / starlight 全部恢复为 0
 */
function resetAllStats() {
  return _col().get().then(function (res) {
    var promises = [];
    for (var i = 0; i < (res.data || []).length; i++) {
      var doc = res.data[i];
      promises.push(
        _col().doc(doc._id).update({
          data: { userCount: 0, starlight: 0, updatedAt: new Date() }
        })
      );
    }
    return Promise.all(promises);
  }).then(function () {
    console.log('[CloudLB] resetAllStats complete');
    return { success: true };
  }).catch(function (err) {
    console.error('[CloudLB] resetAllStats failed:', err);
    return { success: false, error: err };
  });
}

module.exports = {
  init: init,
  getLeaderboard: getLeaderboard,
  joinLeague: joinLeague,
  leaveLeague: leaveLeague,
  addStarlight: addStarlight,
  resetAllStats: resetAllStats
};
