'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const errorHandler = require('feathers-errors/handler');
const local = require('feathers-authentication-local');
const _hash = require('../../invite/hash'); // @hack

exports.before = {
    all: [],
    find: [],
    get: [],
    create: [local.hooks.hashPassword()],
    update: [_passwordChangeHandler],
    patch: [],
    remove: []
};

/**
 * Checks if user submitted a new password and hashes it.
 *
 * @param      {<type>}  hook    The hook
 * @return     {Promise}  { description_of_the_return_value }
 */
function _passwordChangeHandler(hook) {

    if (hook.data.changepassword && hook.data.changepassword.length > 0) {
        if (hook.data.changepassword === hook.data.confirmpassword) {
            
            return _hash(hook.data.changepassword).then(function(hashedPassword){

                hook.data.password = hashedPassword;
            });
            
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