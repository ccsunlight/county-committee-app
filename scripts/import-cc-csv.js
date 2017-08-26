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
const middleware = require('../src/middleware');
const services = require('../src/services');

const mongoose = require('mongoose');

const app = feathers();

app.configure(configuration(path.join(__dirname + '/../')));

mongoose.connect(app.get('mongodb'));
var ccExtractor = require('../src/services/county-committee/county-committee-extractor.js');

const countyCommitteeModel = require('../src/services/county-committee/county-committee-model');


var csvFileName = process.argv[2];
var filepath = __dirname + '/../import/' + csvFileName;
ccExtractor.getCCMembersFromCSV(filepath, function(members) {

    findMemberRecursive(members);

    // process.exit('done');
});

function findMemberRecursive(members) {

    var member = members.shift();

    countyCommitteeModel.find({
        electoral_district: member.electoral_district,
        assembly_district: member.assembly_district,
        office: member.office,
        office_holder: member.office_holder
    }, function(err, foundMembers) {

        // console.log('duh', foundMembers)
        if (err) return console.log(err);

        if (foundMembers.length == 0) {

            console.log('nobody', member);

            if (members.length > 0) {
                findMemberRecursive(members)
            } else {
                process.exit('bye')
            }

        } else {
            console.log('woo', foundMembers)
            foundMembers[0].office_holder = member.office_holder;
            foundMembers[0].part = member.part;
            foundMembers[0].source = member.source;
            foundMembers[0].entry_type = "Appointed"
            foundMembers[0].save(function(err, updatedTank) {
                if (err) return console.log(err);
                console.log('member saved', updatedTank)
                if (members.length > 0) {
                    findMemberRecursive(members)
                } else {
                    process.exit('bye')
                }
            });
            /*
             if (members.length > 0) {
                    findMemberRecursive(members)
                } else {
                    process.exit('bye')
                }
                */
        }





    })
}