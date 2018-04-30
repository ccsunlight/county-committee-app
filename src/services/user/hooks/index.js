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
  create: [],
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
      return _hash(hook.data.changepassword).then(function(hashedPassword) {
        //
        // Password is being hashed somewhere further down the line
        // by the local authentication strategy so hashing it here
        // doublehashes would corrupt the pw.
        //
        // @todo find where it's being hashed automatically
        //
        hook.data.password = hook.data.changepassword;
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
    }
  }
}

exports.after = {
  all: [_idToId],
  find: [_idToId],
  get: [_idToId],
  create: [_idToId, globalHooks.logAction],
  update: [_idToId, globalHooks.logAction],
  patch: [_idToId, globalHooks.logAction],
  remove: [_idToId, globalHooks.logAction]
};
