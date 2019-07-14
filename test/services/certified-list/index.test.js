"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const MOCK_CERTIFIED_LIST_FILEPATH =
  "/usr/src/app/test/mocks/MockCandidacyListCitywidePartyPositions.pdf";
const kings_certified_list_path =
  "/usr/src/app/test/mocks/KG_CCDEMLIST_100918.pdf";

const base64 = require("base64topdf");
const moment = require("moment");

// const FileAPI = require("file-api"),
//   File = FileAPI.File,
//   FileList = FileAPI.FileList,
//   FileReader = FileAPI.FileReader;

describe("Certified List Service", function() {
  this.timeout(10000);

  let ccService, ccMemberService;
  let mock_term, mock_county_committee, mock_county_committee_member;

  /**
   * Sets up the database
   */
  beforeEach(function(done) {
    done();
  });

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    done();
  });

  it("registered the certified-list service", () => {
    assert.ok(app.service(app.get("apiPath") + "/certified-list"));
  });

  it("can extract tables from pdf", done => {
    const CertifiedList = app.service(app.get("apiPath") + "/certified-list");

    const certifiedListService = CertifiedList.create({
      filepath: MOCK_CERTIFIED_LIST_FILEPATH
    })
      .then(dataTables => {
        done();
      })
      .catch(error => {
        console.log(error);
      });
  });

  it("can export a csv", done => {
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    CertifiedListService.create({
      filepath: MOCK_CERTIFIED_LIST_FILEPATH
    })
      .then(certifiedList => {
        CertifiedListService.generateCSV(certifiedList._id).then(
          csvResultObject => {
            assert(csvResultObject);
            done();
          }
        );
      })
      .catch(error => {
        console.log(error);
      });
  });

  // it("can extract the Party from a page", () => {
  //   const extract = require("pdf-text-extract");
  //   const CertifiedListService = app.service(
  //     app.get("apiPath") + "/certified-list"
  //   );
  //   let filepath = certified_list_path;
  //   extract(filepath, (err, pages) => {
  //     let party = CertifiedListService.extractPartyFromPage(pages[0]);
  //     assert.equal(party, "Democratic");
  //   });
  // });

  // it("can import a certified list PDF from Kings County", done => {
  //   let filepath = kings_certified_list_path;
  //   const CertifiedListService = app.service(
  //     app.get("apiPath") + "/certified-list"
  //   );
  //   CertifiedListService.create({ filepath: filepath, term_id: mock_term._id })
  //     .then(certifiedList => {
  //       assert.ok(certifiedList);
  //       assert.equal(certifiedList.term_id, mock_term._id);
  //       assert.equal(certifiedList.source, "KG_CCDEMLIST_100918.pdf");
  //       assert(Array.isArray(certifiedList.positions));
  //       assert.equal(certifiedList.positions.pop().party, "Democratic");
  //       assert.equal(certifiedList.positions.pop().county, "Kings");
  //       certifiedList.remove();
  //       done();
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       assert(!err);
  //       done();
  //     });
  // });

  // it("can import a certified list PDF", done => {
  //   let filepath = certified_list_path;
  //   const CertifiedListService = app.service(
  //     app.get("apiPath") + "/certified-list"
  //   );
  //   CertifiedListService.create({ filepath: filepath, term_id: mock_term._id })
  //     .then(certifiedList => {
  //       assert.ok(certifiedList);
  //       assert.equal(certifiedList.source, "CertifiedList.mock.pdf");
  //       assert.equal(certifiedList.term_id, mock_term._id);
  //       assert(Array.isArray(certifiedList.positions));
  //       assert.equal(certifiedList.positions.pop().party, "Democratic");
  //       assert.equal(certifiedList.positions.pop().county, "Bronx");
  //       certifiedList.remove();
  //       done();
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       assert(!err);

  //       done();
  //     });
  // });

  // it("can extract a cc member from a row", () => {
  //   const mockDataRow = `633    County Committee   103/76   Mickey Mouse                    1 Epcot Street 21B New York, NY 10000           0              Uncontested`;
  //   const CertifiedListService = app.service(
  //     app.get("apiPath") + "/certified-list"
  //   );
  //   let member = CertifiedListService.extractCCMemberDataFromRow(
  //     mockDataRow,
  //     "Disney County"
  //   );
  //   assert.equal(member.petition_number, "633");
  //   assert.equal(member.assembly_district, "76");
  //   assert.equal(member.electoral_district, "103");
  //   assert.equal(member.address, "1 Epcot Street 21B New York, NY 10000");
  //   assert.equal(member.tally, "0");
  //   assert.equal(member.entry_type, "Uncontested");
  //   assert.equal(member.ed_ad, "103/76");
  //   assert.equal(member.county, "Disney County");
  //   assert.equal(member.state, "NY");
  //   assert.equal(member.entry_type, "Uncontested");
  // });

  // it("can handle a certified pdf in JSON format", done => {
  //   const CertifiedListService = app.service(
  //     app.get("apiPath") + "/certified-list"
  //   );
  //   let encodedPdf = base64.base64Encode(certified_list_path);

  //   let file_upload_base64 = [
  //     { title: "CertifiedList.mock.pdf", src: encodedPdf }
  //   ];

  //   CertifiedListService.create({
  //     file_data: file_upload_base64,
  //     term_id: mock_term._id
  //   }).then(certified_list => {
  //     assert.ok(certified_list);
  //     assert.equal(certified_list.source, "CertifiedList.mock.pdf");
  //     certified_list.remove();
  //     done();
  //   });
  // });
});
