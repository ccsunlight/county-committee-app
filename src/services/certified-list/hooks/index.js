"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const CertifiedListModel = require("../certified-list-model");

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [saveCertifiedListJsonDataPDF],
  update: [saveCertifiedListJsonDataPDF],
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

/**
 * Checks for a data json string for party call and if present uses that
 * to create the party call. For use with JSON rest POST requests.
 *
 * @param {Object} context The hook context
 * @return {Object} The modified hook context
 */
function saveCertifiedListJsonDataPDF(context) {
  if (context.data.hasOwnProperty("file_data")) {
    let csvBase64DataObject = context.data.file_data.pop();
    debugger;
    if (csvBase64DataObject) {
      let csvFileTempFilePath = context.app
        .service("utils")
        .saveBase64PDFDataToTempFile(
          csvBase64DataObject.src,
          csvBase64DataObject.title
        );
      context.data.filepath = csvFileTempFilePath;
    }
  }

  return context;
}
