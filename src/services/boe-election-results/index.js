"use strict";

const boeElectionResults = require("./boe-election-results-model");
const hooks = require("./hooks");
const FeathersMongoose = require("feathers-mongoose");
const rp = require("request-promise");

const parse = require("node-html-parser");
const HtmlTableToJson = require("html-table-to-json");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");

const DEFAULT_VALID_FIELDS = ["Name", "Party", "Votes", "Percentage"];

class Service extends FeathersMongoose.Service {
  boeHtmlToJson(options) {
    return new Promise((resolve, reject) => {
      const { url, tableHeaderSelector, tableSelector } = options;
      const validFields = [...DEFAULT_VALID_FIELDS];
      if (options.validFields) {
        validFields.push(...options.validFields);
      }

      rp(url)
        .then(function(html) {
          const dom = new JSDOM(html);
          const document = dom.window.document;
          const resultTableHeaders = [];

          const tableHeaderElements = document.querySelectorAll(
            tableHeaderSelector
          );

          tableHeaderElements.forEach(tableHeaderElement => {
            const voteInstructions = tableHeaderElement.querySelector("div");

            var re = /(\D+)(\d+)\/(\d+).+-(.+)\(Vote.+(\d+)\)/gi;
            const tableHeaderRegexResults = re.exec(
              tableHeaderElement.textContent
            );

            const tableHeaderInfo = {};
            tableHeaderInfo.office = tableHeaderRegexResults[1].trim();
            tableHeaderInfo.electoral_district = parseInt(
              tableHeaderRegexResults[2]
            );
            tableHeaderInfo.assembly_district = parseInt(
              tableHeaderRegexResults[3]
            );
            tableHeaderInfo.party = tableHeaderRegexResults[4].trim();
            tableHeaderInfo.voteFor = parseInt(tableHeaderRegexResults[5]);

            resultTableHeaders.push(tableHeaderInfo);
          });

          const dataTableElements = document.querySelectorAll(tableSelector);

          const resultTables = [];

          dataTableElements.forEach(function(tableElement, index) {
            const $ = cheerio.load(tableElement.outerHTML);
            cheerioTableparser($);
            var columns = $("table").parsetable(false, true, true);

            // Remove invalid columns
            const electionResultColumns = columns.filter(function(column) {
              if (DEFAULT_VALID_FIELDS.indexOf(column[0]) >= 0) {
                return true;
              }
            });

            // Remove invalid rows from columns
            electionResultColumns.forEach(function(column, index) {
              electionResultColumns[index] = column.filter(function(
                row,
                index
              ) {
                return row;
              });
            });
            resultTables.push(electionResultColumns);
          });

          // Check to see if the headers and the results line up
          if (!(resultTables.length === resultTableHeaders.length)) {
            throw Error(
              "Something went wrong parsing the table. Rows and headers don't match up!"
            );
          }

          const allContestResults = [];

          // Iterates through each result table
          // Each result table has multiple candidates
          // This normalizes the data. First normal form.
          resultTables.forEach(function(tableColumns, tableIndex) {
            // Go through all the columns of each table
            const contestResults = [];
            tableColumns.forEach(function(columnRows, colIndex) {
              columnRows.forEach(function(row, columnRowIndex) {
                // Not the first row
                if (columnRowIndex > 0) {
                  if (columnRowIndex >= contestResults.length) {
                    contestResults.push({ ...resultTableHeaders[tableIndex] });
                  }
                  contestResults[columnRowIndex - 1][columnRows[0]] = isNaN(row)
                    ? row
                    : parseInt(row);
                }
              });
            });

            const filtedContestResults = contestResults.filter(
              (result, index) => {
                let objectValid = true;
                DEFAULT_VALID_FIELDS.forEach(function(field) {
                  objectValid = result.hasOwnProperty(field);
                });
                return objectValid;
              }
            );

            // Sorts by most votes
            filtedContestResults.sort(function(a, b) {
              return parseInt(b.Votes) - parseInt(a.Votes);
            });

            // Removes all but contest winners
            const slicedArray = filtedContestResults.slice(
              0,
              resultTableHeaders[tableIndex].voteFor
            );

            allContestResults.push(...slicedArray);
          });

          resolve(allContestResults);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }
}

module.exports = function() {
  const app = this;

  const options = {
    Model: boeElectionResults,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  const service = new Service(options);
  // Initialize our service with any options it requires
  app.use(
    app.get("apiPath") + "/boe-election-results",
    service,
    function updateData(req, res, next) {
      // If it's request in a csv format send a download attachment response
      // of the CSV text
      // @todo find a better way to handle this
      if (req.query.format === "csv") {
        res.setHeader(
          "Content-disposition",
          `attachment; filename=certified-list-csv-${
            req.params.__feathersId
          }.csv`
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
    }
  );

  // Get our initialize service to that we can bind hooks
  const newsLinkService = app.service(
    app.get("apiPath") + "/boe-election-results"
  );

  // Set up our before hooks
  newsLinkService.before(hooks.before);

  // Set up our after hooks
  newsLinkService.after(hooks.after);
};
