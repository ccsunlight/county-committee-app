"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const metascraper = require("metascraper")([
  require("metascraper-author")(),
  require("metascraper-date")(),
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-publisher")(),
  require("metascraper-title")(),
  require("metascraper-url")()
]);
const request = require("request-promise");
const got = require("got");

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    function(hook) {
      return new Promise(async function(resolve, reject) {
        try {
          const response = await got(hook.data.url);
          metascraper({ url: hook.data.url, html: response.body })
            .then(function(metadata) {
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
              resolve(hook);
            })
            .catch(e => {
              resolve(hook);
            });
        } catch (e) {
          resolve(hook);
        }
      });
    }
  ],
  update: [
    function(hook) {
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
  update: [
    globalHooks.logAction,
    function(hook) {
      return new Promise(function(resolve, reject) {
        if (
          !hook.data.social_post_status &&
          hook.data.post_to_social &&
          hook.data.status === "published"
        ) {
          request({
            url: process.env.SOCIAL_WEBHOOK,
            method: "POST",
            json: true,
            body: {
              title: hook.data.title,
              url: hook.data.url,
              key: process.env.SOCIAL_WEBHOOK_API_KEY
            }
          })
            .then(response => {
              const result = hook.service.patch(
                { _id: hook.data._id },
                { social_post_status: response.status }
              );
              resolve(hook);
            })
            .catch(err => {
              reject(err);
            });
        } else {
          resolve(hook);
        }
      });
    }
  ],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
