"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const auth = require("feathers-authentication").hooks;
const mongoose = require("mongoose");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const converter = require("json-2-csv");

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
  all: [],
  find: [],
  get: [
    function(context) {
      if (context.params.query.format === "csv") {
        return new Promise((resolve, reject) => {
          CountyCommitteeMemberModel.find({ term_id: context.result._id }).then(
            members => {
              converter
                .json2csvAsync(JSON.parse(JSON.stringify(members)))
                .then(csv => {
                  context.result = csv;
                  resolve(context);
                });
            }
          );
        }).catch(e => {
          reject(e);
        });
      }
    }
  ],
  create: [],
  update: [],
  patch: [],
  remove: []
};
