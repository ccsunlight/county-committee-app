"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const auth = require("feathers-authentication").hooks;
const mongoose = require("mongoose");

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
  patch: [
    async function(context) {
      if (context.data.approved) {
        await context.service.createMembersFromCertifiedList({
          term_id: mongoose.Types.ObjectId(context.id)
        });
      }
    }
  ],
  remove: []
};

// function(context) {
// Converts string id to ObjectId
// if (context.params.query && context.params.query.committee_id) {
//   context.params.query.committee_id = mongoose.Types.ObjectId(
//     context.params.query.committee_id
//   );
// }
// return context;
// }

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
