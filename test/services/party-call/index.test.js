"use strict";

const assert = require("assert");
const app = require("../../../src/app");

describe("Party Call Service", function() {
  this.timeout(10000);
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
      county: "Bronx",
      party: "Democratic",
      electionDate: "September 13, 2018",
      state: "NY"
    })
      .then(partyCall => {
        assert.ok(partyCall);
        assert.equal(partyCall.county, "Bronx");
        assert.equal(partyCall.party, "Democratic");
        assert.equal(partyCall.source, "Bronx Party Call 2018 - Sheet1.csv");
        assert(Array.isArray(partyCall.positions));
        assert.equal(partyCall.positions.length, 2663);
        assert.equal(partyCall.positions[0].party, "Democratic");
        assert.equal(partyCall.positions[0].office, "County Committee");
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
      county: "Kings",
      party: "Democratic",
      electionDate: "September 13, 2018",
      state: "NY"
    })
      .then(partyCall => {
        assert.ok(partyCall);
        assert.equal(partyCall.county, "Kings");
        assert.equal(partyCall.party, "Democratic");
        assert.equal(partyCall.source, "Kings County Party Call - Sheet1.csv");
        assert(Array.isArray(partyCall.positions));
        assert.equal(partyCall.positions.length, 5346);
        assert.equal(partyCall.positions[0].party, "Democratic");
        assert.equal(partyCall.positions[0].office, "Male County Committee");
        assert.equal(partyCall.positions[1].office, "Female County Committee");
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);
        done();
      });
  });
});
