/**
 * checkAdmin — 云函数：管理员身份检查
 *
 * 对比当前用户 openid 与预设管理员白名单。
 * 白名单仅存储于云函数端，前端无感知。
 *
 * 输入：无
 * 输出：{ isAdmin: true | false }
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// ★ 管理员 OpenID 白名单（仅云函数端）
var ADMIN_OPENIDS = [
  'oWLFp3UAmDHn1Dw-VdigHtlYNAR0'
];

exports.main = async function (event, context) {
  var wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;

  if (!openid) {
    return { isAdmin: false };
  }

  var isAdmin = ADMIN_OPENIDS.indexOf(openid) !== -1;

  return { isAdmin: isAdmin };
};
