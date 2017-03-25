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

importCCPDF(pdfFileName);

function importCCPDF(filename) {

    var ccExtractor = require(__dirname + '/src/services/county-committee/county-committee-extractor.js');

    var filepath = __dirname + '/import/' + filename;
    //  var filepath = __dirname + '/../../../import/2016QueensDemCoComm_people_elected.pdf';
    // var filepath = __dirname + '/../../../import/democratic_county_committee_ny.pdf';

    console.log('ATTEMPTING TO IMPORT: ' + filepath);

    ccExtractor.getCCMembersFromCertifiedListPDF(filepath, function(ccMembers) {
        const countyCommitteeModel = mongoose.model('county-committee');

        ccMembers.forEach(function(member, index) {

            if (member) {
                console.log('MEMBER YA', member);
                member.data_source = filepath;

                countyCommitteeModel.find(member, function(err, foundMembers) {
                    if (err) return console.error(err);

                    if (foundMembers.length == 0) {
                        var newMember = new countyCommitteeModel(member);

                        console.log(newMember);
                        newMember.save(function(err, saved) {
                            if (err) return console.error(err);

                            if (index + 1 == ccMembers.length) {
                                // console.log();
                                process.exit('### IMPORT COMPLETED ###')
                                    //return;
                            }
                            
                        });
                    } else {
                        if (index + 1 == ccMembers.length) {
                            // console.log();
                            process.exit('### IMPORT COMPLETED ###')
                                //return;
                        }
                    }

                })


            } else {
                console.log('MEMBER ROW EMPTY', index, member)
            }
        })



    });


}