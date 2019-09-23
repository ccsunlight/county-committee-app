"use strict";

const fs = require("fs");
const path = require("path");
const extract = require("pdf-text-extract");
const FeathersMongoose = require("feathers-mongoose");
const converter = require("json-2-csv");

const CertifiedList = require("./certified-list-model");
const hooks = require("./hooks");
const PartyPosition = require("./party-position-model");

function certifiedListExtractionException(message) {
  this.message = message;
  this.name = "CertifiedListExtractionException";
}

class Service extends FeathersMongoose.Service {
  generateCSV(_id) {
    {
      const DELIMITER = ",";
      //const Utils = this.app.service("/utils");

      return new Promise((resolve, reject) => {
        const dataObjects = [];

        CertifiedList.findOne(_id).then(certifiedList => {
          certifiedList.positions.forEach(position => {
            dataObjects.push({
              id: position.id,
              office: position.office,
              office_holder: position.office_holder,
              address: position.address,
              data_source: position.data_source,
              assembly_district: position.assembly_district,
              electoral_district: position.electoral_district,
              ed_ad: position.ed_ad,
              entry_type: position.ed_ad,
              state: position.state,
              part: position.part,
              tally: position.tally,
              petition_number: position.petition_number
            });
          });
          converter
            .json2csvAsync(dataObjects)
            .then(csv => {
              resolve(csv);
            })
            .catch(err => reject("ERROR: " + err.message));
        });
      });
    }
  }

  extractCountyFromPage(page) {
    var match = page.match(/IN THE CITY OF NEW YORK\s+(.+), .+Party/);

    if (match) {
      return match[1];
    }
  }

  extractPartyPositionsFromPage(page) {
    var rows = page.match(/(.+)/g);

    // var county = this.extractCountyFromPage(page);
    // const party = this.extractPartyFromPage(page);

    var headerRowIndex = rows.findIndex(this.isPartyPositionTableHeaderRow);
    var footerRowIndex = rows.findIndex(this.isPartyPositionTableFooterRow);
    if (headerRowIndex > 0 && footerRowIndex > 0) {
      var partyPositionRows = rows.slice(headerRowIndex + 1, footerRowIndex);

      var errors = [];
      var partyPositions = [];

      partyPositionRows.forEach((partyPositionRow, index) => {
        try {
          partyPositions.push(
            this.extractPartyPositionDataFromRow(partyPositionRow)
          );
        } catch (e) {
          errors.push(e);
        }
      });

      return partyPositions;
    }
  }

  extractPartyFromPage(page) {
    var match = page.match(
      /persons were duly elected as\s+(.+)\sCounty Committee/
    );

    if (match) {
      return match[1];
    }
  }

  /**
   * Determines if row is a table header to extract columns
   * and determine where member data is in PDF.
   * @param  {[type]} row [description]
   * @return {[type]}     [description]
   */
  isPartyPositionTableHeaderRow(row) {
    return /Tally\s+Entry Type/.test(row);
  }

  /**
   * Determines if row is a table footer to extract columns
   * and determine where member ends is in PDF.
   * @param  {[type]} row [description]
   * @return {[type]}     [description]
   */
  isPartyPositionTableFooterRow(row) {
    return /Page \d+ of \d+/.test(row);
  }

