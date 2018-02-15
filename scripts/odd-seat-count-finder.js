/**
 *
 * 
 * Finds districts that have an odd number of seats
 * An odd number of seats could mean that there 
 * is an error with the data
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

const countyCommitteeModel = require('../src/services/county-committee/county-committee-model');

let ed_ad_map = {}

countyCommitteeModel.find({ }).then(function(members) {
    console.log('hello');
    for (let x =0; x <  members.length; x++) {
        console.log( members[x]);

        if (!ed_ad_map[members[x].assembly_district + '_' + members[x].electoral_district]) {
            ed_ad_map[members[x].assembly_district + '_' + members[x].electoral_district] = 1;
        } else {
            ed_ad_map[members[x].assembly_district + '_' + members[x].electoral_district] ++;
        }
    }

    console.log('\n\n')
    console.log('####################################################');
    console.log('# Election Districts with an Odd Number of Seats   #');
    console.log('####################################################');
    console.log('\n\n')

    for (let y in ed_ad_map ) {

        if (ed_ad_map[y] % 2 != 0) {
            console.log('AD:', y.split('_')[0],'ED:', y.split('_')[1], 'Seat Count:', ed_ad_map[y] + '\n');
        }
    }

    process.exit('Done.');

});

