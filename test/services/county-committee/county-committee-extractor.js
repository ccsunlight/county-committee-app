var assert = require("assert");
const mongoose = require("mongoose");

describe("County Committee Extractor", function() {
  // Commenting this out so it doesn't DDOS the voting site.
  /* describe('find all CSVs', function() {
         var url = 'http://vote.nyc.ny.us/import/csv/election_results/2015/20150910Primary%20Election/01105670072New%20York%20Democratic%20County%20Committee%20072%2070%20EDLevel.csv';

         it('should get the CSV', function(done) {
             var url = 'http://vote.nyc.ny.us/import/csv/election_results/2015/20150910Primary%20Election/01105670072New%20York%20Democratic%20County%20Committee%20072%2070%20EDLevel.csv';

             this.timeout(10000);
             //assert.equal(-1, [1,2,3].indexOf(4));
             //
             ccExtractor.download(url, 'downloads/foo-test.csv', function() {

                 done();
             });

         });
     });


     describe('Get all files', function() { 
         it ('can get all the files', function(done) {
             ccExtractor.getAllCSVFilePaths(function(filepaths) {
                 //console.log(filepaths);
                 done()
             });
           
         });
     })

     describe('Extract County Committee Members from CSV', function() {
         it('open the CSV file and return the County Committee members with their vote tallies', function(done) {

             this.timeout(10000);
             //assert.equal(-1, [1,2,3].indexOf(4));
             console.log(__dirname);
             //var filepath = __dirname + '/../../../import/01105666008New%20York%20Democratic%20County%20Committee%20008%2066%20Recap.csv'
             var filepath = __dirname + '/../../../import/01105670014New%20York%20Democratic%20County%20Committee%20014%2070%20Recap.csv'
             ccExtractor.extractCountyCommitteeMembersFromCSV(filepath, function() {
                 done();
             });
         });
     });

   describe('Extract County Electoral and Assembly District from CSV', function() {
        it('open the CSV file and return the County Committee members with their vote tallies', function(done) {

            this.timeout(10000);
            //assert.equal(-1, [1,2,3].indexOf(4));
            //console.log(__dirname);
            //var filepath = __dirname + '/../../../import/01105666008New%20York%20Democratic%20County%20Committee%20008%2066%20Recap.csv'
            var filepath = __dirname + '/../../../import/01105670014New%20York%20Democratic%20County%20Committee%20014%2070%20Recap.csv'
            ccExtractor.getEDElectionResultsFromCSV(filepath, function(election_results) {
                assert.equal(14, election_results.electoral_district);
                assert.equal(70, election_results.assembly_district);
                assert.equal('New York', election_results.county)
                done();
            });
        });
    });
    */
  /*
    describe('CSV Extractor', function() {

        it('can extract the county committee members from a a csv', function(done) {
            //var Sails = require('sails').constructor;
            this.timeout(60000);

            const app = require('../../../src/app');

            const countyCommitteeModel = require('../../../src/services/county-committee/county-committee-model');

            // Load app to get access to ORM, services, etc (but don't lift an actual server onto a port)
            var ccExtractor = require('../../../src/services/county-committee/county-committee-extractor');

            var filepath = __dirname + '/../../../import/NYCCDemCertifiedListPreview.pdf';
            // var filepath = __dirname + '/../../../import/democratic_county_committee_ny.pdf';

            ccExtractor.getCCMembersFromCSV(filepath, function(ccMembers) {
                console.log('callback', ccMembers);

                let electedMemberCount = 0;
                let appointedMemberCount = 0;
                let invalidMemberRow = 0;

                memberCount = ccMembers.length;

                console.log('Total members extracted from CSV', memberCount);

                let appointedMembers = [];

                ccExtractor.getNonFoundMembersRecursive(ccMembers, appointedMembers, function(unfoundMembers) {
                    console.log('unfoundMembers', unfoundMembers.length);
                });


            });



        });
    });
    */
  /*
    describe('PDF Extractor', function() {

        it('can extract the county committee members from a party position certified list PDF', function(done) {
            //var Sails = require('sails').constructor;
             this.timeout(60000);
            // Load app to get access to ORM, services, etc (but don't lift an actual server onto a port)
            var sails = require('sails');

            sails.lift({

            }, function(err) {

                var ccExtractor = require('../../../api/services/county-committee-extractor');

                var filepath = __dirname + '/../../../import/2016QueensDemCoComm_people_elected.pdf';
                // var filepath = __dirname + '/../../../import/democratic_county_committee_ny.pdf';

                ccExtractor.getCCMembersFromCertifiedListPDF(filepath, function(ccMembers) {
                    console.log('callback', ccMembers);
                    ccMembers.forEach(function(member, index) {
                        //console.log('member', member);
                        if (member) {
                            member.data_source = filepath;
                            sails.models.countycommittee.create(member).then(function(member) {
                                console.log('imported record ', index);
                               if (index+1 == ccMembers.length) {
                                    done();
                               }
                            }).catch(function(err) {
                                console.error(err);
                            });
                        } else {
                            console.log('NO MEMBER :( ', member)
                        }
                    })



                });

            })
        });
    });
    */
  /*
    describe('CSV Extractor', function(done) {

        it('can get all the files', function() {

            ccExtractor.getAllCSVFilePaths(function(filepaths) {

                filepaths.forEach(function(filepath, index) {

                    ccExtractor.getEDElectionResultsFromCSV(filepath, function(election_results) {

                        if (election_results.county) {
                            console.log(election_results.county, '- AD:', election_results.assembly_district, '- ED:', election_results.electoral_district);

                            console.log(election_results.county_committee_member_winners.map(function(obj) {
                                return obj.name
                            }).join("\n"))
                            console.log("\n");
                            //election_results.county_committee_member_winners.map(function(obj) { return obj.name })
                        }
                        if (index == filepaths.length - 1) {
                            done();
                        }
                    });

                });

            });

        });

    })
    */
});
