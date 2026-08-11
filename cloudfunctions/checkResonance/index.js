/**
 * checkResonance — 云函数
 *
 * 检查用户是否已完成某星座的标签选择。
 *
 * 输入：
 *   { zodiacId: "aries" }
 *
 * 输出：
 *   { completed: true,  tags: ["热情","勇敢",...], recordId: "xxx" }
 *   { completed: false, tags: [] }
 *
 * 数据库集合：
 *   resonance_records   — 查询是否已提交
 *   resonance_tags      — 查询已选择标签
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async function (event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { completed: false, tags: [], reason: 'no_openid' };
  }

  const zodiacId = (event && event.zodiacId) || '';

  if (!zodiacId) {
    return { completed: false, tags: [], reason: 'no_zodiacId' };
  }

  try {
    // 查询记录
    const recordRes = await db.collection('resonance_records')
      .where({ openid: openid, zodiacId: zodiacId })
      .get();

    if (!recordRes.data || recordRes.data.length === 0) {
      return { completed: false, tags: [] };
    }

    const record = recordRes.data[0];

    // 查询标签
    const tagRes = await db.collection('resonance_tags')
      .where({ openid: openid, zodiacId: zodiacId })
      .get();

    var tags = (tagRes.data || []).map(function (r) { return r.tag; });

    return { completed: true, tags: tags, recordId: record._id };
  } catch (err) {
    console.error('[checkResonance] error:', err);
    return { completed: false, tags: [], reason: 'error' };
  }
};
