/**
 * farmEngine.js - Star Field (Phase 2)
 * Watering system: global chances, recover over time.
 */
var CONFIG = {
  growMs: 2 * 60 * 60 * 1000,
  waterReduceMs: 30 * 60 * 1000,
  waterChanceRecoverMs: 2 * 60 * 60 * 1000,
  maxWaterChances: 2,
  minRemainMs: 60 * 60 * 1000,
  harvestReward: 5,
  waterReward: 1,
  dailyStarlightCap: Number.MAX_SAFE_INTEGER,
  plotCount: 1
};

var STAGE_GROWING = 'growing';
var STAGE_READY   = 'ready';

function nowMs() { return Date.now(); }

function todayStr(ts) {
  var d = new Date(ts || nowMs());
  var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}

function clamp(n, min, max) {
  if (n < min) return min; if (n > max) return max; return n;
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function newPlot(id, ts) {
  return { id: id, stage: STAGE_GROWING, plantedAt: ts, matureAt: ts + CONFIG.growMs };
}

function createInitialState(ts) {
  ts = ts || nowMs();
  var plots = [];
  for (var i = 0; i < CONFIG.plotCount; i++) plots.push(newPlot(i, ts));
  return {
    version: 2,
    plots: plots,
    daily: { date: todayStr(ts), earned: 0 },
    totalHarvests: 0,
    waterChances: CONFIG.maxWaterChances,
    lastWaterRecoverAt: ts
  };
}

function rollDaily(state, ts) {
  ts = ts || nowMs();
  var today = todayStr(ts);
  if (!state.daily || state.daily.date !== today) {
    state.daily = { date: today, earned: 0 };
  }
  return state;
}

/** Recover water chances based on elapsed time */
function recoverWaterChances(state, ts) {
  ts = ts || nowMs();
  if (!state.lastWaterRecoverAt) state.lastWaterRecoverAt = ts;
  if (state.waterChances == null) state.waterChances = CONFIG.maxWaterChances;

  var elapsed = ts - state.lastWaterRecoverAt;
  var recovered = Math.floor(elapsed / CONFIG.waterChanceRecoverMs);
  if (recovered > 0) {
    state.waterChances = Math.min(CONFIG.maxWaterChances, state.waterChances + recovered);
    state.lastWaterRecoverAt = ts - (elapsed % CONFIG.waterChanceRecoverMs);
  }
  return state;
}

function tickPlot(plot, ts) {
  ts = ts || nowMs();
  if (plot.stage === STAGE_GROWING && ts >= plot.matureAt) {
    plot.stage = STAGE_READY;
  }
  return plot;
}

function tickState(state, ts) {
  ts = ts || nowMs();
  state = rollDaily(state, ts);
  state = recoverWaterChances(state, ts);
  if (!state.plots || !state.plots.length) return createInitialState(ts);
  for (var i = 0; i < state.plots.length; i++) tickPlot(state.plots[i], ts);
  return state;
}

function formatRemain(ms) {
  if (ms <= 0) return '即将成熟';
  var sec = Math.ceil(ms / 1000);
  if (sec < 60) return '约 ' + sec + ' 秒后成熟';
  var min = Math.ceil(sec / 60);
  if (min < 60) return '约 ' + min + ' 分钟后成熟';
  var h = Math.floor(min / 60), m = min % 60;
  if (m > 0) return '约 ' + h + ' 小时 ' + m + ' 分钟后成熟';
  return '约 ' + h + ' 小时后成熟';
}

function getPlotView(plot, stateWaterChances, ts) {
  ts = ts || nowMs();
  plot = tickPlot(clone(plot), ts);

  var remainMs = Math.max(0, plot.matureAt - ts);
  var total = CONFIG.growMs;
  var elapsed = total - remainMs;
  if (plot.stage === STAGE_READY) { elapsed = total; remainMs = 0; }
  var progress = clamp(Math.floor((elapsed / total) * 100), 0, 100);

  // Water eligibility: growing + has global chances + won't go below minRemainMs
  var chances = stateWaterChances != null ? stateWaterChances : 0;
  var afterWaterRemain = plot.matureAt - CONFIG.waterReduceMs - ts;
  var canWater = plot.stage === STAGE_GROWING
    && chances > 0
    && afterWaterRemain >= CONFIG.minRemainMs;

  var icon = '🌱', title = '星苗生长中', hint = '';
  if (plot.stage === STAGE_READY) {
    icon = '✨'; title = '星光已成熟'; hint = '可以收获了'; progress = 100;
  } else if (progress < 35) {
    icon = '🌱'; title = '星苗破土'; hint = formatRemain(remainMs);
  } else if (progress < 70) {
    icon = '🌿'; title = '星苗舒展'; hint = formatRemain(remainMs);
  } else {
    icon = '🌾'; title = '即将成熟'; hint = formatRemain(remainMs);
  }

  return {
    id: plot.id, stage: plot.stage, icon: icon, title: title, hint: hint,
    progress: progress, progressText: progress + '%', remainMs: remainMs,
    canWater: canWater, canHarvest: plot.stage === STAGE_READY,
    waterChances: chances
  };
}

function calcGrant(state, want, ts) {
  ts = ts || nowMs();
  state = rollDaily(state, ts);
  var cap = CONFIG.dailyStarlightCap;
  var remainCap = Math.max(0, cap - (state.daily.earned || 0));
  if (remainCap <= 0) return { amount: 0, capped: true, remainCap: 0 };
  if (want <= remainCap) return { amount: want, capped: false, remainCap: remainCap - want };
  return { amount: remainCap, capped: true, remainCap: 0 };
}

function findPlot(state, id) {
  for (var i = 0; i < state.plots.length; i++) {
    if (state.plots[i].id === id) return state.plots[i];
  }
  return null;
}

function water(state, plotId, ts) {
  ts = ts || nowMs();
  state = tickState(clone(state), ts);
  var plot = findPlot(state, plotId);
  if (!plot) return { ok: false, error: '找不到星田', state: state };
  if (plot.stage !== STAGE_GROWING) return { ok: false, error: '成熟后无需浇灌，请先收获', state: state };

  var afterRemain = plot.matureAt - CONFIG.waterReduceMs - ts;
  if (afterRemain < CONFIG.minRemainMs) return { ok: false, error: '作物接近成熟，无需再浇灌', state: state };
  if (state.waterChances <= 0) {
    var nextRecoverMs = CONFIG.waterChanceRecoverMs - (ts - state.lastWaterRecoverAt);
    var minUntil = Math.ceil(Math.max(0, nextRecoverMs) / 60000);
    return { ok: false, error: minUntil > 0 ? ('浇灌次数不足，约' + minUntil + '分钟后恢复') : '浇灌次数不足，请稍后再试', state: state };
  }

  state.waterChances -= 1;
  plot.matureAt -= CONFIG.waterReduceMs;
  if (ts >= plot.matureAt) plot.stage = STAGE_READY;

  var grant = calcGrant(state, CONFIG.waterReward, ts);
  state.daily.earned = (state.daily.earned || 0) + grant.amount;

  return {
    ok: true, reward: grant.amount, capped: grant.capped,
    state: state, view: getPlotView(plot, state.waterChances, ts),
    message: '星田获得滋养，成长提前30分钟。' + (grant.amount > 0 ? '星光 +' + grant.amount : '')
  };
}

function harvest(state, plotId, ts) {
  ts = ts || nowMs();
  state = tickState(clone(state), ts);
  var plot = findPlot(state, plotId);
  if (!plot) return { ok: false, error: '找不到星田', state: state };
  if (plot.stage !== STAGE_READY) return { ok: false, error: '还没成熟，再等等吧', state: state };

  var grant = calcGrant(state, CONFIG.harvestReward, ts);
  state.daily.earned = (state.daily.earned || 0) + grant.amount;
  state.totalHarvests = (state.totalHarvests || 0) + 1;

  var newP = newPlot(plot.id, ts);
  for (var i = 0; i < state.plots.length; i++) {
    if (state.plots[i].id === plotId) { state.plots[i] = newP; break; }
  }

  return {
    ok: true, reward: grant.amount, capped: grant.capped,
    state: state, view: getPlotView(newP, state.waterChances, ts),
    message: '收获成功，星光 +' + grant.amount + '！新的星苗已种下'
  };
}

function getSnapshot(state, ts) {
  ts = ts || nowMs();
  state = tickState(clone(state), ts);
  var plots = [];
  for (var i = 0; i < state.plots.length; i++) {
    plots.push(getPlotView(state.plots[i], state.waterChances, ts));
  }
  var cap = CONFIG.dailyStarlightCap;
  var remainCap = Math.max(0, cap - (state.daily.earned || 0));
  return {
    plots: plots,
    dailyEarned: state.daily.earned || 0,
    dailyCap: cap,
    remainCap: remainCap,
    totalHarvests: state.totalHarvests || 0,
    waterChances: state.waterChances != null ? state.waterChances : 0,
    maxWaterChances: CONFIG.maxWaterChances,
    config: {
      growMs: CONFIG.growMs,
      harvestReward: CONFIG.harvestReward,
      waterReward: CONFIG.waterReward,
      waterChanceRecoverMs: CONFIG.waterChanceRecoverMs,
      waterReduceMs: CONFIG.waterReduceMs,
      minRemainMs: CONFIG.minRemainMs
    }
  };
}

module.exports = {
  CONFIG: CONFIG,
  createInitialState: createInitialState,
  tickState: tickState,
  getPlotView: getPlotView,
  getSnapshot: getSnapshot,
  water: water,
  harvest: harvest,
  calcGrant: calcGrant
};
