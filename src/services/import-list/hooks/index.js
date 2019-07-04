"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const AppointedListModel = require("../import-list-model");
const TermService = require("../../term");

exports.before = {
  all: [],
  find: [
    // Excludes the "positions" property from finds
    // to avoid memory overload of returning
    // 1000+ array.
    // @todo move positions to their own collection
    function(context) {
      context.params.query.$select = { positions: 0 };

      return context;
    }
  ],
  get: [],
  create: [savePartyCallJsonDataCSV],
  update: [savePartyCallJsonDataCSV],
  patch: [savePartyCallJsonDataCSV],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [globalHooks.logAction],
  update: [
    globalHooks.logAction,
    function(context) {
      return new Promise(function(resolve, reject) {
        if (context.data.approved && context.data.status !== "Completed") {
          const TermService = context.app.service(
            context.app.get("apiPath") + "/term"
          );

          TermService.get(context.data.term_id).then(function(term) {
            TermService.importMembersToTerm(context.data.members, term, {
              bulkFields: { ...context.data.bulkFields },
              upsert: context.data.upsert,
              conditionals: {
                ...context.data.conditionals
              }
            })
              .then(async importResults => {
                const result = await context.service.patch(
                  { _id: context.data._id },
                  { status: "Completed", importResults: importResults }
                );

                resolve(context);
              })
              .catch(err => {
                console.log(err);
                reject(err);
              });
          });
        } else {
          return context;
        }
      });
    }
  ],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};

/**
 * Checks for a data json string for party call and if present uses that
 * to create the party call. For use with JSON rest POST requests.
 *
 * @param {Object} context The hook context
 * @return {Object} The modified hook context
 */
function savePartyCallJsonDataCSV(context) {
  if (context.data.hasOwnProperty("file_data")) {
    let csvBase64DataObject = context.data.file_data.pop();
    if (csvBase64DataObject) {
      let csvFileTempFilePath = context.app
        .service("utils")
        .saveBase64CSVDataToTempFile(
          csvBase64DataObject.src,
          csvBase64DataObject.title
        );

      context.data.filepath = csvFileTempFilePath;
    }
  }

  return context;
}