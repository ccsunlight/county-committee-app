"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const moment = require("moment");
//const TermService = require("../../../src/services/term");
//const CertifiedListService = require("../../../src/services/certified-list");
const TermModel = require("../../../src/services/term/term-model");
const MemberModel = require("../../../src/services/county-committee-member/county-committee-member-model");
const CertifiedListModel = require("../../../src/services/certified-list/certified-list-model");

const cerfied_list_path = "/usr/src/app/test/mocks/CertifiedList.mock.pdf";
const termMock = require("../../mocks/term.mock.json");
const ccMock = require("../../mocks/county-committee.mock.json");
const mongoose = require("mongoose");

describe("Term Service", function() {
  let TermService, CertifiedListService;
  let county_committee;

  const cleanupDBDocs = [];
  let ccService, ccMemberService;
  let mock_term, mock_county_committee, mock_county_committee_member;

  /**
   * Sets up the database
   */
  beforeEach(function(done) {
    TermService = app.service(app.get("apiPath") + "/term");
    CertifiedListService = app.service(app.get("apiPath") + "/certified-list");
    ccService = app.service(app.get("apiPath") + "/county-committee");
    ccMemberService = app.service(
      app.get("apiPath") + "/county-committee-member"
    );
    ccService
      .create({
        chairman: "George Washington",
        county: "Test",
        state: "NY",
        address: "1 Test Street",
        phone: "212-123-4567",
        party: "Democratic"
      })
      .then(county_committee => {
        let term = new TermModel({
          start_date: moment(),
          end_date: moment().add(2, "Years"),
          committee_id: county_committee._id
        });
        mock_county_committee = county_committee;
        cleanupDBDocs.push(mock_county_committee);

        term.save(function(err) {
          mock_term = term;
          cleanupDBDocs.push(mock_term);

          ccMemberService
            .create({
              committee: mock_county_committee._id,
              party: "Democratic",
              petition_number: 1,
              office: "County Committee",
              office_holder: "Paul Revere",
              address: "1 Colonial Way",
              tally: 0,
              ed_ad: "002/77",
              entry_type: "Uncontested",
              electoral_district: 1,
              assembly_district: 1,
              data_source: "Test.pdf",
              county: "Test",
              state: "NY"
            })
            .then(function(member) {
              mock_county_committee_member = member;
              cleanupDBDocs.push(mock_county_committee_member);
              done();
            });
        });
      });
  });
  afterEach(function(done) {
    for (let x = 0; x < cleanupDBDocs.length; x++) {
      cleanupDBDocs[x].remove();
    }
    done();
  });

  it("registered the terms service", done => {
    assert.ok(app.service(app.get("apiPath") + "/term"));
    done();
  });

  it("can create a term", done => {
    TermService.create({
      committee_id: mock_county_committee._id,
      ...termMock
    }).then(term => {
      cleanupDBDocs.push(term);
      assert(term._id);
      assert(term.start_date);
      assert(term.end_date);
      assert(term.committee_id);
      assert(term.committee, "It has an aliased county committee");
      done();
    });
  });
});
