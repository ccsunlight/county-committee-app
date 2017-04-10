'use strict';

const service = require('feathers-mongoose');
const edGeometry = require('./edGeometry-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: edGeometry,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/edGeometries', service(options));

  // Get our initialize service to that we can bind hooks
  const edGeometryService = app.service('/edGeometries');

  // Set up our before hooks
  edGeometryService.before(hooks.before);

  // Set up our after hooks
  edGeometryService.after(hooks.after);
};
