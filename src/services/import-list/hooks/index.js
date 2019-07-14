"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const AppointedListModel = require("../import-list-model");
const TermService = require("../../term");
const converter = require("json-2-csv");

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
  create: [saveJSONDataToCSV],
  update: [saveJSONDataToCSV],
  patch: [saveJSONDataToCSV],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [
    function(context) {
      if (context.params.query.format === "csv") {
        return new Promise((resolve, reject) => {
          const modifiedRows = context.result.importResults.modifiedResults.map(
            (result, index) => {
              return {
                import_status: "modified",
                ...result.member
              };
            }
          );

          const insertedRows = context.result.importResults.insertedResults.map(
            (result, index) => {
              return {
                import_status: "inserted",
                ...result.member
              };
            }
          );

          const notMatchedRows = context.result.importResults.notMatchedResults.map(
            (result, index) => {
              return {
                import_status: "unmatched",
                ...result.member
              };
            }
          );

          const rows = [...modifiedRows, ...insertedRows, ...notMatchedRows];

          converter.json2csvAsync(rows).then(csv => {
            context.result = csv;
            resolve(context);
          });
        });
      }
    }
  ],
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
            context.service
              .importMembersToTerm(context.data, term, {
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
 * Checks for a data json string for a list and if present uses that
 * to create the list. For use with JSON rest POST requests.
 *
 * @param {Object} context The hook context
 * @return {Object} The modified hook context
 */
function saveJSONDataToCSV(context) {
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
