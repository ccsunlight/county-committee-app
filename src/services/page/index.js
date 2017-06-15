'use strict';

const service = require('feathers-mongoose');
const page = require('./page-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: page,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/page', service(options));

  // Get our initialize service to that we can bind hooks
  const pageService = app.service('/page');

  // Set up our before hooks
  pageService.before(hooks.before);

  // Set up our after hooks
  pageService.after(hooks.after);
};

