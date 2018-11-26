"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const moment = require("moment");
const MainTermService = require("../../../src/services/term");
const termMock = require("../../mocks/term.mock.json");
const ccMock = require("../../mocks/county-committee.mock.json");

describe("term service", function() {
  let TermService, CountyCommiteeService;
  let county_committee;
  let terms = [];

  beforeEach(function(done) {
    CountyCommiteeService = app.service(
      app.get("apiPath") + "/county-committee"
    );
    TermService = app.service(app.get("apiPath") + "/term");

    CountyCommiteeService.create(ccMock).then(cc => {
      county_committee = cc;
      done();
    });
  });

  afterEach(function(done) {
    county_committee.remove();
    terms.forEach(term => {
      term.remove();
    });
    done();
  });

  it("registered the terms service", () => {
    assert.ok(app.service(app.get("apiPath") + "/term"));
  });

  it("can create a term", done => {
    TermService.create({
      committee_id: county_committee._id,
      ...termMock
    }).then(term => {
      assert(term._id);
      assert(term.start_date);
      assert(term.end_date);
      assert(term.committee_id);
      assert(term.committee, "It has an aliased county committee");
      terms.push(term);
      done();
    });
  });
});
