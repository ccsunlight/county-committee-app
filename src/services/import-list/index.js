"use strict";

const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/lib/sync");
const ImportList = require("./import-list-model");
const hooks = require("./hooks");
const CountyCommitteeMemberModel = require("../county-committee-member/county-committee-member-model");
const CountyCommitteeModel = require("../county-committee/county-committee-model");
const Term = require("../term/term-model");
const FeathersMongoose = require("feathers-mongoose");

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
 * @type       {Function}
 */
class Service extends FeathersMongoose.Service {
  /**
   * Appoints members to a term
   * @param {Members} members
   * @param {Term} term
   * @param {Object} options
   * @param {Object} bulkFields Fields that will apply to allrecords
   *
   * @returns {Object} bulkImportResults
   * @returns {Integer} n The total number of documents
   * @returns {Integer} nModified
   * @returns {Array} modifiedResults
   * @returns {Integer} nInserted
   * @returns {Array} insertedResults
   * @returns {Integer} nNotMatched
   *  @returns {Array} notMatchedResults
   */
  importMembersToTerm(
    import_list,
    term,
    options = {
      conditionals: {},
      upsert: false,
      bulkFields: {},
      timestamps: true
    }
  ) {
    const members = import_list.members;
    const importedMembers = [];
    const importErrors = [];

    return new Promise(async (resolve, reject) => {
      const bulkUpdateResults = {
        modifiedResults: [],
        insertedResults: [],
        notMatchedResults: []
      };

      for (let x = 0; x < members.length; x++) {
        try {
          const updateOneResult = await CountyCommitteeMemberModel.updateOne(
            {
              // Matches ED, AD, and term for each for each import
              // @todo figure out county/party matching. Term will ensure right party            electoral_district: members[x].electoral_district,
              assembly_district: members[x].assembly_district,
              electoral_district: members[x].electoral_district,
              office: members[x].office,
              term_id: term._id
            },
            {
              office_holder: members[x].office_holder,
              sex: members[x].sex,
              part: members[x].part,
              address: members[x].address,
              entry_type: members[x].entry_type,
              county: members[x].county,
              data_source: members[x].data_source,
              electoral_district: members[x].electoral_district,
              assembly_district: members[x].assembly_district,
              state: members[x].state,
              committee: term.committee_id,
              term_id: term._id,
              import_list_id: import_list._id,
              ...options.bulkFields
            },
            {
              runValidators: true,
              timestamps: options.timestamps,
              upsert: options.upsert
            }
          ).where({
            // Prevent updating from the same import
            // in the case where existing records
            // have same criterea. ex: Vacancy
            import_list_id: {
              $ne: import_list._id
            },
            ...options.conditionals
          });

          if (updateOneResult.nModified > 0) {
            bulkUpdateResults.modifiedResults.push({
              ...updateOneResult,
              member: members[x]
            });
          } else if (updateOneResult.upserted && updateOneResult.ok === 1) {
            bulkUpdateResults.insertedResults.push({
              ...updateOneResult,
              member: members[x]
            });
          } else {
            bulkUpdateResults.notMatchedResults.push({
              ...updateOneResult,
              member: members[x]
            });
          }
        } catch (e) {
          console.log(e);
          reject("Error during list import", e);
        }
      }

      bulkUpdateResults.nInserted = bulkUpdateResults.insertedResults.length;
      bulkUpdateResults.nModified = bulkUpdateResults.modifiedResults.length;
      bulkUpdateResults.nNotMatched =
        bulkUpdateResults.notMatchedResults.length;

      bulkUpdateResults.n =
        bulkUpdateResults.nInserted +
        bulkUpdateResults.nModified +
        bulkUpdateResults.nNotMatched;

      resolve(bulkUpdateResults);
    });
  }

  extractDataFromCSV(filepath) {
    const rows = parse(fs.readFileSync(filepath, { encoding: "utf-8" }), {
      columns: true,
      skip_empty_lines: true
    });
    return rows;
  }

  /**
   * Takes a Party Call CSV filepath and converts it to an array of
   * CountyCommitteeModel model objects
   * @todo break out the extraction and the model creation to two different
   * functions
   * @param {Object} params The params object passed to the service
   */
  extractMembersFromCSV(params) {
    const { filepath, party, county, state, committee_id } = params;

    var parse = require("csv-parse");

    var members = [];
    var csvConfig;
    let officeColumnStartIndex;

    return new Promise((resolve, reject) => {
      const rows = this.extractDataFromCSV(filepath);
      const members = [];
      rows.map((row, index) => {
        members.push(
          new CountyCommitteeMemberModel({
            ...row,
            county: county,
            party: party,
            committee: committee_id,
            data_source: filepath,
            state: state
          })
        );
      });
      resolve(members);
    });
  }
  create(params) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(params.filepath)) {
        reject("File does not exist: " + params.filepath);
        return;
      }

      Term.findOne({ _id: params.term_id }).then(term => {
        term.populate();
        if (!term) {
          reject("Term does not exist");
          return;
        } else {
          let countyCommittee = term.committee;
          this.extractMembersFromCSV({
            county: countyCommittee.county,
            party: countyCommittee.party,
            committee_id: countyCommittee._id,
            ...params
          }).then(members => {
            let importedList = new ImportList({
              source: path.basename(params.filepath),
              members: members,
              committee_id: countyCommittee._id,
              term_id: params.term_id,
              conditionals: params.conditionals,
              upsert: params.upsert,
              bulkFields: params.bulkFields
            });
            importedList.save(err => {
              if (err) {
                reject(err);
              } else {
                resolve(importedList);
              }
            });
          });
        }
      });
    });
  }
}

module.exports = function() {
  const app = this;

  const options = {
    Model: ImportList,
    paginate: {
      default: 10,
      max: 10
    },
    lean: false
  };

  const service = new Service(options);
  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/import-list", service, function updateData(
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
        `attachment; filename=import-list-${req.params.__feathersId}.csv`
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
  const ImportListService = app.service(app.get("apiPath") + "/import-list");

  // Set up our before hooks
  ImportListService.before(hooks.before);

  // Set up our after hooks
  ImportListService.after(hooks.after);
};

module.exports.Service = Service;
