"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const mongoose = require("mongoose");
const CountyCommitteeModel = require("../../../src/services/county-committee/county-committee-model");
const TermModel = require("../../../src/services/term/term-model");
const EntrollmentModel = require("../../../src/services/enrollment/enrollment-model");
const moment = require("moment");

// COUNTY,ELECTION DIST,STATUS,DEM,REP,CON,WOR,GRE,LBT,IND,SAM,OTH,BLANK,TOTAL
// ,,,,,,,,,,,,,
// New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"

describe("Enrollment Service", () => {
  let ccService, ccMemberService;
  let mock_term, mock_county_committee, mock_county_committee_member;
  let cleanupDBDocs = [];
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
        cleanupDBDocs.push(county_committee);

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
              cleanupDBDocs.push(member);
              done();
            });
        });
      });
  });

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    for (let x = 0; x < cleanupDBDocs.length; x++) {
      cleanupDBDocs[x].remove();
    }
    done();
  });

  it("can extract County from CSV row", () => {
    const mockRow = `New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"`;
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const county = enrollmentService.extractCountyFromRow(mockRow.split(","));
    assert.equal(county, "New York");
  });

  it("can extract ED and AD from CSV row", () => {
    const mockRow = `New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"`;
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const district = enrollmentService.extractEDADFromRow(mockRow.split(","));
    assert.equal(district.ed, 1);
    assert.equal(district.ad, 65);
  });

  it("can extract date from CSV", () => {
    const mockRow = [
      "Voters Registered as of November 1, 2019",
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
    ];
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const date = enrollmentService.extractDateFromRow(mockRow);

    const enrollmentPublishDate = moment(date);
    assert.equal(enrollmentPublishDate.month(), 10);
    assert.equal(enrollmentPublishDate.date(), 1);
    assert.equal(enrollmentPublishDate.year(), 2019);
  });

  it("can convert row to object", () => {
    const mockRow = `New York ,New York 65001,Active,526,160,3,1,2,3,22,0,1,285,"1,003"`;
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const obj = enrollmentService.extractDataFromRow(mockRow.split(","));
    assert.equal(obj.county, "New York");
    assert.equal(obj.assembly_district, 65);
    assert.equal(obj.electoral_district, 1);
    assert.equal(obj.status, "Active");
    assert.equal(obj.dem, 526);
    assert.equal(obj.rep, 160);
  });

  it("can extract rows from a CSV", async () => {
    const filepath =
      "/usr/src/app/test/services/enrollment/NewYorkED_nov19 - NewED_nov19.csv";
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const enrollmentRecords = await enrollmentService.extractEnrollmentFromCSV({
      filepath: filepath
    });

    enrollmentRecords.forEach(record => {
      assert(!isNaN(record.electoral_district));
      assert(!isNaN(record.assembly_district));
      assert(record.county === "New York");
      assert.equal(record.date, 1572566400000);
    });
  });

  it("can import enrollment numbers from a CSV", async () => {
    const filepath =
      "/usr/src/app/test/services/enrollment/NewYorkED_nov19 - NewED_nov19.csv";
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const enrollmentRecords = await enrollmentService.create({
      filepath: filepath,
      term_id: mock_term.id
    });

    enrollmentRecords.forEach(record => {
      cleanupDBDocs.push(record);
      assert(!isNaN(record.electoral_district));
      assert(!isNaN(record.assembly_district));
      assert(record.county === "New York");
      assert.equal(Date.parse(record.date), "1572566400000");
    });
  });

  it("can upsert enrollment numbers to a term", async () => {
    const filepath =
      "/usr/src/app/test/services/enrollment/NewYorkED_nov19 - NewED_nov19.csv";
    const enrollmentService = app.service(app.get("apiPath") + "/enrollment");
    const enrollmentRecords = await enrollmentService.create({
      filepath: filepath,
      term_id: mock_term.id
    });

    enrollmentRecords.forEach(record => {
      cleanupDBDocs.push(record);
      assert(!isNaN(record.electoral_district));
      assert(!isNaN(record.assembly_district));
      assert(record.county === "New York");
      assert.equal(Date.parse(record.date), "1572566400000");
    });

    const enrollmentRecordsTwo = await enrollmentService.create({
      filepath: filepath,
      term_id: mock_term.id
    });

    enrollmentRecordsTwo.forEach(record => {
      cleanupDBDocs.push(record);
      assert(!isNaN(record.electoral_district));
      assert(!isNaN(record.assembly_district));
      assert(record.county === "New York");
      assert.equal(Date.parse(record.date), "1572566400000");
    });

    const enrollmentsForTerm = await EntrollmentModel.find({
      term_id: mock_term.id
    });
    assert.equal(enrollmentsForTerm.length, enrollmentRecords.length);
  });
});
