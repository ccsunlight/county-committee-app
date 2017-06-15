'use strict';
const edGeometry = require('./edGeometry');
const countyCommittee = require('./county-committee');
const authentication = require('./authentication');
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
 app.configure(countyCommittee);
 app.configure(edGeometry);
};
