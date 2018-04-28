"use strict";

const fs = require("fs");
const path = require("path");
const extract = require("pdf-text-extract");

const hooks = require("./hooks");

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    return Promise.resolve({
      id,
      text: `A new message with ID: ${id}!`
    });
  }

  extractCountyFromPage(page) {
    var match = page.match(/IN THE CITY OF NEW YORK\s+(.+), .+Party/);

    if (match) {
      return match[1];
    }
  }

  extractCCMembersFromPage(page) {
    var rows = page.match(/(.+)/g);

    var county = this.extractCountyFromPage(page);

    var headerRowIndex = rows.findIndex(this.findCCMemberHeaderRow);
    var footerRowIndex = rows.findIndex(this.findCCMemberFooterRow);
    if (headerRowIndex > 0 && footerRowIndex > 0) {
      var ccMemberRows = rows.slice(headerRowIndex + 1, footerRowIndex);

      var errors = [];
      var ccMembers = [];

      ccMemberRows.forEach((memberRow, index) => {
        try {
          ccMembers.push(this.extractCCMemberDataFromRow(memberRow, county));
        } catch (e) {
          errors.push(e);
        }
      });

      return ccMembers;
    }
  }

  findCCMemberHeaderRow(row) {
    if (/Tally\s+Entry Type/.test(row)) {
      return true;
    } else {
      return false;
    }
  }

  findCCMemberFooterRow(row) {
    if (/Page \d+ of \d+/.test(row)) {
      return true;
    } else {
      return false;
    }
  }

  //ED/AD Office Holder Address Tally Entry Type

  extractCCMemberDataFromRow(row, county) {
    var cc_member = {
      petition_number: undefined,
      office: undefined,
      office_holder: undefined,
      address: undefined,
      tally: undefined,
      entry_type: undefined,
      ed_ad: undefined,
      electoral_district: undefined,
      assembly_district: undefined,
      data_source: undefined,
      county: county,
      state: "NY"
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
      cc_member.petition_number = rowFields.shift();
    }

    if (/County Committee/i.test(rowFields[0])) {
      cc_member.office = rowFields.shift();
    } else {
      throw new this.ccExtractionException(
        "Petition or position Field Not Valid. " + rowFields[0] + " Row: " + row
      );
    }

    // ED AD extractor
    if (/\d+\/\d+/.test(rowFields[0])) {
      cc_member.ed_ad = rowFields.shift();
      var ed_ad = cc_member.ed_ad.split("/");
      cc_member.electoral_district = parseInt(ed_ad[0], 10);
      cc_member.assembly_district = parseInt(ed_ad[1], 10);
    } else {
      throw new this.ccExtractionException(
        "ED/AD Field Not Valid. " + rowFields[0] + " Row: " + row
      );
    }

    // Office Holder extractor
    if (/Vacancy/i.test(rowFields[0])) {
      cc_member.office_holder = rowFields.shift();
    } else {
      cc_member.office_holder = rowFields.shift();

      //if (/NY/.test(rowFields[0])) {
      cc_member.address = rowFields.shift();
      //} else {
      //    throw 'Address Field Not Valid. ' + rowFields[0] + ' Row: ' + row;
      //}

      if (!isNaN(parseInt(rowFields[0], 10))) {
        cc_member.tally = rowFields.shift();
      } else {
        throw new this.ccExtractionException(
          "Tally Field Not Valid. " + rowFields[0] + " Row: " + row
        );
      }
    }

    if (/.+$/i.test(rowFields[0])) {
      cc_member.entry_type = rowFields.shift();
    }

    return cc_member;
  }

  ccExtractionException(message) {
    this.message = message;
    this.name = "CCMemberException";
  }

  getCCMembersFromCertifiedListPDF(filepath) {
    return new Promise((resolve, reject) => {
      extract(filepath, (err, pages) => {
        if (err) {
          reject(err);
          console.log(err);
        }

        let members = [];
        let county;
        pages.forEach((page, index) => {
          // Keeps checking pages until it can extract county
          // Some pages have county on them others don't
          if (!county) {
            county = this.extractCountyFromPage(page);
          }
          members.push(this.extractCCMembersFromPage(page));
        });

        resolve({
          county: county,
          members: members
        });
      });
    });
  }

  create(params) {
    let certifiedList;
    return this.getCCMembersFromCertifiedListPDF(params.filepath);
  }

  update(id, data, params) {
    return Promise.resolve(data);
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function() {
  const app = this;

  // Initialize our service with any options it requires
  app.use("/certified-list", new Service());

  // Get our initialize service to that we can bind hooks
  const certifiedListService = app.service("/certified-list");

  // Set up our before hooks
  certifiedListService.before(hooks.before);

  // Set up our after hooks
  certifiedListService.after(hooks.after);
};

module.exports.Service = Service;
