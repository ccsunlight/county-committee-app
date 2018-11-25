"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const mongoose = require("mongoose");
const CountyCommitteeModel = require("../../../src/services/county-committee/county-committee-model");
const TermModel = require("../../../src/services/term/term-model");
const moment = require("moment");

describe("Party Call Service", function() {
  this.timeout(10000);

  let ccService, ccMemberService;
  let mock_term, mock_county_committee, mock_county_committee_member;

  /**
   * Sets up the database
   */
  beforeEach(function(done) {
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

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    mock_county_committee.remove();
    mock_county_committee_member.remove();
    mock_term.remove();

    done();
  });

  // beforeEach(function(done) {
  //   CountyCommitteeModel.findOne({ county: "Test", party: "Democratic" }).then(
  //     county_committee => {
  //       mock_county_committee._id = county_committee.id;
  //       let term = new TermModel({
  //         start_date: moment(),
  //         end_date: moment().add(2, "Years"),
  //         committee_id: county_committee.id
  //       });
  //       term.save(err => {
  //         mock_term = term.id;
  //         done();
  //       });
  //     }
  //   );
  // });

  it("registered the party-call service", () => {
    assert.ok(app.service(app.get("apiPath") + "/party-call"));
  });

  it("can extract ED/AD", () => {
    const PartyCallService = app.service(app.get("apiPath") + "/party-call");
    let ed_ad = PartyCallService.districtKeyToADED("82067");
    assert.deepStrictEqual(ed_ad, { ed: 67, ad: 82 });
  });

  it("can extract CSV Config", () => {
    const headerRowMock = ["district_key", "County Committee"];
    const PartyCallService = app.service(app.get("apiPath") + "/party-call");
    let csvConfig = PartyCallService.getCSVColumnFormat(headerRowMock);
    assert.deepStrictEqual(csvConfig, {
      district_columns: "district_key",
      offices: ["County Committee"]
    });
  });

  it("can extract alternate CSV Config", () => {
    const headerRowMock = [
      "AD",
      "ED",
      "Male County Committee",
      "Female County Committee"
    ];
    const PartyCallService = app.service(app.get("apiPath") + "/party-call");
    let csvConfig = PartyCallService.getCSVColumnFormat(headerRowMock);
    assert.deepStrictEqual(csvConfig, {
      district_columns: "split",
      offices: ["Male County Committee", "Female County Committee"]
    });
  });

  it("can read a party call formatted csv", done => {
    let filepath = "/usr/src/app/import/Bronx Party Call 2018 - Sheet1.csv";
    const PartyCallService = app.service(app.get("apiPath") + "/party-call");

    PartyCallService.create({
      filepath: filepath,
      committee_id: mock_county_committee._id,
      term_id: mock_term._id
    })
      .then(partyCall => {
        assert.ok(partyCall);
        assert(mongoose.Types.ObjectId.isValid(partyCall.committee_id));
        assert.equal(partyCall.source, "Bronx Party Call 2018 - Sheet1.csv");
        assert(Array.isArray(partyCall.positions));
        assert.deepEqual(partyCall.committee_id, mock_county_committee._id);
        assert.deepEqual(partyCall.term_id, mock_term._id);
        assert.equal(partyCall.positions.length, 2663);
        assert.equal(partyCall.positions[0].party, "Democratic");
        assert.equal(partyCall.positions[0].office, "County Committee");
        partyCall.remove();
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);
        done();
      });
  });

  it("can read different field configurations for formatted csv", done => {
    let filepath = "/usr/src/app/import/Kings County Party Call - Sheet1.csv";
    const PartyCallService = app.service(app.get("apiPath") + "/party-call");

    PartyCallService.create({
      filepath: filepath,
      committee_id: mock_county_committee._id,
      term_id: mock_term._id
    })
      .then(partyCall => {
        assert.ok(partyCall);
        assert.equal(partyCall.source, "Kings County Party Call - Sheet1.csv");
        assert(Array.isArray(partyCall.positions));
        assert(partyCall.committee_id, mock_county_committee._id);
        assert.equal(partyCall.positions.length, 5346);
        assert.equal(partyCall.positions[0].party, "Democratic");
        assert.equal(partyCall.positions[0].office, "Male County Committee");
        assert.equal(partyCall.positions[1].office, "Female County Committee");

        partyCall.remove();
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);
        done();
      });
  });
});
