'use strict';

const app = require('../src/app');
const apiPath = app.get('apiPath');
const generator = require('generate-password');

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {

    let counties = ["Albany", "Allegany", "Bronx", "Broome", "Cattaraugus", "Cayuga", "Chautauqua", "Chemung", "Chenango", "Clinton", "Columbia", "Cortland", "Delaware", "Dutchess", "Erie", "Essex", "Franklin", "Fulton", "Genesee", "Greene", "Hamilton", "Herkimer", "Jefferson", "Kings", "Lewis", "Livingston", "Madison", "Monroe", "Montgomery", "Nassau", "New York", "Niagara", "Oneida", "Onondaga", "Ontario", "Orange", "Orleans", "Oswego", "Otsego", "Putnam", "Queens", "Rensselaer", "Richmond", "Rockland", "Saint Lawrence", "Saratoga", "Schenectady", "Schoharie", "Schuyler", "Seneca", "Steuben", "Suffolk", "Sullivan", "Tioga", "Tompkins", "Ulster", "Warren", "Washington", "Wayne", "Westchester", "Wyoming", "Yates"];

    counties.forEach(function(county, i) {

        app.service(apiPath + '/county-committee').create({
            county: county,
            party: 'Democratic'
        }).then(county_committee => {

        }).catch(console.error);

        app.service(apiPath + '/county-committee').create({
            county: county, 
            party: 'Republican'
        }).then(county_committee => {

            if (i === counties.length-1) {
                console.log('Counties generated!')
            	done();
            }
        }).catch(console.error);

    });

};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
    done();
};