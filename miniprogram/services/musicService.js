/**
 * musicService.js — 深空背景音乐服务
 *
 * 极简设计：单例 InnerAudioContext，仅负责播放/暂停切换。
 * 不实现状态同步、进度监听、多页面协调。
 */
var _audio = null;

function getAudio() {
  if (_audio) return _audio;
  _audio = wx.createInnerAudioContext();
  _audio.src = '/assets/audio/bgm.mp3';
  _audio.loop = true;
  _audio.autoplay = false;
  return _audio;
}

/**
 * 切换播放/暂停
 * @returns {{ playing: boolean }}
 */
function toggle() {
  var audio = getAudio();
  if (audio.paused) {
    audio.play();
    return { playing: true };
  } else {
    audio.pause();
    return { playing: false };
  }
}

/**
 * 获取当前播放状态
 * @returns {boolean}
 */
function isPlaying() {
  if (!_audio) return false;
  return !_audio.paused;
}

/**
 * 销毁实例（仅用于宇宙重置场景）
 */
function destroy() {
  if (_audio) {
    _audio.destroy();
    _audio = null;
  }
}

module.exports = {
  getAudio: getAudio,
  toggle: toggle,
  isPlaying: isPlaying,
  destroy: destroy
};
