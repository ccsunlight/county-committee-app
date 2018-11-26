"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const PartyCallModel = require("../party-call-model");
const os = require("os");
const fs = require("fs");

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
              PartyCallModel.findByIdAndUpdate(
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
 * Takes a string of data and saves it to a temp file
 * @param {String} base64Data A string of base64 data with or without the data uri prefix.
 * @param {String} filename
 * @returns {String} The full path of the newly created temp file
 */
function saveBase64DataToTempFile(base64Data, filename) {
  const tempFileFullPath = os.tmpdir() + "/" + filename;
  let utf8encoded;
  // Extracts the base64 data prefix from the json if present
  // @todo handle this cleaner with converting to base64
  if (base64Data.indexOf(",") > -1) {
    utf8encoded = Buffer.from(base64Data.split(",")[1], "base64").toString(
      "utf8"
    );
  } else {
    utf8encoded = Buffer.from(base64Data, "base64").toString("utf8");
  }

  fs.writeFileSync(tempFileFullPath, utf8encoded);

  return tempFileFullPath;
}

/**
 * Checks for a data json string for party call and if present uses that
 * to create the party call. For use with JSON rest POST requests.
 *
 * @param {Object} context The hook context
 * @return {Object} The modified hook context
 */
function savePartyCallJsonDataCSV(context) {
  if (context.data.hasOwnProperty("party_call_file_data")) {
    let csvBase64DataObject = context.data.party_call_file_data.pop();
    if (csvBase64DataObject) {
      let csvFileTempFilePath = saveBase64DataToTempFile(
        csvBase64DataObject.src,
        csvBase64DataObject.title
      );

      context.data.filepath = csvFileTempFilePath;
    }
  }

  return context;
}
