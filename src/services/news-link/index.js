'use strict';

const service = require('feathers-mongoose');
const newsLink = require('./news-link-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: newsLink,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use(app.get('apiPath') + '/news-link', service(options));

  // Get our initialize service to that we can bind hooks
  const newsLinkService = app.service(app.get('apiPath') + '/news-link');

  // Set up our before hooks
  newsLinkService.before(hooks.before);

  // Set up our after hooks
  newsLinkService.after(hooks.after);

};

