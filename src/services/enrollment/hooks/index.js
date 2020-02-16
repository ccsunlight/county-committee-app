"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [savePartyCallJsonDataCSV],
  update: [
    savePartyCallJsonDataCSV,

    // @todo Why is this here?
    function(hook) {
      delete hook.data.updatedAt;
      return hook;
    }
  ],
  patch: [savePartyCallJsonDataCSV],
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
