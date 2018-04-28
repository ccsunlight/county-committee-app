"use strict";

const assert = require("assert");
const app = require("../../../src/app");

describe("Certified List service", function() {
  it("registered the certified-list service", () => {
    assert.ok(app.service("certified-list"));
  });

  it("can read a certified list PDF", done => {
    const CertifiedList = app.service("certified-list");
    let filepath = "/usr/src/app/import/NYCCDemCertifiedListPreview2017.pdf";

    CertifiedList.create({ filepath: filepath })
      .then(certifiedList => {
        assert.ok(certifiedList);
        assert.equal(certifiedList.county, "New York County");
        assert(Array.isArray(certifiedList.members));
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);
        done();
      });
  });
});
