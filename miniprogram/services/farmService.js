/**
 * farmService.js - Star Field Service (Phase 1)
 */

var storage = require('../utils/storage.js');
var farmEngine = require('../utils/farmEngine.js');
var userService = require('./userService.js');
var authService = require('./authService.js');
var timelineService = require('./timelineService.js');
var te = require('../utils/timeEngine.js');

function loadRaw() {
  try {
    return storage.get(storage.KEYS.FARM);
  } catch (e) {
    console.error('[farmService] loadRaw failed', e);
    return null;
  }
}

function save(state) {
  try {
    storage.set(storage.KEYS.FARM, state);
  } catch (e) {
    console.error('[farmService] save failed', e);
  }
  return state;
}

function getFarmState() {
  var state = loadRaw();
  if (!state || !state.version) {
    state = farmEngine.createInitialState();
    save(state);
  } else {
    state = farmEngine.tickState(state);
    save(state);
  }
  return state;
}

function getSnapshot() {
  var state = getFarmState();
  return farmEngine.getSnapshot(state);
}

function grantStarlight(amount) {
  var user = authService.getCurrentUser();
  var personal = user.starlight || 0;

  if (!amount || amount <= 0) {
    return { personal: personal, granted: 0 };
  }

  personal = personal + amount;
  userService.saveUser({ starlight: personal });

  // lazy require to reduce circular dependency risk
  try {
    var leaderboardService = require('./leaderboardService.js');
    if (user.constellation) {
      leaderboardService.addStarLight(user.constellation, amount);
    }
    if (user.openid && user.openid !== 'local-user') {
      leaderboardService.syncPersonalStarlight(user.openid, personal);
    }
  } catch (e) {
    console.error('[farmService] grant leaderboard failed', e);
  }

  return { personal: personal, granted: amount };
}

function waterPlot(plotId) {
  if (plotId == null) plotId = 0;
  var state = getFarmState();
  var result = farmEngine.water(state, plotId);
  if (!result.ok) {
    return result;
  }
  save(result.state);
  var grant = grantStarlight(result.reward || 0);
  return {
    ok: true,
    reward: grant.granted,
    message: result.message,
    capped: result.capped,
    personalStarlight: grant.personal,
    snapshot: farmEngine.getSnapshot(result.state)
  };
}

function harvestPlot(plotId) {
  if (plotId == null) plotId = 0;
  var state = getFarmState();
  var result = farmEngine.harvest(state, plotId);
  if (!result.ok) {
    return result;
  }
  save(result.state);
  var grant = grantStarlight(result.reward || 0);

  if ((result.state.totalHarvests || 0) === 1) {
    try {
      timelineService.addTimelineEvent({
        icon: '✨',
        title: '第一次收获星光',
        description: '你的星田结出了第一缕星光，正式加入星座联盟的争夺。',
        date: te.getToday()
      });
    } catch (e) {
      console.error('[farmService] timeline failed', e);
    }
  }

  return {
    ok: true,
    reward: grant.granted,
    message: result.message,
    capped: result.capped,
    personalStarlight: grant.personal,
    snapshot: farmEngine.getSnapshot(result.state)
  };
}

module.exports = {
  getFarmState: getFarmState,
  getSnapshot: getSnapshot,
  waterPlot: waterPlot,
  harvestPlot: harvestPlot,
  grantStarlight: grantStarlight
};
