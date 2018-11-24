"use strict";

const service = require("feathers-mongoose");
const invite = require("./invite-model");
const hooks = require("./hooks");
const mongoose = require("mongoose");

module.exports = function() {
  const app = this;

  const options = {
    Model: invite,
    paginate: {
      default: 5,
      max: 25
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/invite", service(options));

  // Get our initialize service to that we can bind hooks
  let inviteService = app.service(app.get("apiPath") + "/invite");

  // Set up our before hooks
  inviteService.before(hooks.before);

  // Set up our after hooks
  inviteService.after(hooks.after);

  console.log("init invite service");

  return inviteService;
};