  //ED/AD Office Holder Address Tally Entry Type
  /**
   * Extracts a member's attributes from a row of text
   * @param  {String} row    [description]
   * @param  {String} county [description]
   * @param  {String} state  [description]
   * @return {Object}        [description]
   */
  extractPartyPositionDataFromRow(row) {
    // if (!county) {
    //   throw new this.ccExtractionException(
    //     "County not provided for member row: " + row
    //   );
    // }

    // Data object for CC Member
    let party_position = {
      petition_number: undefined,
      office: undefined,
      office_holder: undefined,
      address: undefined,
      tally: undefined,
      entry_type: undefined,
      ed_ad: undefined,
      electoral_district: undefined,
      assembly_district: undefined,
      data_source: undefined
      //county: county,
      //state: state
    };

    //
    // Lots of gnarly regex logic to parse fields here.
    //
    // You've been warned.
    //

    // Splits up by two space matches.
    // @todo make sure there are no one spaced out items!
    var rowFields = row.split(/\s{2,}/);

    // Edge case for space at begninning
    if (rowFields[0] == "") {
      rowFields.shift();
    }
    // petition checker
    if (!isNaN(rowFields[0])) {
      party_position.petition_number = rowFields.shift();
    }

    if (/County Committee/i.test(rowFields[0])) {
      party_position.office = rowFields.shift();
    } else {
      throw new this.ccExtractionException(
        "Petition or position Field Not Valid. " + rowFields[0] + " Row: " + row
      );
    }

    // ED AD extractor
    if (/\d+\/\d+/.test(rowFields[0])) {
      party_position.ed_ad = rowFields.shift();
      var ed_ad = party_position.ed_ad.split("/");
      party_position.electoral_district = parseInt(ed_ad[0], 10);
      party_position.assembly_district = parseInt(ed_ad[1], 10);
    } else {
      throw new this.ccExtractionException(
        "ED/AD Field Not Valid. " + rowFields[0] + " Row: " + row
      );
    }

    // Office Holder extractor
    if (/Vacancy/i.test(rowFields[0])) {
      party_position.office_holder = rowFields.shift();
    } else {
      party_position.office_holder = rowFields.shift();

      //if (/NY/.test(rowFields[0])) {
      party_position.address = rowFields.shift();
      //} else {
      //    throw 'Address Field Not Valid. ' + rowFields[0] + ' Row: ' + row;
      //}

      if (!isNaN(parseInt(rowFields[0], 10))) {
        party_position.tally = rowFields.shift();
      } else {
        throw new this.ccExtractionException(
          "Tally Field Not Valid. " + rowFields[0] + " Row: " + row
        );
      }
    }

    if (/.+$/i.test(rowFields[0])) {
      party_position.entry_type = rowFields.shift();
    }

    return party_position;
  }

  extractPartyPositionsFromCertifiedListPDF(filepath) {
    return new Promise((resolve, reject) => {
      extract(filepath, (err, pages) => {
        if (err) {
          reject(err);
          console.log(err);
        }

        let partyPositions = [];
        let county, party;
        pages.forEach((page, index) => {
          // Keeps checking pages until it can extract county
          // Some pages have county on them others don't
          // if (!county) {
          //   county = this.extractCountyFromPage(page);
          // }

          // if (!party) {
          //   party = this.extractPartyFromPage(page);
          // }

          const extractedPartyPositionsFromPage = this.extractPartyPositionsFromPage(
            page
          );

          if (extractedPartyPositionsFromPage) {
            partyPositions.push(
              ...extractedPartyPositionsFromPage.map(extractedPartyPosition => {
                const partyPosition = new PartyPosition(extractedPartyPosition);
                partyPosition.data_source = path.basename(filepath);
                return partyPosition;
              })
            );
          }
        });

        resolve({
          positions: partyPositions,
          source: path.basename(filepath)
        });
      });
    });
  }

  setup(app, path) {
    this.app = app;
  }

  create(params) {
    let certifiedList;

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(params.filepath)) {
        reject("File does not exist: " + params.filepath);
        return;
      }
      this.extractPartyPositionsFromCertifiedListPDF(params.filepath).then(
        certifiedList => {
          //console.log("certified list", certifiedList);
          let importedList = new CertifiedList(certifiedList);
          importedList.save(err => {
            if (err) {
              reject(err);
            } else {
              resolve(importedList);
            }
          });
        }
      );
    });
  }
}

module.exports = function() {
  const app = this;

  const options = {
    Model: CertifiedList,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  const service = new Service(options);

  service.setup(app, app.get("apiPath") + "/certified-list", service);

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/certified-list", service, function updateData(
    req,
    res,
    next
  ) {
    // If it's request in a csv format send a download attachment response
    // of the CSV text
    // @todo find a better way to handle this
    if (req.query.format === "csv") {
      res.setHeader(
        "Content-disposition",
        `attachment; filename=certified-list-csv-${req.params.__feathersId}.csv`
      );
      res.setHeader("Content-type", "text/plain");

      res.send(res.data, options, function(err) {
        if (err) {
          next(err);
        } else {
        }
      });
    } else {
      next();
    }
  });

  // Get our initialize service to that we can bind hooks
  const certifiedListService = app.service(
    app.get("apiPath") + "/certified-list"
  );
  // Set up our before hooks
  certifiedListService.before(hooks.before);

  // Set up our after hooks
  certifiedListService.after(hooks.after);
};

module.exports.Service = Service;
