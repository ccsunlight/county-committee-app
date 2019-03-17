"use strict";

const service = require("feathers-mongoose");
const enrollment = require("./enrollment-model");
const hooks = require("./hooks");

module.exports = function() {
  const app = this;

  const options = {
    Model: enrollment,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/enrollment", service(options));

  // Get our initialize service to that we can bind hooks
  const enrollmentService = app.service(app.get("apiPath") + "/enrollment");

  // Set up our before hooks
  enrollmentService.before(hooks.before);

  // Set up our after hooks
  enrollmentService.after(hooks.after);
};
