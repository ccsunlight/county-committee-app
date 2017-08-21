/**
 * Imports CC list PDF to DB. 
 *
 * @usage       node import-cc-pdf [filename
 * ]
 * @param      {string}  filename  The filename
 */
'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./src/middleware');
const services = require('./src/services');

const mongoose = require('mongoose');

const app = feathers();
app.configure(configuration(path.join(__dirname)));

mongoose.connect(app.get('mongodb'));

const countyCommitteeModel = require('./src/services/county-committee/county-committee-model');

var pdfFileName = process.argv[2];



let ed_ad_map = {}

countyCommitteeModel.find({ 'county': "Kings County"}).then(function(members) {

    for (let x =0; x <  members.length; x++) {
       // console.log( members[x]);

        if (!ed_ad_map[members[x].assembly_district + '_' + members[x].electoral_district]) {
            ed_ad_map[members[x].assembly_district + '_' + members[x].electoral_district] = 1;
        } else {
            ed_ad_map[members[x].assembly_district + '_' + members[x].electoral_district] ++;
        }
    }


    for (let y in ed_ad_map ) {

        if (ed_ad_map[y] % 2 != 0) {
            console.log('Odd number of seats: ',y, ed_ad_map[y]);
        }
    }

});


function checkCCMembersRecursive(ccMembers, newPositions, callback) {

    let member = ccMembers.shift();

    if (member) {

        var newMember = new countyCommitteeModel(member);

        newPositions.push(newMember);
        console.log('New member', newMember.assembly_district, newMember.electoral_district, newMember.office_holder);

        newMember.save(function(err, saved) {

            if (err) return console.error(err);

            if (ccMembers.length === 0) {
                callback(newPositions)
            } else {
                importCCMembersRecursive(ccMembers, newPositions, callback);
            }

        });



    } else {
        console.log('MEMBER ROW EMPTY', member);
        importCCMembersRecursive(ccMembers, newPositions, callback)
    }

}