"use strict";

const assert = require("assert");
const rp = require("request-promise");

const parse = require("node-html-parser");
const HtmlTableToJson = require("html-table-to-json");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");

const TABLE_HEADER_SELECTOR =
  "body > table > tbody > tr > td > table > tbody > tr > td > table  > tbody > tr > th";

const DATA_TABLE_SELECTOR =
  "body > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table";

const VALID_ELECTION_RESULT_HEADERS = ["Name", "Party", "Votes", "Percentage"];

describe("boe election results service", function() {
  it("registered the addresses service", done => {
    const url = "https://web.enrboenyc.us/OFA77CY0PY1.html";

    rp(url)
      .then(function(html) {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const resultTableHeaders = [];

        const tableHeaderElements = document.querySelectorAll(
          TABLE_HEADER_SELECTOR
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

        const dataTableElements = document.querySelectorAll(
          DATA_TABLE_SELECTOR
        );

        const resultTables = [];

        dataTableElements.forEach(function(tableElement, index) {
          const $ = cheerio.load(tableElement.outerHTML);
          cheerioTableparser($);
          var columns = $("table").parsetable(false, true, true);

          // Remove invalid columns
          const electionResultColumns = columns.filter(function(column) {
            if (VALID_ELECTION_RESULT_HEADERS.indexOf(column[0]) >= 0) {
              return true;
            }
          });

          // Remove invalid rows from columns
          electionResultColumns.forEach(function(column, index) {
            electionResultColumns[index] = column.filter(function(row, index) {
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

          // Sorts by most votes
          contestResults.sort(function(a, b) {
            return parseInt(b.Votes) - parseInt(a.Votes);
          });

          // Removes all but contest winners
          const slicedArray = contestResults.slice(
            0,
            resultTableHeaders[tableIndex].voteFor
          );

          allContestResults.push(...slicedArray);
        });

        assert(allContestResults.length);

        done();
      })
      .catch(function(err) {
        //handle error
      });
  });
});
