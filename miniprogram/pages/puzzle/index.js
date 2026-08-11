// pages/puzzle/index.js — 星座消消乐 V1.3
var puzzleEngine = require('../../utils/puzzleEngine.js');
var timelineService = require('../../services/timelineService.js');
var leaderboardService = require('../../services/leaderboardService.js');
var userService = require('../../services/userService.js');
var authService = require('../../services/authService.js');
var safeArea = require('../../utils/safeArea.js');
var puzzleSoundService = require('../../services/puzzleSoundService.js');

var STORAGE_KEY_HIGH = 'puzzle_high_score';
var MISSION_SCORE = 5000;
var MISSION_REWARD = 50;
var GAME_DURATION = 600; // 10分钟

function genStars(n) {
  var a = [];
  for (var i = 0; i < n; i++) {
    var sz = Math.floor(Math.random() * 3 + 1);
    a.push({
      i: i,
      s: 'width:' + sz + 'rpx;height:' + sz + 'rpx;top:' + Math.floor(Math.random() * 100) + '%;left:' + Math.floor(Math.random() * 100) + '%;animation:starPulse ' + (Math.random() * 4 + 2).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite alternate;'
    });
  }
  return a;
}

function _missionStatus(score, missionClaimed) {
  if (missionClaimed) return 'completed';
  if (score >= MISSION_SCORE) return 'claim';
  return 'locked';
}

function _hasPlanet(user) {
  return !!(user && user.birthday && user.constellation);
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    board: [],
    score: 0,
    highScore: 0,
    selectedCell: null,
    missionClaimed: false,
    missionStatus: 'locked',
    gameOver: false,
    gameTime: GAME_DURATION,
    timeDisplay: '10:00',
    stars: genStars(40),
    noPlanet: false,
    eliminating: false,
    showScoreFloat: false,
    lastGain: 0
  },

  _timer: null,

  onLoad: function () {
    var user = userService.getUser();
    if (!_hasPlanet(user)) {
      this.setData({ noPlanet: true });
      return;
    }
    this.setData({ noPlanet: false });
    this._initGame();
    this._startTimer();
  },

  onCreatePlanet: function () {
    wx.navigateBack({ delta: 1 });
  },

  onUnload: function () {
    this._clearTimer();
  },

  _clearTimer: function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  _today: function () {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },

  _isClaimed: function () {
    // 云端优先判断：users.lastPuzzleDate 防止 Storage 丢失后重复领取
    var today = this._today();
    var user = userService.getUser();
    if (user && user.lastPuzzleDate === today) return true;
    // 本地兜底
    try {
      return wx.getStorageSync('puzzle_mission_date') === today;
    } catch (e) { return false; }
  },

  _refreshMission: function (score) {
    var claimed = this._isClaimed();
    var status = _missionStatus(score, claimed);
    this.setData({ missionClaimed: claimed, missionStatus: status });
  },

  _initGame: function () {
    this._clearTimer();
    var board = puzzleEngine.createBoard();
    if (!puzzleEngine.hasMoves(board)) board = puzzleEngine.createBoard();
    var highScore = 0;
    try { highScore = wx.getStorageSync(STORAGE_KEY_HIGH) || 0; } catch (e) {}
    var claimed = this._isClaimed();
    this.setData({
      board: board, score: 0, highScore: highScore, selectedCell: null,
      missionClaimed: claimed, missionStatus: _missionStatus(0, claimed),
      gameOver: false, gameTime: GAME_DURATION, timeDisplay: '10:00'
    });
    this._startTimer();
  },

  _startTimer: function () {
    var that = this;
    this._clearTimer();
    this._timer = setInterval(function () {
      if (that.data.gameOver) return;
      var t = that.data.gameTime - 1;
      that.setData({ gameTime: t, timeDisplay: Math.floor(t/60) + ':' + ((t%60) < 10 ? '0' : '') + (t%60) });
      if (t <= 0) that._endGame();
    }, 1000);
  },

  _endGame: function () {
    this._clearTimer();
    if (this.data.gameOver) return;
    this.setData({ gameOver: true, gameTime: 0, timeDisplay: '0:00' });
  },

  onCellTap: function (e) {
    if (this.data.gameOver) return;
    var r = parseInt(e.currentTarget.dataset.row), c = parseInt(e.currentTarget.dataset.col);
    var selected = this.data.selectedCell;
    if (!selected) { this.setData({ selectedCell: { r: r, c: c } }); return; }
    if (selected.r === r && selected.c === c) { this.setData({ selectedCell: null }); return; }

    var result = puzzleEngine.playMove(this.data.board, selected.r, selected.c, r, c);
    if (!result.valid) { this.setData({ selectedCell: { r: r, c: c } }); return; }

    var newScore = this.data.score + result.score, newHigh = this.data.highScore;
    if (newScore > newHigh) { newHigh = newScore; try { wx.setStorageSync(STORAGE_KEY_HIGH, newHigh); } catch (e) {} }

    // v1.2.2 消除反馈：音效 + 棋盘闪光 + 飘字
    puzzleSoundService.playMatch();
    this.setData({
      board: result.board, score: newScore, highScore: newHigh, selectedCell: null,
      eliminating: true, showScoreFloat: true, lastGain: result.score
    });
    setTimeout(this.setData.bind(this, { eliminating: false }), 280);
    setTimeout(this.setData.bind(this, { showScoreFloat: false }), 800);
    this._refreshMission(newScore);
    if (!puzzleEngine.hasMoves(result.board)) this._endGame();
  },

  onClaim: function () {
    if (this.data.missionClaimed || this.data.score < MISSION_SCORE) return;
    var today = this._today(), user = authService.getCurrentUser();
    if (user.constellation) leaderboardService.addStarLight(user.constellation, MISSION_REWARD);
    var cur = userService.getUser().starlight || 0;
    userService.saveUser({ starlight: cur + MISSION_REWARD });
    timelineService.addTimelineEvent({ icon: '🎮', title: '完成星座消消乐每日任务', description: '完成5000分挑战，获得' + MISSION_REWARD + '星光', date: today });
    // 写入云端 users.lastPuzzleDate 防止 Storage 丢失后重复领取
    userService.saveUser({ lastPuzzleDate: today });
    try { wx.setStorageSync('puzzle_mission_date', today); } catch (e) {}
    this.setData({ missionClaimed: true, missionStatus: 'completed' });
    wx.showToast({ title: '获得 +' + MISSION_REWARD + ' ⭐', icon: 'success' });
  },

  onRestart: function () { this._initGame(); },

  onBack: function () { this._clearTimer(); wx.navigateBack({ delta: 1 }); }
});
