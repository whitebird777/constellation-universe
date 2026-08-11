/**
 * getAvatarUrls — 云函数
 *
 * 将 cloud:// 文件 ID 转换为临时 HTTPS URL。
 * 统一处理空头像和转换失败，确保排行榜跨用户头像可见。
 *
 * 输入：
 *   { files: ["cloud://env-id/avatars/xxx.png", "", "https://..."] }
 *
 * 输出：
 *   { urls: [
 *       { ok: true,  url: "https://..." },
 *       { ok: false, empty: true },
 *       { ok: false, failed: true }
 *     ]
 *   }
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function mapFile(file, tempURLs) {
  // 非 cloud:// → 不转换（空 / https / 未知）
  if (!file || file.indexOf('cloud://') !== 0) {
    return { ok: !!file, empty: !file, url: file || '' };
  }

  var entry = tempURLs.find(function (e) { return e.fileID === file; });
  if (!entry || entry.status !== 0 || !entry.tempFileURL) {
    return { ok: false, failed: true, url: '' };
  }

  return { ok: true, url: entry.tempFileURL };
}

exports.main = async function (event) {
  var files = (event && event.files) || [];
  if (!Array.isArray(files) || files.length === 0) {
    return { ok: true, urls: [] };
  }

  // 输入防御：限制最多 10 个文件
  if (files.length > 10) {
    files = files.slice(0, 10);
  }

  // 只提取 cloud:// 开头的文件，拒绝 http/https/空字符串/非法值
  var cloudFiles = files.filter(function (f) {
    return !!(f && typeof f === 'string' && f.indexOf('cloud://') === 0);
  });

  var tempURLs = [];
  if (cloudFiles.length > 0) {
    try {
      var result = await cloud.getTempFileURL({ fileList: cloudFiles });
      tempURLs = (result && result.fileList) || [];
    } catch (e) {
      console.error('[getAvatarUrls] getTempFileURL failed:', e);
    }
  }

  var urls = files.map(function (file) {
    return mapFile(file, tempURLs || []);
  });

  return { ok: true, urls: urls };
};
