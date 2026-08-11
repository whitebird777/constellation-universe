/**
 * resetUniverse — 云函数：Beta 测试环境初始化
 *
 * 安全流程：
 *   1. 获取 openid → 检查管理员白名单
 *   2. 校验管理员密码
 *   3. 清理用户产生的测试数据
 *   4. 返回清理报告
 *
 * 安全要求：
 *   条件1（管理员白名单）+ 条件2（密码验证）缺一不可。
 *
 * 输入：
 *   { password: "管理员密码" }
 *
 * 输出：
 *   { success: true, result: { users:N, planets:N, resonance_records:N, ... } }
 *   { success: false, reason: "unauthorized" | "wrong_password" | "error" }
 */

var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var _ = db.command;

// ★ 管理员 OpenID 白名单（仅云函数端）
var ADMIN_OPENIDS = [
  'oWLFp3UAmDHn1Dw-VdigHtlYNAR0'
];

// ★ 管理员操作密码（仅云函数端）
var ADMIN_PASSWORD = 'Abcd342800?';

/**
 * 分页删除集合中所有文档（微信云开发单次 delete 最多 1 条，需逐条删除）
 */
async function clearCollection(name) {
  var totalDeleted = 0;
  var MAX_LIMIT = 100;

  while (true) {
    var res = await db.collection(name).limit(MAX_LIMIT).get();
    var docs = res.data || [];
    if (docs.length === 0) break;

    var deletePromises = docs.map(function (doc) {
      return db.collection(name).doc(doc._id).remove();
    });
    await Promise.all(deletePromises);
    totalDeleted += docs.length;
  }

  return totalDeleted;
}

exports.main = async function (event) {
  var wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;

  // ── 1. 管理员白名单校验 ──
  if (!openid || ADMIN_OPENIDS.indexOf(openid) === -1) {
    return { success: false, reason: 'unauthorized' };
  }

  // ── 2. 密码校验 ──
  var password = (event && event.password) || '';
  if (password !== ADMIN_PASSWORD) {
    return { success: false, reason: 'wrong_password' };
  }

  // ── 3. 执行数据清理 ──
  var result = {};
  var collections = [
    'users',
    'constellation_stats',
    'resonance_records',
    'resonance_tags',
    'timeline',
    'planet',
    'gift_records',
    'messages'
  ];

  try {
    for (var i = 0; i < collections.length; i++) {
      var name = collections[i];
      try {
        var count = await clearCollection(name);
        result[name] = count;
        console.log('[resetUniverse] cleared ' + name + ': ' + count);
      } catch (err) {
        // 集合可能不存在，跳过
        if (err && err.errCode === -502005) {
          result[name] = 0;
          console.log('[resetUniverse] collection not found: ' + name);
        } else {
          result[name] = -1;
          console.error('[resetUniverse] error clearing ' + name + ':', err);
        }
      }
    }

    return { success: true, result: result };
  } catch (err) {
    console.error('[resetUniverse] fatal error:', err);
    return { success: false, reason: 'error', message: err.message || '清理过程出错' };
  }
};
