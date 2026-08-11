/**
 * leaderboardController.js — 十二星宫联盟 Controller
 */
var ls = require('../services/leaderboardService.js');

function loadLeaderboard() {
  return ls.getLeaderboard().then(function (constellation) {
    return ls.getPersonalLeaderboard().then(function (personal) {
      return ls.getMyRank().then(function (myRank) {
        return {
          constellation: constellation,
          personal: personal,
          myRank: myRank
        };
      });
    });
  });
}

module.exports = { loadLeaderboard: loadLeaderboard };
