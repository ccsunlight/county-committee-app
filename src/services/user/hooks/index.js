'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const errorHandler = require('feathers-errors/handler');
const local = require('feathers-authentication-local');

exports.before = {
    all: [],
    find: [],
    get: [],
    create: [local.hooks.hashPassword()],
    update: [_passwordChangeHandler, local.hooks.hashPassword()],
    patch: [],
    remove: []
};

function _passwordChangeHandler(hook) {

    if (hook.data.changepassword && hook.data.changepassword.length > 0) {
        if (hook.data.changepassword === hook.data.confirmpassword) {
            console.log('new pw', hook.data.changepassword );
            hook.data.password = hook.data.changepassword;
            
        }
    }
}

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