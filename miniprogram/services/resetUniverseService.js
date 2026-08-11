/**
 * resetUniverseService.js — 重新开启宇宙
 */
var cloudUserService = require('./cloudUserService.js');
var cloudLeaderboardService = require('./cloudLeaderboardService.js');
var authService = require('./authService.js');
var userService = require('./userService.js');
var storage = require('../utils/storage.js');

function reset() {
  return new Promise(function (resolve) {
    console.log('[RESET-01] reset enter');

    // 读取当前用户信息（用于退出联盟）
    var user = authService.getCurrentUser();
    var constellation = user.constellation || '';
    var starlight = user.starlight || 0;
    var hasCloudUser = !!(user.openid && user.openid !== 'local-user');

    function failReset(message, err) {
      console.warn('[RESET FAILED]', message, err || '');
      resolve({ ok: false, error: message });
    }

    if (constellation) {
      cloudLeaderboardService.leaveLeague(constellation);
    }
    if (constellation && starlight > 0) {
      cloudLeaderboardService.addStarlight(constellation, -starlight);
    }

    // 通过云函数获取真实 openid（不依赖 Storage）
    try {
      wx.cloud.callFunction({
      name: 'login',
      success: function (cfRes) {
        var openid = cfRes && cfRes.result ? cfRes.result.openid : '';

        if (!openid && hasCloudUser) {
          failReset('无法获取用户身份，云端数据未删除');
          return;
        }

        var deletePromise = Promise.resolve({ success: true, removed: 0 });
        if (openid) {
          deletePromise = Promise.resolve().then(function () {
            return cloudUserService.deleteUser(openid);
          }).catch(function (err) {
            console.warn('[RESET] deleteUser exception', err);
            return { success: false, error: err ? err.message : 'unknown' };
          });
        } else {
        }

        deletePromise.then(function (delResult) {
          if (!delResult || delResult.success === false) {
            failReset(
              (delResult && delResult.error) || '云端删除失败，未清理本地数据'
            );
            return;
          }

          userService.invalidateUserSession();
          console.log('[RESET] invalidate old async sessions');

          storage.remove(storage.KEYS.USER);
          storage.remove('wechat_authorized');
          storage.clear();

          // 清理消消乐每日任务状态（保留历史最高分）
          try { wx.removeStorageSync('puzzle_mission_completed'); } catch (e) {}
          try { wx.removeStorageSync('puzzle_mission_date'); } catch (e) {}

          // 清理宇宙探索试炼每日状态
          try { wx.removeStorageSync('exploreTest_recorded_date'); } catch (e) {}
          try { wx.removeStorageSync('exploreTest_completed_date'); } catch (e) {}
          try { wx.removeStorageSync('exploreTest_active'); } catch (e) {}

          // 清理每日星光打卡状态
          try { wx.removeStorageSync(storage.KEYS.CHECKIN_DATE); } catch (e) {}
          try { wx.removeStorageSync(storage.KEYS.CHECKIN_STREAK); } catch (e) {}

          console.log('[RESET-02] storage cleared');

          // 1. Reset auth module-level state
          authService.resetAuthState();

          // 2. Reset globalData to trigger fresh silentLoginOnLaunch
          var GD = getApp().globalData;
          GD.user = null;
          GD.birthday = '';
          GD.constellation = '';
          GD.openid = '';
          GD.authorized = false;
          GD.starlight = 0;
          GD.joinDate = '';
          GD.lastVisitTime = '';
          GD.recordedGrowthDays = [];
          GD.timeline = [];
          GD.farm = null;
          GD.env = 'cloud1-d3g8wetaeeee3e839';
          GD.authReady = false;
          GD.authPromise = null;

          wx.reLaunch({ url: '/pages/index/index' });
          resolve({ ok: true });
        });
      },
      fail: function (err) {
        console.warn('[RESET] cloud.callFunction failed, no openid available', err);
        failReset('云端身份获取失败，未清理本地数据', err);
      }
      });
    } catch (err) {
      failReset('云端身份获取失败，未清理本地数据', err);
    }
  });
}

module.exports = { reset: reset };
