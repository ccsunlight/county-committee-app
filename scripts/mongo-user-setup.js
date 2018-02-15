/**
 * JS to run in mongo shell to setup auth users
 * 
 */

const dotenv = require('dotenv').config()

db = db.getSiblingDB('admin');


// Creates the production mongo DB
// Admin user
db.createUser(
  {
    user: "sadmin",
    pwd: process.env.MONGO_SADMIN_PASS,
    roles: [ { role: "root", db: "admin" } ]
  })

db = db.getSiblingDB('county-committee');

// Creates the actual DB user
db.createUser({
            user: "cc_db_user",
            pwd: process.env.MONGO_USER,
            roles: [{
                role: "readWrite",
                db: "county-committee"
            }]});


