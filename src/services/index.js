'use strict';
const invite = require('./invite');
const edGeometry = require('./edGeometry');
const countyCommitteeMember = require('./county-committee-member');
const countyCommittee = require('./county-committee');
const actionLog = require('./action-log');
const glossaryTerm = require('./glossary-term');
const newsLink = require('./news-link');
//const authentication = require('./authentication');
const user = require('./user');
const page = require('./page');
const mongoose = require('mongoose');

module.exports = function() {
 const app = this;

 mongoose.connect(app.get('mongodb'));
 mongoose.Promise = global.Promise;

 // app.configure(authentication);
 app.configure(user);
 app.configure(page);
 app.configure(countyCommitteeMember);
 app.configure(countyCommittee);
 app.configure(edGeometry);
 app.configure(invite);
 app.configure(actionLog);
 app.configure(glossaryTerm);
 app.configure(newsLink);

 // Workaroud for docs paths
 // https://github.com/feathersjs-ecosystem/feathers-swagger/issues/54
 delete app.docs.paths['/api/v1/user'];
 delete app.docs.paths['/api/v1/user/{_id}'];
 delete app.docs.paths['/api/v1/invite'];
 delete app.docs.paths['/api/v1/invite/{_id}'];
 delete app.docs.paths['/api/v1/action-log'];
 delete app.docs.paths['/api/v1/action-log/{_id}'];
 delete app.docs.paths['/api/v1/profile'];
 delete app.docs.paths['/api/v1/profile/{_id}'];

};


