"use strict";

const FeathersMongoose = require("feathers-mongoose");
const TermModel = require("./term-model");
const MemberModel = require("../county-committee-member/county-committee-member-model");
const hooks = require("./hooks");

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
   * @param {Members} appointees
   * @param {Term} term
   *
   * @todo Handle asyncronous save better
   */
  appointMembersToTerm(appointees, term) {
    const appointedMembers = [];
    const appointmentErrors = [];

    return new Promise((resolve, reject) => {
      appointees.forEach((appointee, index) => {
        MemberModel.findOne({
          electoral_district: appointee.electoral_district,
          assembly_district: appointee.assembly_district,
          office: appointee.office,
          office_holder: "Vacancy",
          term_id: term._id
        }).then(async function(member) {
          if (!member) {
            appointmentErrors.push(
              `Appointment failed: row ${index} ED: ${
                appointee.electoral_district
              } AD: ${appointee.assembly_district} OFFICE_HOLDER: ${
                appointee.office_holder
              }. Check that the position exists or is already filled`
            );
          } else {
            member.office_holder = appointee.office_holder;
            member.sex = appointee.sex;
            member.entry_type = appointee.entry_type;
            member.part = appointee.type;
            member.address = appointee.address;
            member.county = appointee.county;
            member.data_source = appointee.data_source;
            member.state = appointee.state;
            appointedMembers.push(member);
          }

          if (index === appointees.length - 1) {
            if (appointmentErrors.length > 0) {
              reject(appointmentErrors);
            } else {
              for (let x = 0; x < appointedMembers.length; x++) {
                await appointedMembers[x].save();
              }
              resolve(appointedMembers);
            }
          }
        });
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
