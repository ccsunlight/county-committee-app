"use strict";

const certifiedList = require("./certified-list");
const candidacyList = require("./candidacy-list");
const partyCall = require("./party-call");

const utils = require("./utils");
const invite = require("./invite");
const edGeometry = require("./edGeometry");
const countyCommitteeMember = require("./county-committee-member");
const countyCommittee = require("./county-committee");
const actionLog = require("./action-log");
const glossaryTerm = require("./glossary-term");
const newsLink = require("./news-link");
const authentication = require("./authentication");
const user = require("./user");
const page = require("./page");
const block = require("./block");
const address = require("./address");
const term = require("./term");
const enrollment = require("./enrollment");
const importList = require("./import-list");
const boeElectionResults = require("./boe-election-results");

const mongoose = require("mongoose");

// Mongoose promise lib is deprecated.
mongoose.Promise = global.Promise;

module.exports = function() {
  const app = this;
  const apiPath = app.get("apiPath");

  const options = {
    useMongoClient: true
  };
  mongoose.connection.close();
  mongoose.connect(app.get("mongodb"), options);
  // app.configure(authentication);

  app.configure(user);
  app.configure(page);
  app.configure(block);
  app.configure(countyCommitteeMember);
  app.configure(countyCommittee);
  app.configure(boeElectionResults);
  app.configure(edGeometry);
  app.configure(invite);
  app.configure(actionLog);
  app.configure(glossaryTerm);
  app.configure(newsLink);
  app.configure(candidacyList);
  app.configure(certifiedList);
  app.configure(partyCall);
  app.configure(term);
  app.configure(utils);
  app.configure(importList);
  app.configure(address);
  app.configure(enrollment);

  //
  // Workaroud for disabling docs paths for admin entities.
  // https://github.com/feathersjs-ecosystem/feathers-swagger/issues/54
  // @todo handle this more gracefully.
  //
};
