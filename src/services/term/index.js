"use strict";

const service = require("feathers-mongoose");
const term = require("./term-model");
const hooks = require("./hooks");

module.exports = function() {
  const app = this;

  const options = {
    Model: term,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/term", service(options));

  // Get our initialize service to that we can bind hooks
  const termService = app.service(app.get("apiPath") + "/term");

  // Set up our before hooks
  termService.before(hooks.before);

  // Set up our after hooks
  termService.after(hooks.after);
};
