"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const converter = require("json-2-csv");

exports.before = {
  all: [],
  find: [],
  get: [],
  /**
   *
   */
  create: [
    /**
     * Fetches the BOE results from the url provided
     * @param {*} context
     */
    function(context) {
      return new Promise(function(resolve, reject) {
        context.service
          .boeHtmlToJson(context.data)
          .then(results => {
            context.data.results = results;
            resolve(context);
          })
          .catch(err => {
            console.log(err);
            reject(context);
          });
      });
    }
  ],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [
    function(context) {
      if (context.params.query.format === "csv") {
        return new Promise((resolve, reject) => {
          converter.json2csvAsync(context.result.results).then(csv => {
            context.result = csv;
            resolve(context);
          });
        });
      }
    }
  ],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
