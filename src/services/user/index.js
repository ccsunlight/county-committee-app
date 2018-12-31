"use strict";

const service = require("feathers-mongoose");
const UserModel = require("./user-model");
const hooks = require("./hooks");

module.exports = function() {
  const app = this;

  const options = {
    Model: UserModel,
    paginate: {
      default: 5,
      max: 25
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/user", service(options));

  app.use(app.get("apiPath") + "/profile", service(options));
  //app.use('/user', service(options));

  // Get our initialize service to that we can bind hooks
  const userService = app.service(app.get("apiPath") + "/user");

  // Set up our before hooks
  userService.before(hooks.before);

  // Set up our after hooks
  userService.after(hooks.after);

  const profileService = app.service(app.get("apiPath") + "/profile");

  // Set up our before hooks
  profileService.before(hooks.before);

  // Set up our after hooks
  profileService.after(hooks.after);
};
