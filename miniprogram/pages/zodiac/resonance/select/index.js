// pages/zodiac/resonance/select/index.js — 星座标签选择
var ZodiacData = require('../../../../data/zodiac.js');
var ZODIAC = ZodiacData.ZODIAC;
var SHARED_TAGS = ZodiacData.SHARED_TAGS;
var safeArea = require('../../../../utils/safeArea.js');

function genStars(n) {
  var a = [];
  for (var i = 0; i < n; i++) {
    var sz = Math.floor(Math.random() * 2) + 1;
    a.push({
      i: i,
      s: 'width:' + sz + 'rpx;height:' + sz + 'rpx;top:' + Math.floor(Math.random() * 100) + '%;left:' + Math.floor(Math.random() * 100) + '%;animation:starPulse ' + (Math.random() * 4 + 2).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite alternate;'
    });
  }
  return a;
}

function countSelected(arr) {
  var c = 0;
  (arr || []).forEach(function (t) { if (t.selected) c++; });
  return c;
}

function makeTags(list) {
  return (list || []).map(function (name) {
    return { name: name, selected: false };
  });
}

function getSelectedTagNames(light, nature, deep) {
  var names = [];
  (light || []).forEach(function (t) { if (t.selected) names.push(t.name); });
  (nature || []).forEach(function (t) { if (t.selected) names.push(t.name); });
  (deep || []).forEach(function (t) { if (t.selected) names.push(t.name); });
  return names;
}

Page({
  data: {
    statusBarHeight: safeArea.getStatusBarHeight(),
    zodiac: null,
    zodiacId: '',
    stars: genStars(30),
    lightTags: [],
    natureTags: [],
    deepTags: [],
    selectedCount: 0,
    submitted: false
  },

  onLoad: function (opts) {
    var id = opts.id || '';
    var zodiac = null;
    for (var i = 0; i < ZODIAC.length; i++) {
      if (ZODIAC[i].id === id) {
        zodiac = ZODIAC[i];
        break;
      }
    }
    if (!zodiac) zodiac = ZODIAC[0];

    var that = this;
    wx.showLoading({ title: '加载中...', mask: true });

    // 调用云函数检查是否已完成
    wx.cloud.callFunction({
      name: 'checkResonance',
      data: { zodiacId: zodiac.id }
    }).then(function (cfRes) {
      wx.hideLoading();
      var result = cfRes && cfRes.result;

      if (result && result.completed) {
        // 已完成 → 弹窗展示
        that.setData({ zodiac: zodiac, zodiacId: zodiac.id, submitted: true });
        var tagStr = (result.tags || []).join('、');
        wx.showModal({
          title: '你已经完成该星座的标签选择',
          content: '已选择标签：' + tagStr,
          showCancel: false,
          confirmText: '知道了',
          success: function () {
            that.onBack();
          }
        });
      } else {
        // 未完成 → 正常进入选择
        var tagData = SHARED_TAGS || { light: [], nature: [], deep: [] };
        that.setData({
          zodiac: zodiac,
          zodiacId: zodiac.id,
          lightTags: makeTags(tagData.light),
          natureTags: makeTags(tagData.nature),
          deepTags: makeTags(tagData.deep)
        });
      }
    }).catch(function () {
      wx.hideLoading();
      // 云函数异常 → 降级为正常选择
      var tagData = SHARED_TAGS || { light: [], nature: [], deep: [] };
      that.setData({
        zodiac: zodiac,
        zodiacId: zodiac.id,
        lightTags: makeTags(tagData.light),
        natureTags: makeTags(tagData.nature),
        deepTags: makeTags(tagData.deep)
      });
    });
  },

  onBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  onTapTag: function (e) {
    if (this.data.submitted) return;
    var group = e.currentTarget.dataset.group;
    var idx = e.currentTarget.dataset.idx;
    var tags = this.data[group + 'Tags'];
    if (!tags || !tags[idx]) return;

    var allTags = this.data.lightTags.concat(this.data.natureTags).concat(this.data.deepTags);
    var currentCount = countSelected(allTags);

    if (!tags[idx].selected && currentCount >= 5) {
      wx.showToast({ title: '最多选择5个标签', icon: 'none', duration: 1500 });
      return;
    }

    tags[idx].selected = !tags[idx].selected;
    var update = {};
    update[group + 'Tags'] = tags;

    var all = update.lightTags || this.data.lightTags;
    var natureCheck = update.natureTags || this.data.natureTags;
    var deepCheck = update.deepTags || this.data.deepTags;
    update['selectedCount'] = countSelected(all.concat(natureCheck).concat(deepCheck));

    this.setData(update);
  },

  onSubmit: function () {
    if (this.data.selectedCount < 5) return;
    if (this.data.submitted) return;

    var that = this;
    wx.showModal({
      title: '确认提交',
      content: '为了保证共鸣数据真实性，\n每个星座仅有1次选择机会，\n选择后无法修改',
      cancelText: '再想想',
      confirmText: '确认提交',
      confirmColor: '#C8A96E',
      success: function (res) {
        if (!res.confirm) return;

        var selectedTags = getSelectedTagNames(
          that.data.lightTags, that.data.natureTags, that.data.deepTags
        );

        wx.showLoading({ title: '提交中...', mask: true });

        wx.cloud.callFunction({
          name: 'submitResonance',
          data: {
            zodiacId: that.data.zodiacId,
            tags: selectedTags
          }
        }).then(function (cfRes) {
          wx.hideLoading();
          var result = cfRes && cfRes.result;

          if (result && result.ok) {
            that.setData({ submitted: true });
            wx.showToast({ title: '星座标签已记录 ✨', icon: 'success', duration: 2000 });
            setTimeout(function () {
              that.onBack();
            }, 1500);
          } else if (result && result.reason === 'already_exists') {
            wx.showModal({
              title: '你已经完成该星座的标签选择',
              content: '每个星座仅可提交一次',
              showCancel: false,
              confirmText: '知道了'
            });
          } else {
            wx.showToast({ title: (result && result.message) || '提交失败，请重试', icon: 'none' });
          }
        }).catch(function () {
          wx.hideLoading();
          wx.showToast({ title: '提交失败，请重试', icon: 'none' });
        });
      }
    });
  }
});
