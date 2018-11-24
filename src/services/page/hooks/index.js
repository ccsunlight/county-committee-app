"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [
    // @todo Why is this here?
    function(hook) {
      delete hook.data.updatedAt;
      return hook;
    }
  ],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
