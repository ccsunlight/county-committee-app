"use strict";

const service = require("feathers-mongoose");
const CountyCommittee = require("../county-committee/county-committee-model");
const CountyCommitteeMember = require("../county-committee-member/county-committee-member-model");

const hooks = require("./hooks");
const mongoose = require("mongoose");

module.exports = function() {
  const app = this;

  const countyCommitteeArchiveSchema = CountyCommittee.schema.clone();

  countyCommitteeArchiveSchema.virtual("members", {
    ref: "county-committee-member-archive", // The model to use
    localField: "_id", // Find people where `localField`
    foreignField: "committee", // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
  });

  const CountyCommitteeArchive = mongoose.model("county-committee-archive");

  const countyCommitteeMemberArchiveSchema = CountyCommitteeMember.schema.clone();

  const CountyCommitteeMemberArchive = mongoose.model(
    "county-committee-member-archive"
  );

  const options = {
    Model: CountyCommitteeArchive,
    paginate: {
      default: 10,
      max: 25
    }
  };
  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/county-committee-archive", service(options));

  // Get our initialize service to that we can bind hooks
  const countyCommitteeArchiveService = app.service(
    app.get("apiPath") + "/county-committee-archive"
  );

  // Set up our before hooks
  countyCommitteeArchiveService.before(hooks.before);

  // Set up our after hooks
  countyCommitteeArchiveService.after(hooks.after);
};
