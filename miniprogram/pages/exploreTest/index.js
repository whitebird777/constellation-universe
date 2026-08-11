/**
 * pages/exploreTest/index.js — 宇宙探索试炼 V3
 *
 * 首页融合答题模式 + 每日限制 + 挑战中断恢复
 */
var safeArea = require('../../utils/safeArea.js');
var exploreQuestions = require('../../data/exploreQuestions.js');
var leaderboardService = require('../../services/leaderboardService.js');
var userService = require('../../services/userService.js');
var authService = require('../../services/authService.js');
var timelineService = require('../../services/timelineService.js');

function _hasPlanet(user) {
  return !!(user && user.birthday && user.constellation);
}

var TOTAL_QUESTIONS = 5;
var REWARD_PER_CORRECT = 5;
var GAME_DURATION = 120;
var STORAGE_KEY = 'exploreTest_recorded_date';
var COMPLETED_KEY = 'exploreTest_completed_date';
var ACTIVE_KEY = 'exploreTest_active';

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    phase: 'ready',          // 'ready' | 'started' | 'result'
    questions: [],
    currentIndex: 0,
    selectedOption: null,
    answered: false,
    correctCount: 0,
    totalQuestions: TOTAL_QUESTIONS,
    countdown: GAME_DURATION,
    countdownDisplay: '120',
    reward: 0,
    todayClaimed: false,
    todayCompleted: false,
    noPlanet: false
  },

  _timer: null,

  onLoad: function () {
    var user = userService.getUser();
    if (!_hasPlanet(user)) {
      this.setData({ noPlanet: true });
      return;
    }
    this.setData({ noPlanet: false });

    // V2：云端优先判断每日完成状态，防止 Storage 丢失后重复领取
    var todayClaimed = this._isTodayClaimed();
    var todayCompleted = this._isTodayCompleted();
    var today = this._today();

    // 云端补校验
    if (!todayClaimed && user.lastExploreTestDate === today) {
      todayClaimed = true;
    }
    if (!todayCompleted && user.lastExploreTestDate === today) {
      todayCompleted = true;
      this._markCompleted(); // 补写本地
    }

    this.setData({ todayClaimed: todayClaimed, todayCompleted: todayCompleted });

    if (todayCompleted) {
      // 今天已完成，加载题目仅用于展示
      var questions = exploreQuestions.pickRandom(TOTAL_QUESTIONS);
      this.setData({ questions: questions });
      return;
    }

    // 检查是否有活跃挑战
    var active = this._loadActive();
    if (active) {
      this._restoreActive(active);
    } else {
      var questions = exploreQuestions.pickRandom(TOTAL_QUESTIONS);
      this.setData({ questions: questions });
    }
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

  /* ── 日期相关 ── */
  _today: function () {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },

  _now: function () {
    return Date.now();
  },

  _isTodayClaimed: function () {
    try {
      return wx.getStorageSync(STORAGE_KEY) === this._today();
    } catch (e) { return false; }
  },

  _isTodayCompleted: function () {
    try {
      return wx.getStorageSync(COMPLETED_KEY) === this._today();
    } catch (e) { return false; }
  },

  _markCompleted: function () {
    var today = this._today();
    try { wx.setStorageSync(COMPLETED_KEY, today); } catch (e) {}
  },

  /* ── 活跃挑战持久化 ── */
  _saveActive: function () {
    var data = {
      startTime: this.data.countdown > 0 ? this._now() + (this.data.countdown * 1000) : this._now(),
      questions: this.data.questions,
      currentIndex: this.data.currentIndex,
      correctCount: this.data.correctCount,
      selectedOption: this.data.selectedOption,
      answered: this.data.answered
    };
    try { wx.setStorageSync(ACTIVE_KEY, data); } catch (e) {}
  },

  _loadActive: function () {
    try {
      var data = wx.getStorageSync(ACTIVE_KEY);
      if (!data || !data.questions || data.questions.length === 0) return null;
      return data;
    } catch (e) { return null; }
  },

  _clearActive: function () {
    try { wx.removeStorageSync(ACTIVE_KEY); } catch (e) {}
  },

  _restoreActive: function (active) {
    var now = this._now();
    // startTime 是挑战截止时间戳
    var endTime = active.startTime;
    var remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

    if (remaining <= 0) {
      // 时间已耗尽 → 直接结算
      this.setData({
        questions: active.questions,
        currentIndex: active.currentIndex,
        correctCount: active.correctCount,
        countdown: 0,
        countdownDisplay: '0',
        phase: 'started'
      });
      this._endGame();
      return;
    }

    // 还有剩余时间 → 恢复到进行中状态
    this.setData({
      questions: active.questions,
      currentIndex: active.currentIndex,
      correctCount: active.correctCount,
      selectedOption: active.selectedOption != null ? active.selectedOption : null,
      answered: !!active.answered,
      countdown: remaining,
      countdownDisplay: String(remaining),
      phase: 'started'
    });
    this._startTimer();
  },

  /* ── 发放星光奖励 ── */
  _grantReward: function (correctCount) {
    if (this._isTodayClaimed()) return 0;
    // 云端二次校验：users.lastExploreTestDate 防止 Storage 丢失后重复领取
    var user = userService.getUser();
    if (user.lastExploreTestDate === this._today()) return 0;

    var reward = correctCount * REWARD_PER_CORRECT;
    if (reward <= 0) return 0;

    if (user.constellation) {
      leaderboardService.addStarLight(user.constellation, reward);
    }
    var cur = userService.getUser().starlight || 0;
    userService.saveUser({ starlight: cur + reward });

    var today = this._today();
    // 写入云端 users.lastExploreTestDate 防止 Storage 丢失后重复领取
    userService.saveUser({ lastExploreTestDate: today });
    try { wx.setStorageSync(STORAGE_KEY, today); } catch (e) {}

    return reward;
  },

  _endGame: function () {
    this._clearTimer();
    this._clearActive();
    if (this.data.phase === 'result') return;

    var reward = this._grantReward(this.data.correctCount);
    this._markCompleted();

    // 写入宇宙日志
    var correct = this.data.correctCount;
    var desc = '完成星座试炼挑战，答对 ' + correct + ' / ' + TOTAL_QUESTIONS + ' 题';
    if (reward > 0) {
      desc += '，获得 ' + reward + ' 星光。';
    } else {
      desc += '。';
    }
    timelineService.addTimelineEvent({
      icon: '🪐',
      title: '完成星座试炼',
      description: desc,
      date: this._today()
    });

    this.setData({ phase: 'result', reward: reward, todayCompleted: true });
  },

  _startTimer: function () {
    var that = this;
    this._clearTimer();
    this._timer = setInterval(function () {
      var t = that.data.countdown - 1;
      if (t <= 0) {
        that._clearTimer();
        that.setData({ countdown: 0, countdownDisplay: '0' });
        that._endGame();
        return;
      }
      that.setData({ countdown: t, countdownDisplay: String(t) });
    }, 1000);
  },

  onBack: function () {
    this._clearTimer();
    wx.navigateBack({ delta: 1 });
  },

  /* ── 开始探索 ── */
  onStartExplore: function () {
    this.setData({ phase: 'started', countdown: GAME_DURATION, countdownDisplay: String(GAME_DURATION) });
    this._startTimer();
    this._saveActive();
  },

  /* ── 选择选项 ── */
  onSelectOption: function (e) {
    if (this.data.phase !== 'started') return;
    if (this.data.answered) return;
    var idx = parseInt(e.currentTarget.dataset.index);
    this.setData({ selectedOption: idx });
  },

  /* ── 确认提交答案 ── */
  onSubmitAnswer: function () {
    if (this.data.phase !== 'started') return;
    if (this.data.answered) return;
    var selected = this.data.selectedOption;
    if (selected === null) return;

    var questions = this.data.questions;
    var idx = this.data.currentIndex;
    var isCorrect = selected === questions[idx].answer;
    var correctCount = this.data.correctCount + (isCorrect ? 1 : 0);

    this.setData({
      answered: true,
      correctCount: correctCount
    });
    this._saveActive();
  },

  /* ── 下一题 ── */
  onNextQuestion: function () {
    var nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      this._clearTimer();
      this._endGame();
    } else {
      this.setData({
        currentIndex: nextIndex,
        selectedOption: null,
        answered: false
      });
      this._saveActive();
    }
  },

  /* ── 重新探索 ── */
  onRetry: function () {
    var questions = exploreQuestions.pickRandom(TOTAL_QUESTIONS);
    this._clearTimer();
    this._clearActive();
    this.setData({
      phase: 'ready',
      questions: questions,
      currentIndex: 0,
      selectedOption: null,
      answered: false,
      correctCount: 0,
      countdown: GAME_DURATION,
      countdownDisplay: String(GAME_DURATION)
    });
  },

  /* ── 返回首页（回到 ready 状态）── */
  onGoHome: function () {
    var questions = exploreQuestions.pickRandom(TOTAL_QUESTIONS);
    this._clearTimer();
    this._clearActive();
    this.setData({
      phase: 'ready',
      questions: questions,
      currentIndex: 0,
      selectedOption: null,
      answered: false,
      correctCount: 0,
      countdown: GAME_DURATION,
      countdownDisplay: String(GAME_DURATION)
    });
  }
});
