'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const errorHandler = require('feathers-errors/handler');


exports.before = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
};

function _idToId(hook) {

      if (hook.result) {
        if (hook.result.data) {
            hook.result.data.map(function(record) {
                record.id = record._id;
                return record;
            });
        } else if (hook.result._id) {
            hook.result.id = hook.result._id;
            console.log(hook.result);
        }
      }
  }

exports.after = {
    all: [_idToId],
    find: [_idToId],
    get: [_idToId],
    create: [_idToId],
    update: [_idToId],
    patch: [_idToId],
    remove: [_idToId]
};