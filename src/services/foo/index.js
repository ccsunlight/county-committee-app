"use strict";

const Sequelize = require("sequelize");
const service = require("feathers-sequelize");
const page = require("./foo-model");
const hooks = require("./hooks");

module.exports = function() {
  const app = this;

  const options = {
    Model: page,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/foo", service(options));

  // Get our initialize service to that we can bind hooks
  const fooService = app.service(app.get("apiPath") + "/foo");

  // Set up our before hooks
  fooService.before(hooks.before);

  // Set up our after hooks
  fooService.after(hooks.after);
};
