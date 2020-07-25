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

const cerfied_list_path = "/usr/src/app/test/mocks/CertifiedList.mock.pdf";
const termMock = require("../../mocks/term.mock.json");
const ccMock = require("../../mocks/county-committee.mock.json");
const mongoose = require("mongoose");

describe.only("ED AD Part Service Service", function() {
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

        // Import a Manhattan CC

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

  it("can read an ED AD Part CSV", async () => {
    const mockEDADPartMapCSV = fs.readFileSync(
      path.join(__dirname, "./mocks/Manhattan Party Call Part Mapping.csv"),
      "utf-8"
    );

    const parsedEDADPartMapRowCSV = await parse(mockEDADPartMapCSV, {
      columns: true,
      skip_empty_lines: true
    });

    const EDADPartMap = parsedEDADPartMapRowCSV.map(row => {
      const denormalizedEDs = row.ED.split(",")
        .filter(elem => elem.length > 0) // Filters out trailing comma elements.
        .map(edsForADPart => {
          if (edsForADPart.indexOf("-") > -1) {
            /**
             * For values x-y.Splits them and then adds all the numbers
             * in the range.
             */
            const edBounds = edsForADPart.split("-");
            const edsInRange = [];
            for (
              let x = Number(edBounds[0].trim());
              x <= Number(edBounds[1].trim());
              x++
            ) {
              edsInRange.push(x);
            }
            return edsInRange;
          } else {
            return Number(edsForADPart.trim());
          }
        });

      row.EDs = denormalizedEDs.reduce((accumulator, ed) => {
        if (Array.isArray(ed)) {
          accumulator.push(...ed);
        } else {
          accumulator.push(ed);
        }
        return accumulator;
      }, []);

      return row;
    });

    const reducedEDADPartMap = EDADPartMap.reduce((accumulator, partMap) => {
      for (let x = 0; x < partMap.EDs.length; x++) {
        accumulator.push({
          assembly_district: Number(partMap.AD),
          electoral_district: partMap.EDs[x],
          part: partMap.PART
        });
      }
      return accumulator;
    }, []);

    const failedUpdates = [];

    for (let i = 0; i < reducedEDADPartMap.length; i++) {
      const result = await MemberModel.update(
        {
          committee: mock_county_committee,
          assembly_district: reducedEDADPartMap[i].assembly_district,
          electoral_district: reducedEDADPartMap[i].electoral_district
        },
        { $set: { part: reducedEDADPartMap[i].part } },
        { multi: true }
      );
      if (result.n === 0) {
        failedUpdates.push(reducedEDADPartMap[i]);
      }
    }

    const updatedMembersMissingParts = await MemberModel.find({
      committee: mock_county_committee,
      part: ""
    });

    const results = { unmappedEDs: failedUpdates, updatedMembersMissingParts };

    // @todo
    // - Test that no unmappedEDs match EDs with outparts
    // - Figure out what to do with results that have individual failurs
    // - Move this to service
    // console.log(results);
    assert.ok(results.unmappedEDs);
    assert.ok(results.updatedMembersMissingParts);

    // csv
    //   .writeToPath(path.resolve(__dirname, "./mocks", "tmp.csv"), output)
    //   .on("error", err => console.error(err))
    //   .on("finish", () => {
    //     done();
    //   });
  });
});
