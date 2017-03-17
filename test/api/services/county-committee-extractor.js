var assert = require('assert');

describe('County Committee Extractor', function() {
    console.log('hello')

    var countCommitteeExtractor = require('../../../api/services/county-committee-extractor');
    //http://vote.nyc.ny.us/html/results/2016.shtml
    // http://vote.nyc.ny.us/html/results/2016.shtml
   /* describe('find all CSVs', function() {
        var url = 'http://vote.nyc.ny.us/downloads/csv/election_results/2015/20150910Primary%20Election/01105670072New%20York%20Democratic%20County%20Committee%20072%2070%20EDLevel.csv';

        it('should get the CSV', function(done) {
            var url = 'http://vote.nyc.ny.us/downloads/csv/election_results/2015/20150910Primary%20Election/01105670072New%20York%20Democratic%20County%20Committee%20072%2070%20EDLevel.csv';

            this.timeout(10000);
            //assert.equal(-1, [1,2,3].indexOf(4));
            //
            countCommitteeExtractor.download(url, 'downloads/foo-test.csv', function() {

                done();
            });

        });
    });

    */
   /*
    describe('Get all files', function() { 
        console.log('hell');
        it ('can get all the files', function(done) {
            countCommitteeExtractor.getAllCSVFilePaths(function(filepaths) {
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
            //var filepath = __dirname + '/../../../downloads/01105666008New%20York%20Democratic%20County%20Committee%20008%2066%20Recap.csv'
            var filepath = __dirname + '/../../../downloads/01105670014New%20York%20Democratic%20County%20Committee%20014%2070%20Recap.csv'
            countCommitteeExtractor.extractCountyCommitteeMembersFromCSV(filepath, function() {
                done();
            });
        });
    });
    */
    /*
   describe('Extract County Electoral and Assembly District from CSV', function() {
        it('open the CSV file and return the County Committee members with their vote tallies', function(done) {

            this.timeout(10000);
            //assert.equal(-1, [1,2,3].indexOf(4));
            //console.log(__dirname);
            //var filepath = __dirname + '/../../../downloads/01105666008New%20York%20Democratic%20County%20Committee%20008%2066%20Recap.csv'
            var filepath = __dirname + '/../../../downloads/01105670014New%20York%20Democratic%20County%20Committee%20014%2070%20Recap.csv'
            countCommitteeExtractor.getEDElectionResultsFromCSV(filepath, function(election_results) {
                assert.equal(14, election_results.electoral_district);
                assert.equal(70, election_results.assembly_district);
                assert.equal('New York', election_results.county)
                done();
            });
        });
    });
    */

     describe('PDF Extractor', function(done) {
           var Sails = require('sails').Sails;

// Load app to get access to ORM, services, etc (but don't lift an actual server onto a port)
            var app = Sails();
            console.log(app);
        it('can extract the county committee members from a party position certified list PDF', function(done) {
             this.timeout(60000);
            var filepath = __dirname + '/../../../downloads/2016QueensDemCoComm_people_elected.pdf';
           // var filepath = __dirname + '/../../../downloads/democratic_county_committee_ny.pdf';
            countCommitteeExtractor.getCountyCommitteeMembersFromCertifiedListPDF(filepath, function(ccMembers) {

                app.load({
                  hooks: { grunt: false },
                  log: { level: 'warn' }
                }, function sailsReady(err){
                  //  console.log(sails.models);

                    ccMembers.forEach(function(member, index) { 
                        
                        //console.log(member);
                        console.log(index);
                        sails.models.countycommitteemembers.create(member).then(function(hey) {
                          //.... 
                          console.log(hey);
                        
                        }).catch(function(err){
                          //....
                          //
                          console.error(err);
                        });
                    })
                 
                });
           

            })

        });
     })
     return;
     describe('CSV Extractor', function(done) { 
        console.log('hell');
        it ('can get all the files', function() {

            countCommitteeExtractor.getAllCSVFilePaths(function(filepaths) {
               // console.log(filepaths);

                filepaths.forEach(function(filepath, index) {
                   // console.log(filepath);
                    countCommitteeExtractor.getEDElectionResultsFromCSV(filepath, function(election_results) {
                        //console.log(election_results);
                      //  assert.equal(true, is_numeric('sdf' + election_results.electoral_district));
                       // assert.equal(true, is_numeric(election_results.assembly_district));
                        if (election_results.county) {
                            console.log(election_results.county, '- AD:', election_results.assembly_district, '- ED:', election_results.electoral_district);

                            console.log(election_results.county_committee_member_winners.map(function(obj) { return obj.name }).join("\n"))
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



});