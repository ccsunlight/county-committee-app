"use strict";

const fs = require("fs");
const path = require("path");
const parse = require("csv-parse");
const extract = require("pdf-text-extract");
const PartyCall = require("./party-call-model");
const hooks = require("./hooks");
const CountyCommitteeMember = require("../county-committee-member/county-committee-member-model");
const CountyCommittee = require("../county-committee/county-committee-model");
const FeathersMongoose = require("feathers-mongoose");
const moment = require("moment");

/**
 * Handles importing party call CSV
 *
 * @usage
 * CSV shoud have the following format with the office that it's importing
 * to as the header and counts as the value. The first column is always district_key
 *
 * ex:
 * district_key,Male County Committee,Female County Committee
 * 02044,2,2
 * 02045,4,4
 *
 * or non gendered
 * district_key,County Committee
 * 02044,2
 * 02045,4
 *
 *
 *
 * @type       {Function}
 */
class Service extends FeathersMongoose.Service {
  getCSVColumnFormat(headerRow) {
    var district_columns = "";
    var offices = [];
    if (headerRow[0] === "district_key") {
      district_columns = "district_key";
      // It's a combined district key so iterate through
      // the rest and assign to offices.
      for (let x = 1; x < headerRow.length; x++) {
        offices.push(headerRow[x]);
      }
    } else if (headerRow[0] === "AD" && headerRow[1] === "ED") {
      district_columns = "split";
      // Start after second column
      for (let x = 2; x < headerRow.length; x++) {
        offices.push(headerRow[x]);
      }
    } else {
      throw new Error(
        "Invalid CSV Columns. CSV columns need to be in either [district_key, office1, office2,etc.] or [AD,ED,office1,offce2,etc.]"
      );
    }

    return {
      district_columns: district_columns,
      offices: offices
    };
  }
  districtKeyToADED(districtKey) {
    let ed_ad = { ed: undefined, ad: undefined };

    let re = /(\d{2})(\d{3})/;
    let matches = districtKey.match(re);

    // Captured two groups
    if (matches && matches.length === 3) {
      ed_ad.ad = parseInt(matches[1], 10);
      ed_ad.ed = parseInt(matches[2], 10);

      return ed_ad;
    } else {
      return false;
    }
  }
  getPartyCallPositionsFromCSV(params) {
    const {
      filepath,
      electionDate,
      party,
      county,
      state,
      committeeId
    } = params;
    // Data object for CC Member
    let position = {
      petition_number: undefined,
      office: undefined,
      office_holder: "None",
      address: undefined,
      tally: undefined,
      entry_type: "Position",
      ed_ad: undefined,
      electoral_district: undefined,
      assembly_district: undefined,
      data_source: undefined,
      county: county,
      state: state,
      committee: committeeId,
      party: party,
      data_source: path.basename(filepath),
      term_begins: new Date(electionDate),
      term_ends: moment(new Date(electionDate)).add(2, "years")
    };
    var parse = require("csv-parse");

    var positions = [];
    var csvConfig;
    let officeColumnStartIndex;

    return new Promise((resolve, reject) => {
      fs
        .createReadStream(filepath)
        .pipe(parse({ delimiter: "," }))
        .on("data", csvrow => {
          let ed_ad;
          if (!csvConfig) {
            csvConfig = this.getCSVColumnFormat(csvrow);
            if (csvConfig.district_columns === "district_key") {
              officeColumnStartIndex = 1;
            } else {
              officeColumnStartIndex = 2;
            }
          } else {
            if (csvConfig.district_columns === "district_key") {
              ed_ad = this.districtKeyToADED(csvrow[0]);
            } else {
              ed_ad = {
                ad: csvrow[0],
                ed: csvrow[1]
              };
            }

            // Create the CC seats for all the CC office columns

            if (ed_ad) {
              for (
                let officeColumnIndex = officeColumnStartIndex;
                officeColumnIndex <
                csvConfig.offices.length + officeColumnStartIndex;
                officeColumnIndex++
              ) {
                let seatCount = parseInt(csvrow[officeColumnIndex], 10);

                position.ed_ad = ed_ad.ed + "/" + ed_ad.ad;
                position.assembly_district = ed_ad.ad;
                position.electoral_district = ed_ad.ed;

                // Determin position
                if (csvConfig.district_columns === "district_key") {
                  //ed_ad = this.districtKeyToADED(csvrow[0]);
                  position.office = csvConfig.offices[0];
                } else {
                  position.office =
                    csvConfig.offices[
                      officeColumnIndex - officeColumnStartIndex
                    ];
                }

                if (seatCount > 0) {
                  for (let x = 0; x < seatCount; x++) {
                    positions.push(new CountyCommitteeMember(position));
                  }
                }
              }
            }
          }
        })
        .on("end", function() {
          resolve(positions);
        });
    });
  }
  create(params) {
    let partyCall;

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(params.filepath)) {
        reject("File does not exist: " + params.filepath);
        return;
      }

      CountyCommittee.findOne({
        county: params.county,
        party: params.party
      }).then(countyCommitee => {
        params.committeeId = countyCommitee.id;
        this.getPartyCallPositionsFromCSV(params).then(partyCallPositions => {
          let importedList = new PartyCall({
            county: params.county,
            party: params.party,
            source: path.basename(params.filepath),
            positions: partyCallPositions
          });
          importedList.save(err => {
            if (err) {
              reject(err);
            } else {
              resolve(importedList);
            }
          });
        });
      });
    });
  }
}

module.exports = function() {
  const app = this;

  const options = {
    Model: PartyCall,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/party-call", new Service(options));

  // Get our initialize service to that we can bind hooks
  const partyCallService = app.service(app.get("apiPath") + "/party-call");

  // Set up our before hooks
  partyCallService.before(hooks.before);

  // Set up our after hooks
  partyCallService.after(hooks.after);
};

module.exports.Service = Service;
