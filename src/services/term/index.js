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
   */
  importMembersToTerm(members, term, options = {}) {
    const importedMembers = [];
    const importErrors = [];

    return new Promise((resolve, reject) => {
      var bulkWriteOp = MemberModel.collection.initializeOrderedBulkOp();
      const bulkFields = { ...options.bulkFields };
      members.forEach((member, index) => {
        bulkWriteOp
          .find({
            electoral_district: member.electoral_district,
            assembly_district: member.assembly_district,
            office: member.office,
            party: member.party,
            term_id: term._id
          })
          .upsert()
          .updateOne({
            $set: {
              office_holder: member.office_holder,
              sex: member.sex,
              part: member.type,
              address: member.address,
              county: member.county,
              data_source: member.data_source,
              state: member.state,
              committee: term.committee._id,
              petition_number: member.petition_number,
              ...bulkFields
            }
          });
      });
      bulkWriteOp.execute(function(err, bulkWriteResult) {
        if (err) {
          reject(err);
        } else {
          resolve(bulkWriteResult);
        }
      });
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
