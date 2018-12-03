"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const moment = require("moment");
//const TermService = require("../../../src/services/term");
//const CertifiedListService = require("../../../src/services/certified-list");
const TermModel = require("../../../src/services/term/term-model");
const MemberModel = require("../../../src/services/county-committee-member/county-committee-member-model");

const cerfied_list_path = "/usr/src/app/test/mocks/CertifiedList.mock.pdf";
const termMock = require("../../mocks/term.mock.json");
const ccMock = require("../../mocks/county-committee.mock.json");

describe("term service", function() {
  let TermService, CertifiedListService;
  let county_committee;
  let terms = [];

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

        term.save(function(err) {
          mock_term = term;

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
              done();
            });
        });
      });
  });

  it("registered the terms service", () => {
    assert.ok(app.service(app.get("apiPath") + "/term"));
  });

  it("can create a term", done => {
    TermService.create({
      committee_id: mock_county_committee._id,
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

  it("can create county committee members from certified list", done => {
    CertifiedListService.create({
      filepath: cerfied_list_path,
      term_id: mock_term._id
    }).then(certified_list => {
      assert(certified_list);
      assert(certified_list.positions);
      TermService.createMembersFromCertifiedList({
        term_id: mock_term._id
      }).then(members => {
        assert(members.length, 2500);
        MemberModel.deleteMany({ term_id: mock_term._id }, function(err) {
          done();
        });
      });
    });
  });
});
