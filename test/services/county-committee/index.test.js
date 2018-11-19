"use strict";

const app = require("../../../src/app");

const assert = require("assert");
const CountyCommittee = require("../../../src/services/county-committee/county-committee-model");
const mongoose = require("mongoose");

describe("county-committee service", function() {
  this.timeout(5000);

  it("registered the county-committees service", () => {
    const service = app.service(app.get("apiPath") + "/county-committee");
    assert.ok(service);
  });

  it("can archive a county-committees", done => {
    const service = app.service(app.get("apiPath") + "/county-committee");

    // @todo make sure this cleans up gracefully.
    // If this fails, check that the object is in the DB
    //
    CountyCommittee.findOne({
      county: "Queens",
      party: "Democratic"
    }).then(function(county_committee) {
      //console.log(county_committee);

      assert(county_committee);
      //
      assert(county_committee.id);
      service.archive(county_committee).then(archived_county_committee => {
        assert(archived_county_committee._id === county_committee._id);

        const cc = CountyCommittee.findOne({ _id: county_committee.id }).then(
          cc => {
            assert(!cc);
            const CountyCommitteeArchive = mongoose.model(
              "county-committee-archive"
            );

            const archived_cc = CountyCommitteeArchive.findOne({
              _id: county_committee.id
            }).then(archivedCC => {
              assert(archivedCC);
              done();
            });
          }
        );
      });
    });
  });

  it("can un-archive a county-committees", done => {
    const service = app.service(app.get("apiPath") + "/county-committee");
    const CountyCommitteeArchive = mongoose.model("county-committee-archive");

    CountyCommitteeArchive.findOne({
      county: "Queens",
      party: "Democratic"
    }).then(function(archived_county_committee) {
      //console.log(county_committee);

      assert(archived_county_committee);
      //
      assert(archived_county_committee._id);

      service.unArchive(archived_county_committee).then(county_committee => {
        assert(archived_county_committee._id === county_committee._id);

        const cc = CountyCommitteeArchive.findOne({
          _id: county_committee._id
        }).then(cc => {
          assert(!cc);

          const archived_cc = CountyCommittee.findOne({
            _id: county_committee._id
          }).then(cc => {
            assert(cc);
            done();
          });
        });
      });
    });
  });

  it("can archive county-committee members", done => {
    const service = app.service(app.get("apiPath") + "/county-committee");
    const CountyCommitteeArchive = mongoose.model("county-committee-archive");

    CountyCommittee.findOne({
      county: "Queens",
      party: "Democratic"
    }).then(function(county_committee) {
      assert(county_committee);
      assert(county_committee._id);

      service
        .archiveCountyCommitteeMembers(county_committee._id)
        .then(writeOpResult => {
          assert(writeOpResult.deletedCount, 4590);
          done();
        });
    });
  });

  it("can unarchive county-committee members", done => {
    const service = app.service(app.get("apiPath") + "/county-committee");
    const CountyCommitteeArchive = mongoose.model("county-committee-archive");

    CountyCommittee.findOne({
      county: "Queens",
      party: "Democratic"
    }).then(function(county_committee) {
      assert(county_committee);
      assert(county_committee._id);

      service
        .unArchiveCountyCommitteeMembers(county_committee._id)
        .then(writeOpResult => {
          assert(county_committee._id === county_committee._id);
          done();
        });
    });
  });
});
