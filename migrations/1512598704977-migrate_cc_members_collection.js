'use strict';

const app = require('../src/app');
const apiPath = app.get('apiPath');
const generator = require('generate-password');
     

// Changing the name of "county-committees" to "county-committee-members".
// County committees should be moved to "county-committees"

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {

	const mongoose   = require('mongoose');
	console.log('connect', app.get('mongodb'));

	  // Access the underlying database object provided by the MongoDB driver.
	  let db = mongoose.connection.db;
	  
	  if (db.collection('county-committees')) {
	  	 db.collection('county-committees').rename('county-committee-members');
	  	 done();
	  } else {
	  	 "Collection already renamed";
	  	 done();
	  }


 
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
