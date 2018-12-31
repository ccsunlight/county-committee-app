"use strict";

const app = require("../../../src/app");

const assert = require("assert");
const CountyCommittee = require("../../../src/services/county-committee/county-committee-model");
const ccMock = require("../../mocks/county-committee.mock.json");
const ccMemberMock = require("../../mocks/county-committee-member.mock.json");
const ccPostRequestJsonMock = require("../../mocks/county-committee-post-request.mock.json");

const Term = require("../../../src/services/term/term-model");
const hooks = require("../../../src/services/county-committee/hooks");
const mongoose = require("mongoose");
const moment = require("moment");

describe("county-committee service", function() {
  this.timeout(5000);

  let ccService, ccMemberService;
  let termService = app.service(app.get("apiPath") + "/term");

  let mock_county_committee, mock_term, mock_county_committee_member;

  /**
   * Sets up the database
   */
  beforeEach(function(done) {
    ccService = app.service(app.get("apiPath") + "/county-committee");
    ccMemberService = app.service(
      app.get("apiPath") + "/county-committee-member"
    );
    ccService.create(ccMock).then(county_committee => {
      let term = new Term({
        start_date: moment(),
        end_date: moment().add(2, "Years"),
        committee_id: county_committee._id
      });
      mock_county_committee = county_committee;

      term.save(function(err) {
        mock_term = term;

        ccMemberService
          .create({
            committee: mock_county_committee._id,
            ...ccMemberMock
          })
          .then(function(member) {
            mock_county_committee_member = member;
            done();
          });
      });
    });
  });

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    mock_county_committee.remove();
    mock_county_committee_member.remove();
    mock_term.remove();

    done();
  });

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    mock_county_committee.remove();
    mock_county_committee_member.remove();
    mock_term.remove();

    done();
  });

  it("registered the county-committees service", () => {
    assert.ok(ccService);
  });

  it("can create a county-committee with a term", done => {
    ccService.create(ccMock).then(county_committee => {
      let term = new Term({
        start_date: moment(),
        end_date: moment().add(2, "Years"),
        committee_id: county_committee._id
      });

      term.save(function(err) {
        assert.equal(county_committee.chairman, "Benjamin Franklin");
        assert(county_committee.id);

        termService
          .find({
            query: {
              committee_id: county_committee.id
            }
          })
          .then(response => {
            assert(response);
            assert(response.data);

            assert(
              response.data.length === 1,
              "There are no duplicate associations."
            );
            assert.deepEqual(
              response.data[0].committee_id,
              county_committee._id
            );
            term.remove();
            county_committee.remove();
            done();
          });
      });
    });
  });

  // describe("archiving", function() {
  //   it("can archive a county-committees", done => {
  //     assert(mock_county_committee);
  //     assert(mock_county_committee.id);

  //     ccService
  //       .archive(mock_county_committee)
  //       .then(archived_county_committee => {
  //         assert(archived_county_committee._id === mock_county_committee._id);

  //         const cc = CountyCommittee.findOne({
  //           _id: mock_county_committee._id
  //         }).then(cc => {
  //           assert(!cc);

  //           const CountyCommitteeArchive = mongoose.model(
  //             "county-committee-archive"
  //           );

  //           CountyCommitteeArchive.findOne({
  //             _id: mongoose.Types.ObjectId(mock_county_committee.id)
  //           }).then(archived_cc => {
  //             assert.deepEqual(archived_cc._id, mock_county_committee._id);

  //             // Cleanup
  //             done();
  //           });
  //         });
  //       });
  //   });
  //   it("can un-archive a county-committees", done => {
  //     const CountyCommitteeArchive = mongoose.model("county-committee-archive");

  //     ccService.unArchive(mock_county_committee).then(county_committee => {
  //       assert(mock_county_committee._id === county_committee._id);

  //       const cc = CountyCommitteeArchive.findOne({
  //         _id: county_committee._id
  //       }).then(cc => {
  //         assert(!cc);

  //         const archived_cc = CountyCommittee.findOne({
  //           _id: county_committee._id
  //         }).then(unarchived_cc => {
  //           assert.deepEqual(unarchived_cc._id, mock_county_committee._id);
  //           done();
  //         });
  //       });
  //     });
  //   });

  //   it("can archive county-committee members", done => {
  //     const CountyCommitteeArchive = mongoose.model("county-committee-archive");
  //     ccService.archive(mock_county_committee).then(function(county_committee) {
  //       assert(county_committee);
  //       assert(county_committee._id);
  //       debugger;
  //       ccService
  //         .archiveCountyCommitteeMembers(county_committee)
  //         .then(writeOpResult => {
  //           assert(writeOpResult.deletedCount, 4590);
  //           done();
  //         });
  //     });
  //   });

  //   it("can unarchive county-committee members", done => {
  //     const ccService = app.service(app.get("apiPath") + "/county-committee");
  //     const CountyCommitteeArchive = mongoose.model("county-committee-archive");

  //     ccService
  //       .unArchiveCountyCommitteeMembers(mock_county_committee._id)
  //       .then(writeOpResult => {
  //         assert(county_committee._id === mock_county_committee._id);
  //         done();
  //       });
  //   });

  //   after(function(done) {
  //     const CountyCommitteeArchive = mongoose.model("county-committee-archive");
  //     CountyCommitteeArchive.findOne({ _id: mock_county_committee._id }).then(
  //       function(archived_county_committee) {
  //         if (archived_county_committee) {
  //           console.log(
  //             "Looks like something didn't get cleaned up quite right. Deleting test archive data."
  //           );
  //           archived_county_committee.remove();
  //         }
  //       }
  //     );
  //   });
  // });
});
