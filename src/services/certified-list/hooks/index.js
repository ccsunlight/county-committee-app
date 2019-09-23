"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const CountyCommitteeMemberModel = require("../../county-committee-member/county-committee-member-model");
const CertifiedListModel = require("../certified-list-model");
const mongoose = require("mongoose");

exports.before = {
  all: [],
  find: [],
  get: [
    async function(context) {
      if (context.params.query.format === "csv") {
        const csv = await context.service.generateCSV(
          mongoose.Types.ObjectId(context.id)
        );
        context.result = csv;
      }

      return context;
    }
  ],
  create: [saveCertifiedListJsonDataPDF],
  update: [saveCertifiedListJsonDataPDF],
  patch: [],
  remove: []
};

exports.after = {
  all: [
    // function(hook) {
    //   if (hook.result.data) {
    //     hook.result.data.map(function(record) {
    //       record.id = record._id;
    //       return record;
    //     });
    //   }
    // }
  ],
  find: [
    // function(hook) {
    //   if (hook.result.data) {
    //     hook.result.data.map(function(record) {
    //       record.id = record._id;
    //       return record;
    //     });
    //   }
    // }
  ],
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
function saveCertifiedListJsonDataPDF(context) {
  if (context.data.hasOwnProperty("file_data")) {
    let csvBase64DataObject = context.data.file_data.pop();
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
