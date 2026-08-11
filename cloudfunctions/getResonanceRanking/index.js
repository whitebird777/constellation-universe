/**
 * getResonanceRanking — 云函数
 *
 * 统计某星座的标签共鸣排名。
 *
 * 输入：
 *   { zodiacId: "aries" }
 *
 * 输出：
 *   { totalUsers: 3, ranking: [{tag: "勇敢", count: 3}, ...] }
 *
 * 数据源：
 *   resonance_records — 计算参与人数
 *   resonance_tags    — 统计标签出现次数
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async function (event) {
  const zodiacId = (event && event.zodiacId) || '';

  if (!zodiacId) {
    return { totalUsers: 0, ranking: [] };
  }

  try {
    // 统计参与人数
    const countRes = await db.collection('resonance_records')
      .where({ zodiacId: zodiacId })
      .count();

    const totalUsers = countRes.total || 0;

    if (totalUsers === 0) {
      return { totalUsers: 0, ranking: [] };
    }

    // 获取所有标签
    const MAX_LIMIT = 100;
    var allTags = [];
    var offset = 0;
    var hasMore = true;

    while (hasMore) {
      var tagRes = await db.collection('resonance_tags')
        .where({ zodiacId: zodiacId })
        .skip(offset)
        .limit(MAX_LIMIT)
        .get();

      var batch = tagRes.data || [];
      allTags = allTags.concat(batch);
      offset += MAX_LIMIT;
      if (batch.length < MAX_LIMIT) hasMore = false;
    }

    // 统计标签频次
    var countMap = {};
    for (var i = 0; i < allTags.length; i++) {
      var tag = allTags[i].tag;
      countMap[tag] = (countMap[tag] || 0) + 1;
    }

    // 转为排名数组
    var ranking = [];
    var keys = Object.keys(countMap);
    for (var j = 0; j < keys.length; j++) {
      ranking.push({ tag: keys[j], count: countMap[keys[j]] });
    }

    // 排序：频次降序
    ranking.sort(function (a, b) { return b.count - a.count; });

    // 取 TOP5（数据>5 时截断）
    if (ranking.length > 5) {
      ranking = ranking.slice(0, 5);
    }

    return { totalUsers: totalUsers, ranking: ranking };
  } catch (err) {
    console.error('[getResonanceRanking] error:', err);
    return { totalUsers: 0, ranking: [] };
  }
};
