"use strict";

const app = require("../src/app");
const CountyCommitteeMemberModel = require("../src/services/county-committee-member/county-committee-member-model");
const apiPath = app.get("apiPath");

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {
  CountyCommitteeMemberModel.update(
    {
      party: "Democratic",
      $and: [
        {
          $or: [
            { county: "Kings County" },
            { county: "Queens County" },
            { county: "Bronx County" }
          ]
        }
      ]
    },
    {
      term_begins: new Date("September 13, 2016"),
      term_ends: new Date("September 12, 2018")
    },
    { multi: true },
    function(result) {
      console.log(
        "Added terms to  Bronx, Queens and Kings, Dem CC Members",
        result
      );

      CountyCommitteeMemberModel.update(
        {
          $or: [
            {
              party: "Democratic",
              $and: [
                {
                  $or: [
                    { county: "New York County" },
                    { county: "Richmond County" }
                  ]
                }
              ]
            },
            {
              party: "Republican",
              $and: [
                {
                  $or: [
                    { county: "Kings County" },
                    { county: "Queens County" },
                    { county: "Bronx County" },
                    { county: "Richmond County" },
                    { county: "New York County" }
                  ]
                }
              ]
            }
          ]
        },
        {
          term_begins: new Date("September 12, 2017"),
          term_ends: new Date("September 12, 2019")
        },
        { multi: true },
        function(result) {
          console.log(
            "Added terms to CC Members to New York & Richmond Dems, Republicans for all 5 boroughs",
            result
          );
          done();
        }
      );
    }
  );
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
