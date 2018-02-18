'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const slugify = require('slugify')

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [generateAlias],
  update: [generateAlias],
  patch: [generateAlias],
  remove: []
};

function generateAlias(hook){

    hook.data.alias = slugify(hook.data.county + ' ' + hook.data.party + ' County Committee').toLowerCase(); 
  
}

exports.after = {
  all: [function(hook) 
  { 
    if (hook.result.data) {
      hook.result.data.map(function(record) {
        record.id = record._id;
        return record;
      });
    } else {

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
      
    }
  }],
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
