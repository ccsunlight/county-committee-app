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

  it("can read a party call formatted csv", done => {
    let filepath = "/usr/src/app/import/Bronx Party Call 2018 - Sheet1.csv";
    const PartyCallService = app.service(app.get("apiPath") + "/party-call");

    PartyCallService.create({
      filepath: filepath,
      county: "Bronx County",
      party: "Democratic",
      electionDate: "September 13, 2018",
      state: "NY"
    })
      .then(partyCall => {
        assert.ok(partyCall);
        assert.equal(partyCall.county, "Bronx County");
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
});
