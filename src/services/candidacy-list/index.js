"use strict";

const fs = require("fs");
const path = require("path");
const pdfTextExtract = require("pdf-text-extract");
const CertifiedList = require("./certified-list-model");
const hooks = require("./hooks");
const CountyCommitteeMember = require("../county-committee-member/county-committee-member-model");
const CountyCommittee = require("../county-committee/county-committee-model");
const Term = require("../term/term-model");
const FeathersMongoose = require("feathers-mongoose");
const mongoose = require("mongoose");
const moment = require("moment");
const converter = require("json-2-csv");
const feathers = require("feathers");
function ccExtractionException(message) {
  this.message = message;
  this.name = "CCMemberException";
}

// Tokens to search PDF for
const DATA_START_DELIMITER = RegExp("Party Positions");
const DATA_END_DELIMITER = RegExp("Page [0-9]+ of [0-9]+");

function cleanRowsOfText(rawRowsOfText) {
  return rawRowsOfText
    .map(function(row) {
      return row.trim();
    })
    .filter(function(row, index) {
      if (row && row.length > 0) {
        return true;
      }
    });
}

function splitRowsOfTextInToArrays(rows, rowSize) {
  var arrayOfRows = [];

  for (let i = 0; i < rows.length; i += rowSize) {
    arrayOfRows.push(rows.slice(i, i + rowSize));
  }

  return arrayOfRows;
}

class Service extends FeathersMongoose.Service {
  extractTablesFromPDF(filepath) {
    return new Promise((resolve, reject) => {
      pdfTextExtract(filepath, (err, pages) => {
        if (err) {
          reject(err);
        }
        const dataTables = [];

        pages.forEach(function(page, index) {
          const lines = page.split("\n");
          let pageDataStartIndex, pageDataEndIndex;

          lines.forEach(function(line, index) {
            if (DATA_START_DELIMITER.test(line)) {
              pageDataStartIndex = index + 1;
            } else if (DATA_END_DELIMITER.test(line)) {
              pageDataEndIndex = index;
            }
          });

          const pageLinesWithData = lines.slice(
            pageDataStartIndex,
            pageDataEndIndex
          );

          const pageDataTables = pageLinesWithData.reduce(function(
            table,
            line,
            index
          ) {
            if (
              line === "" &&
              pageLinesWithData[index - 1] === "" &&
              pageLinesWithData[index + 1] !== "" &&
              index !== pageLinesWithData.length - 1
            ) {
              table.push({
                name: undefined,
                columnNames: undefined,
                rows: []
              });
            } else if (table.length) {
              if (line && !table[table.length - 1].name) {
                table[table.length - 1].name = line;
              } else if (line && !table[table.length - 1].columnNames) {
                table[table.length - 1].columnNames = line.split(/\s\s+/);
              } else if (line) {
                table[table.length - 1].rows.push(line.split(/\s\s+/));
              }
            }
            return table;
          },
          []);

          dataTables.push(...pageDataTables);
        });

        resolve(dataTables);
      });
    });
  }

  generateCSV(_id) {
    {
      const DELIMITER = ",";
      //const Utils = this.app.service("/utils");

      return new Promise((resolve, reject) => {
        const dataObjects = [];
        CertifiedList.findOne(_id).then(certifiedList => {
          certifiedList.positions.map(function(position) {
            // Go through all rows for each position and generate an object
            position.rows.forEach(function(row, rowIndex) {
              const dataObject = { positionName: position.name };

              // Go through each column and map the appropriate index of row to the object
              position.columnNames.forEach(function(columnName, colIndex) {
                dataObject[columnName] = row[colIndex];
              });

              dataObjects.push(dataObject);
            });
          });

          converter
            .json2csvAsync(dataObjects)
            .then(csv => {
              resolve(csv);
            })
            .catch(err => reject("ERROR: " + err.message));
        });
      });
    }
  }

  setup(app, path) {
    this.app = app;
  }

  create(params) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(params.filepath)) {
        reject("File does not exist: " + params.filepath);
        return;
      }

      this.extractTablesFromPDF(params.filepath).then(dataTables => {
        CertifiedList.create({ positions: dataTables })
          .then(certifiedList => {
            resolve(certifiedList);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }
}

module.exports = function() {
  const app = this;

  const options = {
    Model: CertifiedList,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  const service = new Service(options);

  service.setup(app, app.get("apiPath") + "/certified-list");

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/certified-list", service, function updateData(
    req,
    res,
    next
  ) {
    // If it's request in a csv format send a download attachment response
    // of the CSV text
    // @todo find a better way to handle this
    if (req.query.format === "csv") {
      res.setHeader(
        "Content-disposition",
        `attachment; filename=certified-list-csv-${req.params.__feathersId}.csv`
      );
      res.setHeader("Content-type", "text/plain");

      res.send(res.data, options, function(err) {
        if (err) {
          next(err);
        } else {
        }
      });
    } else {
      next();
    }
  });

  // Get our initialize service to that we can bind hooks
  const certifiedListService = app.service(
    app.get("apiPath") + "/certified-list"
  );

  //certifiedListService.setup(app);

  // Set up our before hooks
  certifiedListService.before(hooks.before);

  // Set up our after hooks
  certifiedListService.after(hooks.after);
};

module.exports.Service = Service;
