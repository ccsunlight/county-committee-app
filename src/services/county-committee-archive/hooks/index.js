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
  remove: [unArchive]
};

/**
 * This hook overrides the regular delete instead
 * calling the "unArchive" function which moves the collection
 * and the cc members collection back to the regular collections.
 *
 * @param      {<type>}  context  The context
 * @return     {<type>}  { description_of_the_return_value }
 */
function unArchive(context) {
  const apiPath = context.app.get("apiPath");
  return context.service.get(context.id).then(county_committee => {
    if (county_committee) {
      delete county_committee.__v;
    }
    return context.app
      .service(apiPath + "/county-committee")
      .unArchive(county_committee)
      .then(result => {
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
  all: [],
  find: [],
  get: [],
  create: [globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
