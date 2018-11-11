"use strict";

const assert = require("assert");
const app = require("../../../src/app");

describe("Certified List service", function() {
  this.timeout(10000);
  it("registered the certified-list service", () => {
    assert.ok(app.service(app.get("apiPath") + "/certified-list"));
  });

  it("can extract the Party from a page", () => {
    const extract = require("pdf-text-extract");
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    let filepath = "/usr/src/app/import/NYCCDemCertifiedListPreview2017.pdf";
    extract(filepath, (err, pages) => {
      let party = CertifiedListService.extractPartyFromPage(pages[0]);
      assert.equal(party, "Democratic");
    });
  });

  it("can import a certified list PDF", done => {
    let filepath = "/usr/src/app/import/NYCCDemCertifiedListPreview2017.pdf";
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    CertifiedListService.create({ filepath: filepath })
      .then(certifiedList => {
        assert.ok(certifiedList);
        assert.equal(certifiedList.county, "New York");
        assert.equal(certifiedList.party, "Democratic");
        assert.equal(
          certifiedList.source,
          "NYCCDemCertifiedListPreview2017.pdf"
        );
        assert(Array.isArray(certifiedList.members));
        assert.equal(certifiedList.members.pop().party, "Democratic");
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);
        done();
      });
  });

  it("can extract a cc member from a row", () => {
    const mockDataRow = `633    County Committee   103/76   Mickey Mouse                    1 Epcot Street 21B New York, NY 10000           0              Uncontested`;
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    let member = CertifiedListService.extractCCMemberDataFromRow(
      mockDataRow,
      "Disney County"
    );
    assert.equal(member.petition_number, "633");
    assert.equal(member.assembly_district, "76");
    assert.equal(member.electoral_district, "103");
    assert.equal(member.address, "1 Epcot Street 21B New York, NY 10000");
    assert.equal(member.tally, "0");
    assert.equal(member.entry_type, "Uncontested");
    assert.equal(member.ed_ad, "103/76");
    assert.equal(member.county, "Disney County");
    assert.equal(member.state, "NY");
    assert.equal(member.entry_type, "Uncontested");
  });
});
