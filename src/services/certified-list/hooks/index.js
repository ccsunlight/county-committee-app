"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
var mongoose = require("mongoose");

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
  get: [
    async function(context) {
      if (context.params.query.format === "csv") {
        console.log("format csv");

        const csv = await context.service.generateCSV(
          mongoose.Types.ObjectId(context.id)
        );

        context.result = csv;
      }

      return context;
    }
  ],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [
    // function(context) {
    //   console.log("generate CSV", context.result._id);
    //   return new Promise((resolve, reject) => {
    //     context.service
    //       .generateCSV(mongoose.Types.ObjectId(context.result._id))
    //       .then(csv => {
    //         // context.result.positions = "";
    //         context.result.positions = csv.split("\n");
    //         resolve(context);
    //       });
    //   });
    // }
  ],
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
// function saveCertifiedListJsonDataPDF(context) {
//   if (context.data.hasOwnProperty("file_data")) {
//     let csvBase64DataObject = context.data.file_data.pop();
//     if (csvBase64DataObject) {
//       let csvFileTempFilePath = context.app
//         .service("utils")
//         .saveBase64PDFDataToTempFile(
//           csvBase64DataObject.src,
//           csvBase64DataObject.title
//         );
//       context.data.filepath = csvFileTempFilePath;
//     }
//   }

//   return context;
// }
