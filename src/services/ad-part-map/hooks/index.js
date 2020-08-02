"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const auth = require("feathers-authentication").hooks;
const mongoose = require("mongoose");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const converter = require("json-2-csv");
const saveJSONDataToCSV = require("../../../utils/saveJSONDataToCSV");

exports.before = {
  all: [
    // auth.verifyToken(),
    // auth.populateUser(),
    // auth.restrictToAuthenticated()
  ],
  find: [],
  get: [],
  create: [saveJSONDataToCSV],
  update: [saveJSONDataToCSV],
  patch: [saveJSONDataToCSV],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
