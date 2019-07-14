"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const mongoose = require("mongoose");
const CountyCommitteeModel = require("../../../src/services/county-committee/county-committee-model");
const CountyCommitteeMemberModel = require("../../../src/services/county-committee-member/county-committee-member-model");
const TermModel = require("../../../src/services/term/term-model");
const moment = require("moment");
const path = require("path");

const MOCK_CSV_FILE_PATH = path.resolve(
  __dirname,
  "mocks/",
  "mock-queens-appointed-cc-members-sept-2018.csv"
);
const MOCK_CSV_FILE_PATH_WITH_ERRORS = path.resolve(
  __dirname,
  "mocks/",
  "mock-queens-appointed-cc-members-sept-2018-with-errors.csv"
);
const MOCK_CERTIFIED_LIST_FILE_PATH = path.resolve(
  __dirname,
  "mocks/",
  "MOCK_QNS_CCDEMLIST_92018.pdf"
);
describe("Import List Service", function() {
  this.timeout(10000);

  const cleanupDBDocs = [];
  let ccService, ccMemberService;
  let mock_term, mock_county_committee, mock_county_committee_member;

  /**
   * Sets up the database
   */
  beforeEach(function(done) {
    ccService = app.service(app.get("apiPath") + "/county-committee");
    ccMemberService = app.service(
      app.get("apiPath") + "/county-committee-member"
    );
    ccService
      .create({
        chairman: "George Washington",
        county: "Test",
        state: "NY",
        address: "1 Test Street",
        phone: "212-123-4567",
        party: "Democratic"
      })
      .then(county_committee => {
        let term = new TermModel({
          start_date: moment(),
          end_date: moment().add(2, "Years"),
          committee_id: county_committee._id
        });

        mock_county_committee = county_committee;
        cleanupDBDocs.push(county_committee);
        term.save(function(err) {
          mock_term = term;
          cleanupDBDocs.push(term);
          done();
        });
      });
  });

  /**
   * Cleans up the DB after each test.
   */
  afterEach(function(done) {
    for (let x = 0; x < cleanupDBDocs.length; x++) {
      cleanupDBDocs[x].remove();
    }
    done();
  });

  it("registered the import-list service", () => {
    assert.ok(app.service(app.get("apiPath") + "/import-list"));
  });

  it("can read a import list formatted csv", done => {
    const ImportListService = app.service(app.get("apiPath") + "/import-list");

    ImportListService.create({
      filepath: MOCK_CSV_FILE_PATH,
      term_id: mock_term._id
    })
      .then(importedList => {
        assert.ok(importedList);
        assert.equal(
          importedList.source,
          "mock-queens-appointed-cc-members-sept-2018.csv"
        );
        assert(Array.isArray(importedList.members));
        // assert.deepEqual(appointedList.committee_id, mock_county_committee._id);
        assert.deepEqual(importedList.term_id, mock_term._id);
        assert.equal(importedList.members.length, 834);
        assert.equal(importedList.members[0].party, "Democratic");
        assert.equal(importedList.members[0].office, "Female County Committee");

        cleanupDBDocs.push(importedList);
        done();
      })
      .catch(e => {
        console.log(e);
        assert(!e);
      });
  });

  it("will reject an import with invalid records", done => {
    let filepath = MOCK_CSV_FILE_PATH_WITH_ERRORS;
    const ImportListService = app.service(app.get("apiPath") + "/import-list");

    ImportListService.create({
      filepath: filepath,
      term_id: mock_term._id
    })
      .then(importedList => {})
      .catch(e => {
        assert(e);
        assert.equal(e.name, "ValidationError");
        done();
      });
  });

  it("can migrate an imported list to a term's CC members", done => {
    const ImportListService = app.service(app.get("apiPath") + "/import-list");
    const CertifiedListService = app.service(
      app.get("apiPath") + "/certified-list"
    );

    const TermService = app.service(app.get("apiPath") + "/term");

    // Then appoints members to vacancies
    ImportListService.create({
      filepath: MOCK_CSV_FILE_PATH,
      term_id: mock_term._id
    }).then(importedList => {
      cleanupDBDocs.push(importedList);

      ImportListService.importMembersToTerm(importedList, mock_term, {
        bulkFields: { entry_type: "Appointed" },
        upsert: true
      })
        .then(memberImportResults => {
          cleanupDBDocs.concat(memberImportResults);

          // console.log(memberImportResults.nModified);
          assert(memberImportResults.hasOwnProperty("modifiedResults"));
          assert(memberImportResults.hasOwnProperty("insertedResults"));
          assert(memberImportResults.hasOwnProperty("notMatchedResults"));
          assert(memberImportResults.hasOwnProperty("nInserted"));
          assert(memberImportResults.hasOwnProperty("nModified"));
          assert(memberImportResults.hasOwnProperty("nNotMatched"));
          assert(memberImportResults.hasOwnProperty("n"));
          assert.equal(
            memberImportResults.nInserted,
            importedList.members.length
          );

          CountyCommitteeMemberModel.find({
            term_id: mock_term._id,
            entry_type: "Appointed"
          }).then(function(members) {
            assert.equal(members.length, importedList.members.length);
            done();
          });
        })
        .catch(e => {
          console.log(e);
          done();
        });
    });
  });
});
