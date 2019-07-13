"use strict";

const FeathersMongoose = require("feathers-mongoose");
const TermModel = require("./term-model");
const MemberModel = require("../county-committee-member/county-committee-member-model");
const hooks = require("./hooks");
const mongoose = require("mongoose");

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
          const updateOneResult = await MemberModel.updateOne(
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
}

module.exports = function() {
  const app = this;

  const options = {
    Model: TermModel,
    paginate: {
      default: 5,
      max: app.get("api").defaultItemLimit
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/term", new Service(options));

  // Get our initialize service to that we can bind hooks
  const termService = app.service(app.get("apiPath") + "/term");
  // Set up our before hooks
  termService.before(hooks.before);

  // Set up our after hooks
  termService.after(hooks.after);
};
