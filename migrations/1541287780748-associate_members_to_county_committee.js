"use strict";
/**
 * This migration takes all the CC members and associates them with
 * the corresponding county committee entity so that the county committees
 * can be managed from one place.
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
  CountyCommitteeModel.find({}, function(err, countyCommittees) {
    countyCommittees.forEach(async function(cc, i) {
      console.log(cc.county + " County", cc.party, cc.id);
      const members = await CountyCommitteeMemberModel.find({
        party: cc.party,
        county: cc.county + " County"
      });

      if (members.length > 0) {
        members.forEach(async function(member, j) {
          member.committee = cc.id;
          const savedMember = await member.save(function(err, member) {
            if (err) {
              console.log(err);
            } else {
              console.log(
                "Member associated with cc",
                cc.party,
                cc.county,
                "member.id:",
                member.id,
                "party.id:",
                cc.id
              );
            }
          });

          // When the last CC has members
          if (j === members.length - 1 && i === countyCommittees.length - 1) {
            console.log("CC member associate with CC migration complete.");
            done();
          }
        });
      } else {
        // When the last CC doesn't have members
        if (i === countyCommittees.length - 1) {
          console.log("CC member associate with CC migration complete.");
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
