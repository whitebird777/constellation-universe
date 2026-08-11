/**
 * getExplorationProgress — 云函数
 *
 * 查询当前用户的星座探索进度。
 *
 * 输出：
 *   { count: 3, completed: ["aries", "leo", "pisces"] }
 *
 * 数据源：
 *   resonance_records 集合
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async function () {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { count: 0, completed: [] };
  }

  try {
    const res = await db.collection('resonance_records')
      .where({ openid: openid })
      .get();

    const records = res.data || [];
    const completed = records.map(function (r) { return r.zodiacId; });

    return { count: completed.length, completed: completed };
  } catch (err) {
    console.error('[getExplorationProgress] error:', err);
    return { count: 0, completed: [] };
  }
};
