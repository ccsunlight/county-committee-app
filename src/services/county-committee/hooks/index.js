"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const slugify = require("slugify");
const os = require("os");
const fs = require("fs");

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [generateAlias],
  update: [generateAlias],
  patch: [generateAlias],
  remove: []
};

function generateAlias(hook) {
  hook.data.alias = slugify(
    hook.data.county + " " + hook.data.party + " County Committee"
  ).toLowerCase();
}

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
