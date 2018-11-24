"use strict";

const service = require("feathers-mongoose");
const glossaryTerm = require("./glossary-term-model");
const hooks = require("./hooks");

module.exports = function() {
  const app = this;

  const options = {
    Model: glossaryTerm,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/glossary-term", service(options));

  // Get our initialize service to that we can bind hooks
  const glossaryTermService = app.service(
    app.get("apiPath") + "/glossary-term"
  );

  // Set up our before hooks
  glossaryTermService.before(hooks.before);

  // Set up our after hooks
  glossaryTermService.after(hooks.after);
};
