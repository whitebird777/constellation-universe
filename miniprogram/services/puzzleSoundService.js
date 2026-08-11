/**
 * puzzleSoundService.js — 消消乐音效服务 v1.0
 *
 * 独立单例 InnerAudioContext，仅用于消除音效。
 * 不与 musicService.js 共享实例，不影响背景音乐。
 */

var _effectAudio = null;

function _getAudio() {
  if (_effectAudio) return _effectAudio;
  _effectAudio = wx.createInnerAudioContext();
  _effectAudio.src = '/assets/audio/effect/match.wav';
  _effectAudio.loop = false;
  _effectAudio.autoplay = false;
  _effectAudio.volume = 0.6;
  return _effectAudio;
}

/**
 * 播放消除音效（短促单次播放）
 */
function playMatch() {
  var audio = _getAudio();
  // 从头开始播放
  audio.seek(0);
  audio.play();
}

/**
 * 释放实例（页面卸载时可调用）
 */
function destroy() {
  if (_effectAudio) {
    _effectAudio.destroy();
    _effectAudio = null;
  }
}

module.exports = {
  playMatch: playMatch,
  destroy: destroy
};
