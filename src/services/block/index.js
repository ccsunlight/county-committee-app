"use strict";

const service = require("feathers-mongoose");
const homepage = require("./block-model");
const hooks = require("./hooks");

module.exports = function() {
  const app = this;

  const options = {
    Model: homepage,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/block", service(options));

  // Get our initialize service to that we can bind hooks
  const blockService = app.service(app.get("apiPath") + "/block");

  // Set up our before hooks
  blockService.before(hooks.before);

  // Set up our after hooks
  blockService.after(hooks.after);
};
