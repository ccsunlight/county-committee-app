"use strict";

const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/lib/sync");
const csv = require("fast-csv");
const assert = require("assert");
const app = require("../../../src/app");
const moment = require("moment");
//const TermService = require("../../../src/services/term");
//const CertifiedListService = require("../../../src/services/certified-list");
const TermModel = require("../../../src/services/term/term-model");
const MemberModel = require("../../../src/services/county-committee-member/county-committee-member-model");
const CertifiedListModel = require("../../../src/services/certified-list/certified-list-model");

const MOCK_CSV_FILE_PATH = path.join(
  __dirname,
  "./mocks/Manhattan Party Call Part Mapping.csv"
);

const cerfied_list_path = "/usr/src/app/test/mocks/CertifiedList.mock.pdf";
const termMock = require("../../mocks/term.mock.json");
const ccMock = require("../../mocks/county-committee.mock.json");
const mongoose = require("mongoose");

describe("ED AD Part Service Service", function() {
  let TermService, CertifiedListService;
  let county_committee;

  const cleanupDBDocs = [];
  let ccService, ccMemberService;
  let mock_term, mock_county_committee, mock_county_committee_member;
  /**
   * Sets up the database
   */
  beforeEach(function(done) {
    TermService = app.service(app.get("apiPath") + "/term");
    CertifiedListService = app.service(app.get("apiPath") + "/certified-list");
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
        cleanupDBDocs.push(mock_county_committee);

        term.save(async function(err) {
          mock_term = term;
          cleanupDBDocs.push(mock_term);

          const mockCountyCommitteeData = fs.readFileSync(
            path.join(__dirname, "./mocks/manhattan-cc-data.csv"),
            "utf-8"
          );

          const ccRows = parse(mockCountyCommitteeData, {
            columns: true,
            skip_empty_lines: true
          });

          for (let x = 0; x < ccRows.length; x++) {
            const row = ccRows[x];
            const member = await ccMemberService.create({
              committee: mock_county_committee._id,
              term_id: mock_term._id,
              party: row.party,
              petition_number: row.petition_number,
              office: row.office,
              office_holder: row.office_holder,
              address: row.address,
              tally: row.tally,
              ed_ad: row.ed_ad,
              entry_type: row.entry_type,
              electoral_district: row.electoral_district,
              assembly_district: row.assembly_district,
              data_source: row.data_source,
              county: row.county,
              state: row.state
            });

            cleanupDBDocs.push(member);
          }

          done();
        });
      });
  });
  afterEach(async function() {
    for (let x = 0; x < cleanupDBDocs.length; x++) {
      const result = await cleanupDBDocs[x].remove();
    }

    console.log("Test records cleaned", cleanupDBDocs.length);
  });

  it("registered the import-list service", () => {
    assert.ok(app.service(app.get("apiPath") + "/ad-part-map"));
  });

  it("can create an AD part map", async () => {
    const ADPartMapService = app.service(app.get("apiPath") + "/ad-part-map");

    const adPartMap = await ADPartMapService.create({
      filepath: MOCK_CSV_FILE_PATH,
      term_id: mock_term._id
    });

    cleanupDBDocs.push(adPartMap);

    assert.equal(adPartMap.status, "Draft");
    assert.ok(Array.isArray(adPartMap.partMappings));
    assert.equal(adPartMap.partMappings.length, 1249);
  });

  it("can publish an AD part map", async () => {
    const ADPartMapService = app.service(app.get("apiPath") + "/ad-part-map");

    const adPartMap = await ADPartMapService.create({
      filepath: MOCK_CSV_FILE_PATH,
      term_id: mock_term._id
    });

    cleanupDBDocs.push(adPartMap);

    const adPartMapUpdated = await ADPartMapService.patch(adPartMap._id, {
      published: true
    });

    assert.equal(adPartMapUpdated.status, "Completed");

    const failedMappings = adPartMapUpdated.partMappings.filter(
      partMapping => partMapping.status === "Failed"
    );

    assert.equal(
      failedMappings.length,
      adPartMapUpdated.importResults.failedUpdates.length
    );
  });
});
