'use strict';

const service = require('feathers-mongoose');
const countyCommittee = require('./county-committee-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: countyCommittee,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use(app.get('apiPath') + '/county-committee', service(options));

  // Get our initialize service to that we can bind hooks
  const countyCommitteeService = app.service(app.get('apiPath') + '/county-committee');

  // Set up our before hooks
  countyCommitteeService.before(hooks.before);

  // Set up our after hooks
  countyCommitteeService.after(hooks.after);

};

