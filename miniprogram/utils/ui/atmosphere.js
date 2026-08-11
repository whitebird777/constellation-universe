/**
 * utils/ui/atmosphere.js — Atmosphere Generator
 */
function genStars(n, size) {
  var a = [];
  for (var i = 0; i < n; i++) {
    var s = (Math.random() * (size.max - size.min) + size.min).toFixed(0);
    var dur = (Math.random() * 4 + 2).toFixed(1);
    var del = (Math.random() * 6).toFixed(1);
    a.push({
      i: i,
      s: 'width:' + s + 'rpx;height:' + s + 'rpx;'
        + 'top:' + Math.floor(Math.random() * 100) + '%;'
        + 'left:' + Math.floor(Math.random() * 100) + '%;'
        + 'animation:starPulse ' + dur + 's ease-in-out ' + del + 's infinite alternate;'
    });
  }
  return a;
}

function genDust(n) {
  var a = [];
  for (var i = 0; i < n; i++) {
    var dur = (Math.random() * 8 + 8).toFixed(1);
    var del = (Math.random() * 10).toFixed(1);
    a.push({
      i: i,
      s: 'width:1rpx;height:1rpx;'
        + 'top:' + Math.floor(Math.random() * 100) + '%;'
        + 'left:' + Math.floor(Math.random() * 100) + '%;'
        + 'animation:dustFloat ' + dur + 's ease-in-out ' + del + 's infinite;'
    });
  }
  return a;
}

module.exports = { genStars: genStars, genDust: genDust };
