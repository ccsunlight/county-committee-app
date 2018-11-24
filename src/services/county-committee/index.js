"use strict";

const service = require("feathers-mongoose");
const CountyCommittee = require("./county-committee-model");
const CountyCommitteeMember = require("../county-committee-member/county-committee-member-model");

const hooks = require("./hooks");
const mongoose = require("mongoose");

module.exports = function() {
  const app = this;

  const options = {
    Model: CountyCommittee,
    paginate: {
      default: 10,
      max: 25
    },
    lean: false
  };

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

  const CountyCommitteeArchive = mongoose.model(
    "county-committee-archive",
    countyCommitteeArchiveSchema
  );

  const countyCommitteeMemberArchiveSchema = CountyCommitteeMember.schema.clone();

  const CountyCommitteeMemberArchive = mongoose.model(
    "county-committee-member-archive",
    countyCommitteeMemberArchiveSchema
  );

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/county-committee", service(options));

  // Get our initialize service to that we can bind hooks
  const countyCommitteeService = app.service(
    app.get("apiPath") + "/county-committee"
  );

  countyCommitteeService.archiveCountyCommitteeMembers = function(
    committee_id
  ) {
    return new Promise((resolve, reject) => {
      CountyCommitteeMember.find({ committee: committee_id }).then(
        membersToArchive => {
          CountyCommitteeMemberArchive.insertMany(
            membersToArchive,
            (err, result) => {
              if (!err) {
                CountyCommitteeMember.deleteMany(
                  { committee: committee_id },
                  function(err, writeOpResult) {
                    if (!err) {
                      resolve(writeOpResult);
                    } else {
                      reject(err);
                    }
                  }
                );
              } else {
                reject(err);
              }
            }
          );
        }
      );
    });
  };

  countyCommitteeService.unArchiveCountyCommitteeMembers = function(
    committee_id
  ) {
    return new Promise((resolve, reject) => {
      CountyCommitteeMemberArchive.find({ committee: committee_id }).then(
        membersToUnArchive => {
          CountyCommitteeMember.insertMany(
            membersToUnArchive,
            (err, result) => {
              if (!err) {
                CountyCommitteeMemberArchive.deleteMany(
                  { committee: committee_id },
                  function(err, writeOpResult) {
                    if (!err) {
                      resolve(writeOpResult);
                    } else {
                      reject(err);
                    }
                  }
                );
              } else {
                reject(err);
              }
            }
          );
        }
      );
    });
  };

  /**
   * Archives a county committee and corresponding county committee members moving them
   * to an archive collection.
   *
   * @param      {<type>}   committee  The committee
   * @return     {Promise}  { description_of_the_return_value }
   */
  countyCommitteeService.archive = function(committee) {
    return new Promise((resolve, reject) => {
      CountyCommittee.findOne({ _id: committee._id }).then(
        committeeToArchive => {
          CountyCommitteeArchive.update(
            { _id: committee._id },
            committee,
            { upsert: true },
            (err, result) => {
              if (!err) {
                CountyCommittee.deleteOne({ _id: committee._id }, err => {
                  if (!err) {
                    this.archiveCountyCommitteeMembers(committee._id).then(
                      result => {
                        resolve(committee);
                      }
                    );
                  } else {
                    reject(err);
                  }
                });
              } else {
                reject(err);
              }
            }
          );
        }
      );
    });
  };

  /**
   * Unarchives a county committee and corresponding county committee members moving them
   * to an archive collection.
   *
   * @param      {<type>}   committee  The committee
   * @return     {Promise}  { description_of_the_return_value }
   */
  countyCommitteeService.unArchive = function(committee) {
    return new Promise((resolve, reject) => {
      CountyCommitteeArchive.findOne({ _id: committee._id }).then(
        committeeToUnArchive => {
          CountyCommittee.update(
            { _id: committee._id },
            committee,
            { upsert: true },
            (err, result) => {
              if (!err) {
                CountyCommitteeArchive.deleteOne(
                  { _id: committee._id },
                  err => {
                    if (!err) {
                      this.unArchiveCountyCommitteeMembers(committee._id).then(
                        result => {
                          resolve(committee);
                        }
                      );
                    } else {
                      reject(err);
                    }
                  }
                );
              } else {
                reject(err);
              }
            }
          );
        }
      );
    });
  };

  // Set up our before hooks
  countyCommitteeService.before(hooks.before);

  // Set up our after hooks
  countyCommitteeService.after(hooks.after);
};
