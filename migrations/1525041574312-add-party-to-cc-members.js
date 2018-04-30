"use strict";

const app = require("../src/app");
const CountyCommitteeMemberModel = require("../src/services/county-committee-member/county-committee-member-model");
const apiPath = app.get("apiPath");
/**
 * Goes through DB and marks any pre-existing records as
 * Democratic if they don't have a republican party.
 */
exports.up = function up(done) {
  CountyCommitteeMemberModel.update(
    {
      party: {
        $ne: "Democratic"
      }
    },
    {
      party: "Democratic"
    },
    { multi: true },
    function(result) {
      console.log("Updated members to Democratic Party", result);
      done();
    }
  );
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
