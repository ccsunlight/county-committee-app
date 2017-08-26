/**
 * JS to run in mongo shell to setup auth users
 * 
 */

db = db.getSiblingDB('admin');

db.createUser(
  {
    user: "sadmin",
    pwd: "QbvAe#W3,%foo*Aj<",
    roles: [ { role: "root", db: "admin" } ]
  })

db = db.getSiblingDB('county-committee');

db.createUser({
            user: "cc_db_user",
            pwd: "P7usp){W[~a_g#Ep",
            roles: [{
                role: "readWrite",
                db: "county-committee"
            }]})

db.createUser({
            user: "dev_cc_db_user",
            pwd: "vNsxBfoo",
            roles: [{
                role: "readWrite",
                db: "county-committee"
            }]})

