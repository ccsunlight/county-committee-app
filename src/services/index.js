"use strict";

const certifiedList = require("./certified-list");
const partyCall = require("./party-call");

const utils = require("./utils");
const invite = require("./invite");
const edGeometry = require("./edGeometry");
const countyCommitteeMember = require("./county-committee-member");
const countyCommittee = require("./county-committee");
const countyCommitteeArchive = require("./county-committee-archive");
const actionLog = require("./action-log");
const glossaryTerm = require("./glossary-term");
const newsLink = require("./news-link");
const authentication = require("./authentication");
const user = require("./user");
const page = require("./page");
const address = require("./address");
const term = require("./term");
const enrollment = require("./enrollment");

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
  app.configure(countyCommitteeMember);
  app.configure(countyCommittee);
  // app.configure(countyCommitteeArchive);
  app.configure(edGeometry);
  app.configure(invite);
  app.configure(actionLog);
  app.configure(glossaryTerm);
  app.configure(newsLink);
  app.configure(address);
  app.configure(certifiedList);
  app.configure(partyCall);
  app.configure(term);
  app.configure(utils);

  address.docs = {
    description: "A service to send and receive messages",
    definitions: {
      messages: {
        type: "object",
        required: ["text"],
        properties: {
          text: {
            type: "string",
            description: "The message text"
          },
          useId: {
            type: "string",
            description: "The id of the user that sent the message"
          }
        }
      }
    }
  };

  //
  // Workaroud for disabling docs paths for admin entities.
  // https://github.com/feathersjs-ecosystem/feathers-swagger/issues/54
  // @todo handle this more gracefully.
  //
  delete app.docs.paths[apiPath + "/user"];
  delete app.docs.paths[apiPath + "/user/{_id}"];
  delete app.docs.paths[apiPath + "/invite"];
  delete app.docs.paths[apiPath + "/invite/{_id}"];
  delete app.docs.paths[apiPath + "/action-log"];
  delete app.docs.paths[apiPath + "/action-log/{_id}"];
  delete app.docs.paths[apiPath + "/profile"];
  delete app.docs.paths[apiPath + "/profile/{_id}"];
  delete app.docs.paths[apiPath + "/certified-list"];
  delete app.docs.paths[apiPath + "/certified-list/{_id}"];
  delete app.docs.paths[apiPath + "/party-call"];
  delete app.docs.paths[apiPath + "/party-call/{_id}"];
  delete app.docs.paths[apiPath + "/term"];
  delete app.docs.paths[apiPath + "/term/{_id}"];
};
