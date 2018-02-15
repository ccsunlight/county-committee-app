/**
 * * WIP - Not ready for use
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
const middleware = require('../src/middleware');
const services = require('../src/services');


const mongoose = require('mongoose');

const app = feathers();
app.set('mongodb', process.env.MONGODB_URL || "mongodb://" + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME);

app.configure(configuration(path.join(__dirname + '/../')));

mongoose.connect(app.get('mongodb'));

const countyCommitteeModel = require('../src/services/county-committee/county-committee-model');

var pdfFileName = process.argv[2];

importCCPDF(pdfFileName);


function importCCPDF(filename) {

    var ccExtractor = require(__dirname + '/src/services/county-committee/county-committee-extractor.js');

    var filepath = __dirname + '/import/' + filename;

    console.log('ATTEMPTING TO IMPORT: ' + filepath);

    ccExtractor.getCCMembersFromCertifiedListPDF(filepath, function(ccMembers) {

        let newPositions = [];
        importCCMembersRecursive(ccMembers, newPositions, function(newPositions) {
            console.log('done', newPositions.length);
            process.exit();
        })

    });


}


function importCCMembersRecursive(ccMembers, newPositions, callback) {

    let member = ccMembers.shift();

    if (member) {

        member.data_source = pdfFileName;

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