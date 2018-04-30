'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const CacheMap = require('@feathers-plus/cache');
const { cache } = require('feathers-hooks-common');

var cacheMap = CacheMap({
  max: 10000,
  maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
}); // Keep the 10000 most recently used with a max age of 1 week

exports.before = {
  all: [],
  find: [],
  get: [cache(cacheMap, 'address')],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [cache(cacheMap, 'address')],
  create: [],
  update: [],
  patch: [],
  remove: []
};
