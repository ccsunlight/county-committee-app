/**
 * Imports CC list PDF to DB. 
 *
 * @usage       node import-cc-pdf [filename
 * ]
 * @param      {string}  filename  The filename
 */

function importCCPDF(filename) {

    var sails = require('sails');


    sails.lift({}, function(err) {

        var ccExtractor = require(__dirname + '/api/services/county-committee-extractor.js');

        var filepath = __dirname + '/import/' + filename;
        //  var filepath = __dirname + '/../../../import/2016QueensDemCoComm_people_elected.pdf';
        // var filepath = __dirname + '/../../../import/democratic_county_committee_ny.pdf';

        console.log('ATTEMPTING TO IMPORT: ' + filepath);

        ccExtractor.getCCMembersFromCertifiedListPDF(filepath, function(ccMembers) {

            ccMembers.forEach(function(member, index) {

                if (member) {
                    member.data_source = filepath;
                    sails.models.countycommittee.findOrCreate({
                        assembly_district: member.assembly_district,
                        electoral_district: member.electoral_district,
                        state: member.state
                    }, member).then(function(record) {

                        console.log('Imported Record ', record);
                        if (index + 1 == ccMembers.length) {
                            // console.log();
                            process.exit('### IMPORT COMPLETED ###')
                                //return;
                        }

                    }).catch(function(err) {
                        console.error(err);
                    });
                } else {
                    console.log('MEMBER ROW EMPTY', index, member)
                }
            })



        });

    })

}

importCCPDF(process.argv[2]);