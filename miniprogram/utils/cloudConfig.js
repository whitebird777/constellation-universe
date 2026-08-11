/**
 * cloudConfig.js — Cloud Configuration
 *
 * 统一管理云开发集合名称。
 * 所有 Service 引用此处，禁止写字符串。
 */
var CLOUD = {
  ENV_ID: 'cloud1-d3g8wetaeeee3e839',

  USERS:              'users',
  CONSTELLATIONS:     'constellation_stats',
  GIFT_RECORDS:       'gift_records',
  TIMELINE:           'timeline',
  PLANET:             'planet',
  MESSAGES:           'messages',
  RESONANCE_RECORDS:  'resonance_records',
  RESONANCE_TAGS:     'resonance_tags'
};

module.exports = { CLOUD: CLOUD };
