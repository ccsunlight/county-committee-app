"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const MOCK_CANDIDACY_LIST_FILEPATH =
  "/usr/src/app/test/mocks/MockCandidacyListCitywidePartyPositions.pdf";

const base64 = require("base64topdf");
const moment = require("moment");

describe("Candidacy List Service", function() {
  this.timeout(10000);

  let ccService, ccMemberService;
  /**
   * Sets up the database
   */
  beforeEach(function(done) {
    done();
  });

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    done();
  });

  it("can extract candidacy tables from BOE pdf", done => {
    const CandidacyListService = app.service(
      app.get("apiPath") + "/candidacy-list"
    );

    const certifiedListService = CandidacyListService.create({
      filepath: MOCK_CANDIDACY_LIST_FILEPATH
    })
      .then(dataTables => {
        done();
      })
      .catch(error => {
        console.log(error);
      });
  });

  it("can export a csv", done => {
    const CandidacyListService = app.service(
      app.get("apiPath") + "/candidacy-list"
    );
    CandidacyListService.create({
      filepath: MOCK_CANDIDACY_LIST_FILEPATH
    })
      .then(candidacyList => {
        CandidacyListService.generateCSV(candidacyList._id).then(
          csvResultObject => {
            assert(csvResultObject);
            done();
          }
        );
      })
      .catch(error => {
        console.log(error);
      });
  });
});
