"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const certified_list_path = "/usr/src/app/test/mocks/CertifiedList.mock.pdf";
const kings_certified_list_path =
  "/usr/src/app/test/mocks/KG_CCDEMLIST_100918.pdf";

const base64 = require("base64topdf");
const TermModel = require("../../../src/services/term/term-model");
const moment = require("moment");

const FileAPI = require("file-api"),
  File = FileAPI.File,
  FileList = FileAPI.FileList,
  FileReader = FileAPI.FileReader;

describe("Certified List service", function() {
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

  it("registered the certified-list service", () => {
    assert.ok(app.service(app.get("apiPath") + "/certified-list"));
  });

  it("can extract the Party from a page", () => {
    const extract = require("pdf-text-extract");
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    let filepath = certified_list_path;
    extract(filepath, (err, pages) => {
      let party = CertifiedListService.extractPartyFromPage(pages[0]);
      assert.equal(party, "Democratic");
    });
  });

  it("can import a certified list PDF from Kings County", done => {
    let filepath = kings_certified_list_path;
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    CertifiedListService.create({ filepath: filepath, term_id: mock_term._id })
      .then(certifiedList => {
        assert.ok(certifiedList);
        assert.equal(certifiedList.term_id, mock_term._id);
        assert.equal(certifiedList.source, "KG_CCDEMLIST_100918.pdf");
        assert(Array.isArray(certifiedList.positions));
        assert.equal(certifiedList.positions.pop().party, "Democratic");
        assert.equal(certifiedList.positions.pop().county, "Kings");
        certifiedList.remove();
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);
        done();
      });
  });

  it("can import a certified list PDF", done => {
    let filepath = certified_list_path;
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    CertifiedListService.create({ filepath: filepath, term_id: mock_term._id })
      .then(certifiedList => {
        assert.ok(certifiedList);
        assert.equal(certifiedList.source, "CertifiedList.mock.pdf");
        assert.equal(certifiedList.term_id, mock_term._id);
        assert(Array.isArray(certifiedList.positions));
        assert.equal(certifiedList.positions.pop().party, "Democratic");
        assert.equal(certifiedList.positions.pop().county, "Bronx");
        certifiedList.remove();
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

  it("can handle a certified pdf in JSON format", done => {
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    let encodedPdf = base64.base64Encode(certified_list_path);

    let file_upload_base64 = [
      { title: "CertifiedList.mock.pdf", src: encodedPdf }
    ];

    CertifiedListService.create({
      file_data: file_upload_base64,
      term_id: mock_term._id
    }).then(certified_list => {
      assert.ok(certified_list);
      assert.equal(certified_list.source, "CertifiedList.mock.pdf");
      certified_list.remove();
      done();
    });
  });
});
