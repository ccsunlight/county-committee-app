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
  importMembersToTerm(members, term, options = {}) {
    const importedMembers = [];
    const importErrors = [];

    return new Promise((resolve, reject) => {
      //var bulkWriteOp = MemberModel.collection.initializeUnorderedBulkOp();

      console.log("MEMBER LENGTH", members.length);

      const totalExistingSeatsForED = [];
      let membersSearched = 0;
      const allPromises = [];

      members.forEach(async function(member, index) {
        const existingSeatsForED = await MemberModel.find({
          electoral_district: member.electoral_district,
          assembly_district: member.assembly_district,
          office: member.office,
          term_id: term._id
        });

        for (var x = 0; x < existingSeatsForED.length; x++) {
          totalExistingSeatsForED.push(existingSeatsForED[x]);
        }

        membersSearched++;
        //console.log(foundMembers);

        if (membersSearched === members.length) {
          console.log("UNIQUE ITEMS: ", totalExistingSeatsForED.length);

          totalExistingSeatsForED.forEach(function(existingSeat, index) {
            existingSeat.office_holder = members[index].office_holder;
            existingSeat.sex = members[index].sex;
            existingSeat.part = members[index].part;
            existingSeat.address = members[index].address;
            existingSeat.county = members[index].county;
            existingSeat.data_source = members[index].data_source;
            existingSeat.state = members[index].state;
            existingSeat.committee = term.committee_id;
            existingSeat.term_id = term._id;
            existingSeat.entry_type = "Appointed";
            allPromises.push(existingSeat.save());
          });

          Promise.all(allPromises)
            .then(function(membersImported) {
              console.log(membersImported.length);
              resolve(membersImported);
            })
            .catch(function(err) {
              reject(err);
            });
        }
        //   })
        // bulkWriteOp
        //   .find({
        //     electoral_district: member.electoral_district,
        //     assembly_district: member.assembly_district,
        //     office: member.office,
        //     party: member.party,
        //     term_id: term._id
        //     //  office_holder: { $ne: member.office_holder }
        //   })
        //   .update({
        //     $set: {
        //       office_holder: member.office_holder,
        //       sex: member.sex,
        //       part: member.part,
        //       address: member.address,
        //       county: member.county,
        //       data_source: member.data_source,
        //       state: member.state,
        //       committee: term.committee_id,
        //       term_id: term._id,
        //       entry_type: "Appointed"
        //     }
        //   });
      });

      // bulkWriteOp.execute(function(err, bulkWriteResult) {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     console.log(JSON.stringify(bulkWriteResult));
      //     resolve(bulkWriteResult);
      //   }
      // });
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
