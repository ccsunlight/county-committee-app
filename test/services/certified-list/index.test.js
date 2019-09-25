"use strict";

const assert = require("assert");
const app = require("../../../src/app");

const MOCK_CERTIFIED_LIST_FILEPATH =
  "/usr/src/app/test/mocks/KG_CCDEMLIST_100918.pdf";
const MOCK_CERTIFIED_LIST_FILEPATH_TWO =
  "/usr/src/app/test/mocks/CertifiedList.mock.pdf";

const base64 = require("base64topdf");
const moment = require("moment");

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

  it("can import a certified list PDF from Kings County", done => {
    let filepath = MOCK_CERTIFIED_LIST_FILEPATH;
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    CertifiedListService.create({ filepath: filepath })
      .then(certifiedList => {
        assert.ok(certifiedList);
        //assert.equal(certifiedList.term_id, mock_term._id);
        assert.equal(certifiedList.source, "KG_CCDEMLIST_100918.pdf");
        assert(Array.isArray(certifiedList.positions));

        const partyPosition = certifiedList.positions.pop();
        assert.equal(partyPosition.petition_number, 155);
        assert.equal(
          partyPosition.address,
          "7023 Narrows Avenue Brooklyn, NY 11209"
        );
        assert.equal(partyPosition.electoral_district, 93);
        assert.equal(partyPosition.assembly_district, 64);
        assert.equal(partyPosition.data_source, "KG_CCDEMLIST_100918.pdf");
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
    let filepath = MOCK_CERTIFIED_LIST_FILEPATH_TWO;
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    CertifiedListService.create({ filepath: filepath })
      .then(certifiedList => {
        assert.ok(certifiedList);
        assert.equal(certifiedList.source, "CertifiedList.mock.pdf");
        assert(Array.isArray(certifiedList.positions));
        assert.equal(certifiedList.positions.length, 2500);
        certifiedList.remove();
        done();
      })
      .catch(err => {
        console.log(err);
        assert(!err);

        done();
      });
  });

  it("can extract a party position from a row", () => {
    const mockDataRow = `633    County Committee   103/76   Mickey Mouse                    1 Epcot Street 21B New York, NY 10000           0              Uncontested`;
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    let position = CertifiedListService.extractPartyPositionDataFromRow(
      mockDataRow,
      "Disney County"
    );
    assert.equal(position.petition_number, "633");
    assert.equal(position.assembly_district, "76");
    assert.equal(position.electoral_district, "103");
    assert.equal(position.address, "1 Epcot Street 21B New York, NY 10000");
    assert.equal(position.tally, "0");
    assert.equal(position.entry_type, "Uncontested");
    assert.equal(position.ed_ad, "103/76");
    assert.equal(position.entry_type, "Uncontested");
  });

  it("can handle a certified pdf in JSON format", done => {
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );
    let encodedPdf = base64.base64Encode(MOCK_CERTIFIED_LIST_FILEPATH_TWO);

    let file_upload_base64 = [
      { title: "CertifiedList.mock.pdf", src: encodedPdf }
    ];

    CertifiedListService.create({
      file_data: file_upload_base64
    }).then(certified_list => {
      assert.ok(certified_list);
      assert.equal(certified_list.source, "CertifiedList.mock.pdf");
      certified_list.remove();
      done();
    });
  });

  it("registered the certified-list service", () => {
    assert.ok(app.service(app.get("apiPath") + "/certified-list"));
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
});
