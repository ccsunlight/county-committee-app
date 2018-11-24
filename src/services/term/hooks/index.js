"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const auth = require("feathers-authentication").hooks;

exports.before = {
  all: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // auth.restrictToAuthenticated()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [
    function(hook) {
      if (hook.result.data) {
        hook.result.data.map(function(record) {
          record.id = record._id;
          return record;
        });
      } else {
        // console.log(hook.result);
      }
    }
  ],
  find: [
    function(hook) {
      if (hook.result.data) {
        hook.result.data.map(function(record) {
          record.id = record._id;
          return record;
        });
      }
    }
  ],
  get: [
    function(hook) {
      if (hook.result) {
        hook.result.id = hook.result._id;
      }
    }
  ],
  create: [
    function(hook) {
      if (hook.result) {
        hook.result.id = hook.result._id;
      }
    }
  ],
  update: [],
  patch: [],
  remove: []
};
