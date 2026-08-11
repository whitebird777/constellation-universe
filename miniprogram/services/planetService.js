/**
 * planetService.js — 星球服务层
 *
 * 封装星球数据的读写操作。
 * 使用 Storage Adapter 作为统一存储后端，
 * 后续接入数据库时仅修改本层实现，页面无需变动。
 *
 * 接口：
 *   getPlanet()       → 获取当前星球状态
 *   savePlanet(data)  → 保存星球状态
 */

var storage = require('../utils/storage');

var DEFAULT_PLANET = {
  joinDate: '',
  lastVisitTime: '',
  recordedGrowthDays: [],
  timeline: []
};

/**
 * 获取当前星球状态
 *
 * 读取优先级：
 *   1. Storage（已持久化）
 *   2. app.globalData（自动迁移 → 写入 Storage）
 *   3. 默认空结构
 *
 * @returns {{ joinDate: string, lastVisitTime: string, recordedGrowthDays: number[], timeline: Array }}
 */
function getPlanet() {
  // 1. 从 Storage 读取
  var planet = storage.get(storage.KEYS.PLANET);

  if (planet) {
    return planet;
  }

  // 2. 兼容旧数据：从 globalData 迁移
  var app = getApp();
  if (app.globalData.joinDate || app.globalData.lastVisitTime) {
    planet = {
      joinDate: app.globalData.joinDate || '',
      lastVisitTime: app.globalData.lastVisitTime || '',
      recordedGrowthDays: app.globalData.recordedGrowthDays || [],
      timeline: app.globalData.timeline || []
    };
    // 立即持久化到 Storage
    storage.set(storage.KEYS.PLANET, planet);
    return planet;
  }

  // 3. 返回默认空结构
  return DEFAULT_PLANET;
}

/**
 * 保存星球状态
 *
 * 合并写入策略：读取现有数据 → 合并新字段 → 写入 Storage
 * 同步更新 globalData（过渡期兼容，后续版本移除）
 *
 * @param {{ joinDate?: string, lastVisitTime?: string, recordedGrowthDays?: number[], timeline?: Array }} data
 */
function savePlanet(data) {
  var planet = getPlanet();

  if (data.joinDate !== undefined) {
    planet.joinDate = data.joinDate;
  }
  if (data.lastVisitTime !== undefined) {
    planet.lastVisitTime = data.lastVisitTime;
  }
  if (data.recordedGrowthDays !== undefined) {
    planet.recordedGrowthDays = data.recordedGrowthDays;
  }
  if (data.timeline !== undefined) {
    planet.timeline = data.timeline;
  }

  storage.set(storage.KEYS.PLANET, planet);

  // 过渡期同步 globalData（后续版本移除）
  var app = getApp();
  app.globalData.joinDate = planet.joinDate;
  app.globalData.lastVisitTime = planet.lastVisitTime;
  app.globalData.recordedGrowthDays = planet.recordedGrowthDays;
  app.globalData.timeline = planet.timeline;
}

module.exports = {
  getPlanet: getPlanet,
  savePlanet: savePlanet
};
