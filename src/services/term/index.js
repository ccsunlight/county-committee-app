"use strict";

const FeathersMongoose = require("feathers-mongoose");
const TermModel = require("./term-model");
const MemberModel = require("../county-committee-member/county-committee-member-model");
const hooks = require("./hooks");
const mongoose = require("mongoose");

class Service extends FeathersMongoose.Service {}

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
