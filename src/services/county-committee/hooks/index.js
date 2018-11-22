"use strict";

const globalHooks = require("../../../hooks");
const hooks = require("feathers-hooks");
const slugify = require("slugify");
const os = require("os");
const fs = require("fs");

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

function savePartyCall(context) {
  const PartyCallService = context.app.service(
    context.app.get("apiPath") + "/party-call"
  );

  let party_call_upload;
  if (
    context.data.hasOwnProperty("party_call_upload") &&
    ontext.data.party_call_uploads.length > 0
  ) {
    party_call_upload = context.data.party_call_uploads[0];

    const tempFileFullPath = os.tmpdir() + "/" + party_call_upload.title;
    // Extracts the base64 data
    // @todo handle this cleaner
    var utf8encoded = Buffer.from(
      party_call_upload.src.split(",")[1],
      "base64"
    ).toString("utf8");

    fs.writeFileSync(tempFileFullPath, utf8encoded);

    const options = {
      filepath: tempFileFullPath,
      county: context.data.county,
      party: context.data.party
    };

    return PartyCallService.create(options)
      .then(partyCall => {
        return context;
      })
      .catch(err => {
        console.log(err);
      });
  }
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
  get: [
    function(hook) {
      if (hook.result) {
        hook.result.id = hook.result._id;
      }
    }
  ],
  create: [savePartyCall, globalHooks.logAction],
  update: [globalHooks.logAction],
  patch: [globalHooks.logAction],
  remove: [globalHooks.logAction]
};
