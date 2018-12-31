"use strict";

const app = require("../src/app");
const CountyCommitteeMemberModel = require("../src/services/county-committee-member/county-committee-member-model");
const CountyCommitteeModel = require("../src/services/county-committee/county-committee-model");
const TermModel = require("../src/services/term/term-model");
const apiPath = app.get("apiPath");
const moment = require("moment");

const termMigrationMap = [
  {
    county: "Kings",
    party: "Democratic",
    start_date: new Date("September 13, 2016 00:00:00"),
    end_date: new Date("September 12, 2018 00:00:00")
  },
  {
    county: "Queens",
    party: "Democratic",
    start_date: new Date("September 13, 2016 00:00:00"),
    end_date: new Date("September 12, 2018 00:00:00")
  },
  {
    county: "Bronx",
    party: "Democratic",
    start_date: new Date("September 13, 2016 00:00:00"),
    end_date: new Date("September 12, 2018 00:00:00")
  },
  {
    county: "New York",
    party: "Democratic",
    start_date: new Date("September 12, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  },
  {
    county: "Richmond",
    party: "Democratic",
    start_date: new Date("September 13, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  },
  {
    county: "Kings",
    party: "Republican",
    start_date: new Date("September 13, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  },
  {
    county: "Queens",
    party: "Republican",
    start_date: new Date("September 13, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  },
  {
    county: "Bronx",
    party: "Republican",
    start_date: new Date("September 13, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  },
  {
    county: "New York",
    party: "Republican",
    start_date: new Date("September 13, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  },
  {
    county: "Richmond",
    party: "Republican",
    start_date: new Date("September 13, 2017 00:00:00"),
    end_date: new Date("September 13, 2019 00:00:00")
  }
];

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {
  termMigrationMap.forEach(function(termMigration, index) {
    CountyCommitteeModel.findOne(
      { county: termMigration.county, party: termMigration.party },
      async function(err, committee) {
        // if (err || !committee) {
        //   throw new Error('Migration failed!', termMigration.county, termMigration.party, err);
        // }

        // Creates new term and assigns to committee
        const term = await TermModel.create({
          start_date: termMigration.start_date,
          end_date: termMigration.end_date,
          committee_id: committee._id
        });

        committee.current_term_id = term._id;
        await committee.save();

        // Finds all members for the committee
        const members = await CountyCommitteeMemberModel.find({
          committee: committee._id
        });

        // Assigns members to term
        members.forEach(async function(member, x) {
          member.term_id = term._id;
          await member.save();

          if (
            x === members.length - 1 &&
            index === termMigrationMap.length - 1
          ) {
            console.log("Migration complete");
            done();
          }
        });
      }
    );
  });
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
