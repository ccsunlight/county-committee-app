"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const mongoose = require("mongoose");
const CountyCommitteeModel = require("../../../src/services/county-committee/county-committee-model");
const TermModel = require("../../../src/services/term/term-model");
const moment = require("moment");

// COUNTY,ELECTION DIST,STATUS,DEM,REP,CON,WOR,GRE,LBT,IND,SAM,OTH,BLANK,TOTAL
// ,,,,,,,,,,,,,
// New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"

describe("Enrollment Service", () => {
  it("can extract County from CSV row", () => {
    const mockRow = `New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"`;
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const county = enrollmentService.extractCountyFromRow(mockRow);
    assert.equal(county, "New York");
  });

  it("can extract ED and AD from CSV row", () => {
    const mockRow = `New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"`;
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const district = enrollmentService.extractEDADFromRow(mockRow);
    assert.equal(district.ed, 1);
    assert.equal(district.ad, 65);
  });

  it("can convert row to object", () => {
    const mockRow = `New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"`;
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const obj = enrollmentService.extractDataFromRow(mockRow);
    assert.equal(obj.county, "New York");
    assert.equal(obj.assembly_district, 65);
    assert.equal(obj.electoral_district, 1);
    assert.equal(obj.status, "Active");
    assert.equal(obj.dem, 526);
    assert.equal(obj.rep, 160);
  });
});
