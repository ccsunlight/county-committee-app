'use strict';

const service = require('feathers-mongoose');
const actionLog = require('./action-log-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: actionLog,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use(app.get('apiPath') + '/action-log', service(options));

  // Get our initialize service to that we can bind hooks
  const actionLogService = app.service(app.get('apiPath') + '/action-log');

  // Set up our before hooks
  actionLogService.before(hooks.before);

  // Set up our after hooks
  actionLogService.after(hooks.after);

};

