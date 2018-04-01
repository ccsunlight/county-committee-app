'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const metascraper = require('metascraper');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    function(hook) {
      return new Promise(function(fulfill, reject) {
        metascraper.scrapeUrl(hook.data.url).then(function(metadata) {
          // {
          //   "author": "Ellen Huet",
          //   "date": "2016-05-24T18:00:03.894Z",
          //   "description": "The HR startups go to war.",
          //   "image": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ioh_yWEn8gHo/v1/-1x-1.jpg",
          //   "publisher": "Bloomberg.com",
          //   "title": "As Zenefits Stumbles, Gusto Goes Head-On by Selling Insurance"
          // }

          if (metadata.title) {
            hook.data.title = metadata.title;
          }

          if (metadata.description) {
            hook.data.description = metadata.description;
          }

          if (metadata.image) {
            hook.data.image = metadata.image;
          }

          if (metadata.publisher) {
            hook.data.site_name = metadata.publisher;
          }

          if (metadata.date) {
            hook.data.published_on = metadata.date;
          }

          fulfill(hook);
        });
      });
    }
  ],
  update: [
    function(hook) {
      console.log('hook', hook);
      delete hook.data.updatedAt;
      return hook;
    }
  ],
  patch: [],
  remove: []
};

exports.after = {
  all: [
    function(hook) {
      if (hook.result.data) {
        hook.result.data.map(function(record) {
          record.id = record._id;
          return record;
        });
      } else {
        console.log(hook.result);
      }
    }
  ],
  find: [
    function(hook) {
      if (hook.result.data) {
        hook.result.data.map(function(record) {
          record.id = record._id;
          return record;
        });
      } else {
        console.log(hook.result);
      }
    }
  ],
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
