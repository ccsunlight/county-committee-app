"use strict";

const fs = require("fs");
const path = require("path");
const parse = require("csv-parse");
const extract = require("pdf-text-extract");
const PartyCall = require("./party-call-model");
const hooks = require("./hooks");
const CountyCommitteeMember = require("../county-committee-member/county-committee-member-model");
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
    const { filepath, electionDate, party, county, state } = params;
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
      party: party,
      data_source: path.basename(filepath),
      term_begins: new Date(electionDate),
      term_ends: moment(new Date(electionDate)).add(2, "years")
    };
    var parse = require("csv-parse");

    var positions = [];

    return new Promise((resolve, reject) => {
      fs
        .createReadStream(filepath)
        .pipe(parse({ delimiter: "," }))
        .on("data", csvrow => {
          if (positions.length === 0 && !position.office) {
            position.office = csvrow[1];
          } else {
            let ed_ad = this.districtKeyToADED(csvrow[0]);
            let seatCount = parseInt(csvrow[1], 10);
            if (ed_ad) {
              position.ed_ad = ed_ad.ed + "/" + ed_ad.ad;
              position.assembly_district = ed_ad.ad;
              position.electoral_district = ed_ad.ed;

              if (seatCount > 0) {
                for (let x = 0; x < seatCount; x++) {
                  positions.push(new CountyCommitteeMember(position));
                }
              }
              //do something with csvrow
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
