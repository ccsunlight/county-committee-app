'use strict';

const service = require('feathers-mongoose');
const countyCommitteeMember = require('./county-committee-member-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: countyCommitteeMember,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use(app.get('apiPath') + '/county-committee-member', service(options));

  // Get our initialize service to that we can bind hooks
  const countyCommitteeMemberService = app.service(
    app.get('apiPath') + '/county-committee-member'
  );

  // Set up our before hooks
  countyCommitteeMemberService.before(hooks.before);

  // Set up our after hooks
  countyCommitteeMemberService.after(hooks.after);
};
