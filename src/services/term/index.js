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
            reject(err);
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
      max: 25
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
