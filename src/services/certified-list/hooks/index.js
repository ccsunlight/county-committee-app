"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const CertifiedListModel = require("../certified-list-model");

exports.before = {
  all: [],
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
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [
    function(hook) {
      // Only import list if members have not been imported.
      if (hook.result.isApproved && !hook.result.isImported) {
        const membersToImport = hook.result.members;

        membersToImport.forEach((ccMember, index) => {
          CountyCommitteeMemberModel.create(ccMember, function(
            err,
            addedMember
          ) {
            if (err) console.error(err);

            // If all members are imported, set the flag to true.
            if (index === membersToImport.length - 1) {
              CertifiedListModel.findByIdAndUpdate(
                hook.result._id,
                { isImported: true },
                {},
                success => {}
              );
            }
          });
        });
      }
    },
    globalHooks.logAction
  ],
  remove: [globalHooks.logAction]
};
