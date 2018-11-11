"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const slugify = require("slugify");

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [generateAlias],
  update: [generateAlias],
  patch: [generateAlias],
  remove: [archive]
};

/**
 * This hook overrides the regular delete instead
 * calling the "archive" function which moves the collection
 * and the cc members collection to archive collections.
 *
 * @param      {<type>}  context  The context
 * @return     {<type>}  { description_of_the_return_value }
 */
function archive(context) {
  return context.service.get(context.id).then(county_committee => {
    if (county_committee) {
      delete county_committee.__v;
    }
    return context.service.archive(county_committee).then(result => {
      context.result = result;
      return context;
    });
  });
}

function generateAlias(hook) {
  hook.data.alias = slugify(
    hook.data.county + " " + hook.data.party + " County Committee"
  ).toLowerCase();
}

exports.after = {
  all: [
    function(hook) {
      if (hook.result.data) {
        hook.result.data.map(function(record) {
          record.id = record._id;
          return record;
        });
      } else {
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
      }
    }
  ],
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
