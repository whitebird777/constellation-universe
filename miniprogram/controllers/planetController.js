/**
 * planetController.js - Planet Controller
 * Coordinates planet page data + star field (Phase 1).
 */

var constellationUtil = require('../utils/constellation.js');
var te = require('../utils/timeEngine.js');
var ge = require('../utils/growthEngine.js');
var de = require('../utils/dailyEngine.js');
var oe = require('../utils/offlineEngine.js');
var pre = require('../utils/planetRenderEngine.js');
var authService = require('../services/authService.js');
var userService = require('../services/userService.js');
var planetService = require('../services/planetService.js');
var timelineService = require('../services/timelineService.js');
var leaderboardService = require('../services/leaderboardService.js');

function getFarmService() {
  return require('../services/farmService.js');
}

function emptyFarm() {
  return {
    plots: [{
      id: 0, stage: 'growing', icon: '🌱', title: '星苗破土', hint: '加载中...',
      progress: 0, progressText: '0%', remainMs: 0,
      waterChances: 0, canWater: false, canHarvest: false
    }],
    dailyEarned: 0, dailyCap: 99999, remainCap: 99999, totalHarvests: 0,
    config: { growMs: 7200000, harvestReward: 5, waterReward: 1 }
  };
}

function loadPlanet() {
  var user = authService.getCurrentUser();
  var planet = planetService.getPlanet() || {};
  var constellation = user.constellation;

  if (!constellation) {
    return { ok: false, error: '请先确认星座身份' };
  }

  var joinDate = te.getJoinDate(planet.joinDate);
  if (!planet.joinDate) {
    planet.joinDate = joinDate;
    planetService.savePlanet({ joinDate: joinDate });
    userService.saveUser({ joinDate: joinDate, lastActive: joinDate, version: 2 });
    try {
      leaderboardService.joinLeague(constellation);
      leaderboardService.joinPersonalLeaderboard(constellation);
    } catch (e) {
      console.error('[planetController] join league failed', e);
    }
  }

  var today = te.getToday();

  // Engine-01: timeEngine — age
  var age = 1;
  try { age = te.getUniverseAge(joinDate); } catch (e) {
    console.error('[planetController] timeEngine.getUniverseAge failed', e);
  }

  // Engine-02: timeEngine — stage
  var stage = '🌍 繁荣期';
  try { stage = te.getGrowthStage(age); } catch (e) {
    console.error('[planetController] timeEngine.getGrowthStage failed', e);
  }

  // Engine-03: growthEngine
  var growthNode = { day: 1, icon: '🌱', title: '第一株植物', description: '你的星球迎来了第一株植物。' };
  try { growthNode = ge.getGrowthNode(age); } catch (e) {
    console.error('[planetController] growthEngine.getGrowthNode failed', e);
  }

  // Engine-04: dailyEngine
  var dailySnapshot = { icon: '☀️', title: '今日宇宙', message: '今天阳光很好。', world: {} };
  try {
    dailySnapshot = de.getDailySnapshot({ age: age, stage: stage, constellation: constellation, date: today });
  } catch (e) {
    console.error('[planetController] dailyEngine.getDailySnapshot failed', e);
  }

  // Engine-05: offlineEngine
  var offline = null;
  try {
    offline = oe.calculateOfflineGrowth({ lastVisitTime: planet.lastVisitTime || null, currentTime: today, age: age });
  } catch (e) {
    console.error('[planetController] offlineEngine failed', e);
  }

  // Engine-06: planetRenderEngine
  var appearance = { planet: '🌍', layers: [] };
  try { appearance = pre.getPlanetAppearance(age); } catch (e) {
    console.error('[planetController] planetRenderEngine failed', e);
  }

  // Engine-07: constellation icon
  var constellationIcon = constellation;
  try { constellationIcon = constellationUtil.getConstellationIcon(constellation); } catch (e) {
    console.error('[planetController] constellationUtil failed', e);
  }

  // Engine-08: farm
  var farm = emptyFarm();
  try { farm = getFarmService().getSnapshot(); } catch (e) {
    console.error('[planetController] farmService failed', e);
  }

  // Engine-09: timeline
  var timeline = [];
  try {
    timeline = timelineService.getTimeline();
    if (!timeline || !timeline.length) {
      timelineService.addTimelineEvent({
        icon: '🌍', title: '星球诞生',
        description: '你成为了' + constellation + '的一员，这颗星球从此有了主人。',
        date: joinDate
      });
    }
  } catch (e) {
    console.error('[planetController] timelineService failed', e);
  }

  // Growth milestone record
  var recordedDays = planet.recordedGrowthDays;
  if (!recordedDays || !Array.isArray(recordedDays)) recordedDays = [];
  try {
    if (recordedDays.indexOf(growthNode.day) === -1) {
      recordedDays.push(growthNode.day);
      planetService.savePlanet({ recordedGrowthDays: recordedDays });
      timelineService.addTimelineEvent({
        icon: growthNode.icon, title: growthNode.title,
        description: growthNode.description, date: today
      });
    }
  } catch (e) {
    console.error('[planetController] growth milestone record failed', e);
  }

  // Persistence
  try { planetService.savePlanet({ lastVisitTime: today }); } catch (e) {}
  try { userService.saveUser({ lastActive: today }); } catch (e) {}
  try { userService.pushCloud(); } catch (e) {}

  var pct = age > 30 ? 100 : Math.floor((age / 30) * 100);
  var personalStarlight = 0;
  try { personalStarlight = userService.getUser().starlight || 0; } catch (e) {}

  var mission = {
    icon: '🌱',
    text: '照料星田：浇灌加速，成熟后收获星光',
    reward: (farm.config && farm.config.harvestReward) ? farm.config.harvestReward : 5
  };

  return {
    ok: true,
    constellation: constellation,
    constellationIcon: constellationIcon,
    age: age,
    stage: stage,
    growthNode: growthNode,
    dailySnapshot: dailySnapshot,
    appearance: appearance,
    offlineFeedback: offline && offline.changed ? offline : null,
    timeline: timeline,
    joinDate: joinDate,
    lastVisitTime: today,
    progress: pct + '%',
    mission: mission,
    missionCompleted: (farm.dailyEarned || 0) > 0,
    farm: farm,
    personalStarlight: personalStarlight
  };
}

function waterFarm(plotId) {
  try {
    var result = getFarmService().waterPlot(plotId == null ? 0 : plotId);
    if (result && result.ok) {
      userService.pushCloud();
    }
    return result;
  } catch (e) {
    console.error('[planetController] waterFarm failed', e);
    return { ok: false, error: '浇灌失败，请重试' };
  }
}

function harvestFarm(plotId) {
  try {
    var result = getFarmService().harvestPlot(plotId == null ? 0 : plotId);
    if (result && result.ok) {
      userService.pushCloud();
    }
    return result;
  } catch (e) {
    console.error('[planetController] harvestFarm failed', e);
    return { ok: false, error: '收获失败，请重试' };
  }
}

function refreshFarm() {
  try {
    return getFarmService().getSnapshot();
  } catch (e) {
    console.error('[planetController] refreshFarm failed', e);
    return emptyFarm();
  }
}

module.exports = {
  loadPlanet: loadPlanet,
  waterFarm: waterFarm,
  harvestFarm: harvestFarm,
  refreshFarm: refreshFarm
};
