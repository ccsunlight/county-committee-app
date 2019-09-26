"use strict";

const service = require("feathers-mongoose");
const CountyCommittee = require("./county-committee-model");
const CountyCommitteeMember = require("../county-committee-member/county-committee-member-model");

const hooks = require("./hooks");
const mongoose = require("mongoose");

module.exports = function() {
  const app = this;

  const options = {
    Model: CountyCommittee,
    paginate: {
      default: 10,
      max: app.get("api").defaultItemLimit
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/county-committee", service(options));

  // Get our initialize service to that we can bind hooks
  const countyCommitteeService = app.service(
    app.get("apiPath") + "/county-committee"
  );

  // Set up our before hooks
  countyCommitteeService.before(hooks.before);

  // Set up our after hooks
  countyCommitteeService.after(hooks.after);
};
