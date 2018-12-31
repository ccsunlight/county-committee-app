"use strict";
/**
 * Removes the word "County" from the county prop
 *
 * @type       {Function}
 */

const app = require("../src/app");
const CountyCommitteeMemberModel = require("../src/services/county-committee-member/county-committee-member-model");
const CountyCommitteeModel = require("../src/services/county-committee/county-committee-model");
const apiPath = app.get("apiPath");

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {
  console.log("Removing word 'County' from cc member county field");
  const members = CountyCommitteeMemberModel.find({}).then(members => {
    members.forEach(async function(member, index) {
      if (member.county) {
        member.county = member.county.replace(" County", "");

        const err = await member.save();

        if (err) {
          console.error(err);
        } else {
          console.log("Updated: ", member.id, member.county);
        }

        if (index === members.length - 1) {
          done();
        }
      }
    });
  });
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
