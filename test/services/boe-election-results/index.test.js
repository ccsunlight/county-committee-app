"use strict";

const assert = require("assert");

const app = require("../../../src/app");

const TABLE_SELECTOR =
  "body > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table";

const TABLE_HEADER_SELECTOR =
  "body > table > tbody > tr > td > table > tbody > tr > td > table  > tbody > tr > th";
const url = "https://web.enrboenyc.us/OFA77CY0PY1.html";
describe("BOE Election Results Service", function() {
  const cleanupDBDocs = [];
  beforeEach(done => {
    done();
  });

  afterEach(done => {
    for (let x = 0; x < cleanupDBDocs.length; x++) {
      cleanupDBDocs[x].remove();
    }
    done();
  });

  it("can extract election results from an html page", done => {
    const BoeElectionResultsService = app.service(
      app.get("apiPath") + "/boe-election-results"
    );

    BoeElectionResultsService.boeHtmlToJson({
      url: url,
      tableSelector: TABLE_SELECTOR,
      tableHeaderSelector: TABLE_HEADER_SELECTOR
    }).then(results => {
      assert.equal(results.length, 317);
      done();
    });
  });

  it("can create a new document with election results", done => {
    const BoeElectionResultsService = app.service(
      app.get("apiPath") + "/boe-election-results"
    );

    BoeElectionResultsService.create({
      url: url,
      tableSelector: TABLE_SELECTOR,
      tableHeaderSelector: TABLE_HEADER_SELECTOR
    }).then(electionResultsDocument => {
      cleanupDBDocs.push(electionResultsDocument);
      electionResultsDocument.results.forEach(result => {
        assert(result.Name);
      });
      assert.equal(electionResultsDocument.results.length, 317);
      done();
    });
  });

  it("can create a new document with election results", done => {
    const BoeElectionResultsService = app.service(
      app.get("apiPath") + "/boe-election-results"
    );

    BoeElectionResultsService.create({
      url: url,
      tableSelector: TABLE_SELECTOR,
      tableHeaderSelector: TABLE_HEADER_SELECTOR
    }).then(electionResultsDocument => {
      cleanupDBDocs.push(electionResultsDocument);
      BoeElectionResultsService.get(electionResultsDocument._id, {
        query: { format: "csv" }
      }).then(csv => {
        assert(csv);
        done();
      });
    });
  });
});
