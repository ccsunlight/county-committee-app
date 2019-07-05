"use strict";

const FeathersMongoose = require("feathers-mongoose");
const TermModel = require("./term-model");
const MemberModel = require("../county-committee-member/county-committee-member-model");
const hooks = require("./hooks");
const mongoose = require("mongoose");

class Service extends FeathersMongoose.Service {
  createMembersFromCertifiedList(params) {
    return new Promise((resolve, reject) => {
      TermModel.findOne(params.term_id).then(term => {
        let positions = term.certified_list.positions;
        let members = [];
        positions.forEach(position => {
          let member = new MemberModel(position);
          member.term_id = term._id;
          members.push(member);
        });

        MemberModel.insertMany(members)
          .then(raw_result => {
            resolve(raw_result);
          })
          .catch(err => {
            debugger;
            reject(err);
          });
      });
    });
  }

  /**
   * Appoints members to a term
   * @param {Members} members
   * @param {Term} term
   * @param {Object} options
   * @param {Object} bulkFields Fields that will apply to allrecords
   *
   * @todo Handle asyncronous save better
   * @todo Bug for when two records in the import
   * are saving to same ED_AD and office.
   * Need to figure out a way to import so that the secondone doesn't
   * overwrite the first.
   */
  importMembersToTerm(
    members,
    term,
    options = {
      conditionals: {},
      upsert: false,
      bulkFields: {},
      timestamps: true
    }
  ) {
    const importedMembers = [];
    const importErrors = [];

    return new Promise(async (resolve, reject) => {
      const memberImportResults = { n: 0, nModified: 0, unImportedRecords: [] };

      for (let x = 0; x < members.length; x++) {
        try {
          const memberImportResult = await MemberModel.updateOne(
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
              ...options.bulkFields
            },
            {
              timestamps: options.timestamps,
              upsert: options.upsert
            }
          ).where({
            // We want to exclude updating from the same source.
            // This can be easily circumvented by renaming the source file
            data_source: {
              $ne: members[x].data_source
            },
            ...options.conditionals
          });

          memberImportResults.n++;
          if (memberImportResult.nModified > 0) {
            memberImportResults.nModified += memberImportResult.nModified;
          } else {
            memberImportResults.unImportedRecords.push(members[x]);
          }
        } catch (e) {
          reject("Error during list import", e);
        }
      }
      resolve(memberImportResults);
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
