'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [function(hook) 
  { 
    if (hook.result.data) {
      hook.result.data.map(function(record) {
        record.id = record._id;
        return record;
      });
    } else {
      console.log(hook.result);
    }
  }],
  find: [function(hook) 
  { 
    if (hook.result.data) {
      hook.result.data.map(function(record) {
        record.id = record._id;
        return record;
      });
    } else {
      console.log(hook.result);
    }
  }],
  get: [],
  create: [],
  update: [globalHooks.logAction],
  patch: [],
  remove: []
};
