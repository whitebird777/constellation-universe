/**
 * submitResonance — 云函数
 *
 * 接收用户提交的星座标签选择。
 *
 * 输入：
 *   { zodiacId: "aries", tags: ["热情","勇敢","率真","行动力","乐观"] }
 *
 * 输出：
 *   { ok: true }
 *   { ok: false, reason: "already_exists" }
 *   { ok: false, reason: "error", message: "..." }
 *
 * 规则：
 *   每个用户对每个星座仅可提交一次。
 *   重复提交返回 already_exists。
 *
 * 数据库集合：
 *   resonance_records   — 用户选择记录（openid + zodiacId + createdAt）
 *   resonance_tags      — 标签明细（openid + zodiacId + tag + createdAt）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async function (event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { ok: false, reason: 'error', message: '无法获取用户身份' };
  }

  const zodiacId = (event && event.zodiacId) || '';
  const tags = (event && event.tags) || [];

  if (!zodiacId) {
    return { ok: false, reason: 'error', message: '缺少星座ID' };
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    return { ok: false, reason: 'error', message: '缺少标签数据' };
  }

  try {
    // 检查是否已有记录
    const existRes = await db.collection('resonance_records')
      .where({ openid: openid, zodiacId: zodiacId })
      .count();

    if (existRes.total > 0) {
      return { ok: false, reason: 'already_exists' };
    }

    const now = new Date();

    // 写入记录
    await db.collection('resonance_records').add({
      data: {
        openid: openid,
        zodiacId: zodiacId,
        createdAt: now
      }
    });

    // 批量写入标签
    var tagPromises = tags.map(function (tag) {
      return db.collection('resonance_tags').add({
        data: {
          openid: openid,
          zodiacId: zodiacId,
          tag: tag,
          createdAt: now
        }
      });
    });

    await Promise.all(tagPromises);

    return { ok: true };
  } catch (err) {
    console.error('[submitResonance] error:', err);
    return { ok: false, reason: 'error', message: err.message || '提交失败' };
  }
};
