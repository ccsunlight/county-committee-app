/**
 *
 * This service etracts members from documents.
 * 
 * Currently only works with PARTY POSITION CERTIFIED LIST in NYC
 *
 * author     (Jonathan Crockett)
 * 
 */
const countyCommitteeModel = require('../../../src/services/county-committee/county-committee-model');


var Xray = require('x-ray');

var x = Xray();

var saveDir = 'downloads';

exports.getCountyCommitteeCSVFileUrls = function(url, callback) {

    var ccCSVFilePathObjects = [];

    // HTML specific to BOE website. 
    // @todo make this more flexible
    x(url, '.bodytext table', ['tr@html'])(function(err, trs) {

        // Iterates through the TRs and then sees 
        // if "County Committee XX" exists.
        // If so we know it's a County Committee election
        // Then find the "Recap csv" and add it to the download list
        trs.forEach(function(tr, index) {

            if (/County Committee \d{2}/.test(tr)) {

                x(tr, {
                    title: 'td',
                    urls: ['a@href']
                })(function(err, obj) {

                    obj.urls.forEach(function(url) {

                        if (/Recap(.)csv/.test(url)) {
                            ccCSVFilePathObjects.push({
                                title: obj.title,
                                url: url
                            });
                        }

                    });

                });

            }

        });

        console.log('CSV files found at ' + url + ' : ', ccCSVFilePathObjects.length);

        saveCSVFileRecursive(ccCSVFilePathObjects, callback);

    });

};

exports.getNonFoundMembersRecursive = function(ccMembers, unfoundMembers, callback) {

    let member = ccMembers.shift();

    let member_name_parts = member.office_holder.split(" ");

    countyCommitteeModel.find({
        electoral_district: member.electoral_district,
        assembly_district: member.assembly_district,
        office_holder: new RegExp(member_name_parts[member_name_parts.length - 1], "i"),
    }, function(err, foundMembers) {

        if (err) {

            console.log('ERROR', err);

        } else {

            if (foundMembers.length > 0) {

                // console.log('FOUND', foundMembers);
            } else {
                console.log('UNFOUND', member.office, member.assembly_district, member.electoral_district, member.office_holder);
                unfoundMembers.push(member)

                /* newMember.save(function(err, saved) {
                    if (err) return console.error(err);

                    if (index + 1 == ccMembers.length) {
                        // console.log();
                        process.exit('### IMPORT COMPLETED ###')
                            //return;
                    }
                    
                });
                */
            }

        }

        if (ccMembers.length === 0) {

            let anomalyMembers = [];

            this.insertMembersIntoVacantPositionsRecursive(unfoundMembers, anomalyMembers, function(foundanomalyMembers) {

                console.log('anomalyMembers', foundanomalyMembers);

                saveToCSV(foundanomalyMembers, 'anomaly_members.csv', function() {

                    process.exit('DONE IMPORTING');
                });
            })
        } else {
            this.getNonFoundMembersRecursive(ccMembers, unfoundMembers, callback);
        }

    }.bind(this));


}


this.insertMembersIntoVacantPositionsRecursive = function(members, anomalyMembers, callback) {

    let member = members.shift();

    countyCommitteeModel.findOne({
        electoral_district: member.electoral_district,
        assembly_district: member.assembly_district,
        office: member.office,
        office_holder: 'Vacancy'
    }, function(err, vacancyOffice) {

        if (vacancyOffice) {

            console.log('vacancy office found', vacancyOffice.electoral_district, vacancyOffice.assembly_district);
            vacancyOffice.office_holder = member.office_holder
            vacancyOffice.data_source = member.data_source;
            vacancyOffice.entry_type = "Appointed";
            vacancyOffice.save(function(err, success) {

                if (members.length > 0) {
                    this.insertMembersIntoVacantPositionsRecursive(members, anomalyMembers, callback);
                } else {
                    callback(anomalyMembers);
                }

            }.bind(this));

        } else {
            console.log('not found', member.office_holder);
            anomalyMembers.push(member);

            if (members.length > 0) {
                this.insertMembersIntoVacantPositionsRecursive(members, anomalyMembers, callback);
            } else {
                callback(anomalyMembers);
            }

        }

    }.bind(this));

}


function saveToCSV(data, filepath, callback) {
    var json2csv = require('json2csv');
    var fs = require('fs');
    
    var fields = Object.keys(data[0]);
    /* var myCars = [{
        "car": "Audi",
        "price": 40000,
        "color": "blue"
    }, {
        "car": "BMW",
        "price": 35000,
        "color": "black"
    }, {
        "car": "Porsche",
        "price": 60000,
        "color": "green"
    }];


    let csv = json2csv({
        data: data,
        fields: fields
    });
    */

    let csv = json2csv({
        data: data,
        fields: fields
    });

    fs.writeFile(filepath, csv, function(err) {
        if (err) throw err;
        console.log('file saved');
        callback();
    });
}


/**
 * Downloads a csv file.
 *
 * @param      {<type>}    ccCSVFilePathObjects  The cc csv file path objects
 * @param      {Function}  callback              The callback
 */
function saveCSVFileRecursive(ccCSVFilePathObjects, callback) {

    var downloadIntervalMS = 500;

    if (ccCSVFilePathObjects.length > 0) {

        var obj = ccCSVFilePathObjects.pop();
        var filename = obj.url.split('/').pop();

        // @todo turn this into a queue.
        exports.downloadFile(obj.url, saveDir + '/' + filename, function() {

            // Don't want to hit the server too quickly.
            setTimeout(function() {
                saveCSVFileRecursive(ccCSVFilePathObjects, callback);
            }, downloadIntervalMS);

        });

    } else {

        console.log('Done getting CSV Files.');
        callback();

    }

}


exports.downloadFile = function(url, dest, cb) {

    var fs = require('fs');
    var http = require('http');

    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

exports.downloadCSV = function(url, callback) {
    console.log('downloadCSV', url);

    var getCSV = require('get-csv');
    getCSV(url, function(err, data) {
        console.log('done');
        console.log(err);
        console.log(data);
        callback();
    });
};

/**
 * var items = [
  { name: 'Edward', value: 21 },
  { name: 'Sharpe', value: 37 },
  { name: 'And', value: 45 },
  { name: 'The', value: -12 },
  { name: 'Magnetic', value: 13 },
  { name: 'Zeros', value: 37 }
];

// sort by value
items.sort(function (a, b) {
  return a.value - b.value;
});
 */
exports.determineWinningCandidates = function(candidates, numberOfSlots) {

        if (!numberOfSlots) {
            numberOfSlots = 2;
        }

        candidates.sort(function(candidateA, candidateB) {
            return parseInt(candidateB.tally) - parseInt(candidateA.tally);
        });

        return candidates.slice(0, numberOfSlots);

    }
    /**
     * Goes through an election CSV and finds the winners 
     *
     * @param      {<type>}    filepath  The filepath
     * @param      {Function}  callback  The callback
     */
exports.getEDElectionResultsFromCSV = function(filepath, callback) {
    // console.log('Extracting County Committee Members from: ', filepath);

    var csv = require("fast-csv");

    var candidateRows = false;
    var endOfCandidateRows = false;
    var foundEDandAD = false;

    var election_results = {
        county: undefined,
        electoral_district: undefined,
        assembly_district: undefined,
        county_committee_member_winners: undefined
    };

    var candidates = [];

    csv.fromPath(filepath, {
            objectMode: true,
            ignoreEmpty: true
        })
        .validate(function(data) {
            return !(endOfCandidateRows && foundEDandAD);
        })
        .on("data", function(data) {

            if (data[0] == 'Total Applicable Ballots') {
                // console.log('Start of Candidates found! ');
                //console.log(data);
                candidateRows = true;
            } else if (data[0] == 'Total Votes') {
                // console.log('End of Candidates found! ');
                //console.log(data);
                candidateRows = false;
                endOfCandidateRows = true;
            } else if (candidateRows) {
                //console.log(data);
                candidates.push({
                    name: data[0],
                    tally: parseInt(data[1], 10)
                })
            } else if (!foundEDandAD) {

                var found = data[0].match(/County Committee \((\d+)\/(\d+)\) - (.+) County/);

                if (found) {
                    //console.log('FOUND STUFF', found);
                    // console.log('Start of Candidates found! ');
                    //console.log(data);
                    foundEDandAD = true;
                    election_results.electoral_district = parseInt(found[1], 10);
                    election_results.assembly_district = parseInt(found[2], 10);
                    election_results.county = found[3];

                }

            }

            // get names 
            // from Total Applicable Ballots
            // to Total Votes
            //
        })
        .on("end", function() {

            var winningCandidates = exports.determineWinningCandidates(candidates);

            election_results.county_committee_member_winners = winningCandidates;

            callback(election_results);

        });
};


exports.addCCMembers = function(members, callback) {

    const countyCommitteeModel = require('../../../src/services/county-committee/county-committee-model');
    let notMatched = [];
    members.forEach(function(member, index) {
        countyCommitteeModel.findOne({
            office_holder: 'Vacancy',
            assembly_district: parseInt(member.assembly_district, 10),
            electoral_district: parseInt(member.electoral_district, 10),
            office: member.office
        }, function(err, record) {

            if (err) return console.error(err);

            if (record) {
                record.office_holder = member.office_holder;
                record.entry_type = 'Appointed';
                record.data_source = member.data_source;
                record.address = member.address;
                record.save();

                //  console.log('record', record);
            } else {
                console.log(JSON.stringify(member))
                notMatched.push(member);
            }

            if (index === members.length - 1) {

                callback(notMatched);
            }
        });
    })
}

/**
 * Goes through an election CSV and finds the winners 
 *
 * @param      {<type>}    filepath  The filepath
 * @param      {Function}  callback  The callback
 */
exports.getCCMembersFromCSV = function(filepath, callback) {
    // console.log('Extracting County Committee Members from: ', filepath);

    var csv = require("fast-csv");

    var ccMemberRows = [];

    csv.fromPath(filepath, {
            objectMode: true,
            ignoreEmpty: true,
            headers: true,
            trim: true
        })
        .on("data", function(data) {

            ccMemberRows.push(data);

        })
        .on("end", function() {
            let ccMembers = ccMemberRows.map(function(row) {

                return {
                    assembly_district: row.AD,
                    electoral_district: row.ED,
                    office: row.SEX === 'M' ? 'Male County Committee' : 'Female County Committee',
                    office_holder: row.OFFICE_HOLDER,
                    address: row.ADDRESS + ' Brooklyn, NY ' + row.ZIPCODE,
                    data_source: filepath
                }

            })

            callback(ccMembers);

        });
};



/*
exports.extractEDandADfromCSV = function(filepath, callback) {

    var csv = require("fast-csv");

    
    csv.fromPath(filepath, {
            objectMode: true,
            ignoreEmpty: true
        })
        .validate(function(data) {
            return !valuesFound;
        })
        .on("data", function(data) {

            
           
            // get names 
            // from Total Applicable Ballots
            // to Total Votes
            //
        })
        .on("end", function() {
            callback(district);
        });
}
*/
exports.getAllCSVFilePaths = function(callback) {
    console.log('getAllCSVFiles');
    const fs = require('fs');

    var filepaths = [];

    var path = require('path');
    var appDir = path.dirname(require.main.filename);

    //console.log('PWD' + process.env.PWD);
    fs.readdir(saveDir, (err, files) => {

        files.forEach(file => {
            // console.log(process.env.PWD + '/' + saveDir + '/' + file);
            if (/csv$/.test(file)) {
                filepaths.push(process.env.PWD + '/' + saveDir + '/' + file)
            }
        });

        callback(filepaths);
    })
}


exports.getCCMembersFromCertifiedListPDF = function(pathToPDF, callback) {

    var path = require('path')
    var filePath = pathToPDF;
    var extract = require('pdf-text-extract');

    extract(filePath, function(err, pages) {

        if (err) {
            console.log('woo', err)
                //return
        }
        // console.dir(pages[2]);
        // 
        // 
        console.log('yayay');

        var ccMembers = [];
        pages.forEach(function(page, index) {
            ccMembers = ccMembers.concat(extractCCMembersFromPage(page));
        })

        console.log('MEMBER COUNT: ', ccMembers.length);

        callback(ccMembers);

    });

}

function findCCMemberHeaderRow(row) {
    if (/Tally\s+Entry Type/.test(row)) {
        return true;
    } else {
        return false;
    }
}


function findCCMemberFooterRow(row) {
    if (/Page \d+ of \d+/.test(row)) {
        return true;
    } else {
        return false;
    }
}

//ED/AD Office Holder Address Tally Entry Type



function extractCCMemberDataFromRow(row, county) {

    var cc_member = {
        petition_number: undefined,
        office: undefined,
        office_holder: undefined,
        address: undefined,
        tally: undefined,
        entry_type: undefined,
        ed_ad: undefined,
        electoral_district: undefined,
        assembly_district: undefined,
        data_source: undefined,
        county: county,
        state: 'NY'
    }

    //
    // Lots of gnarly regex logic to parse fields here.
    // 
    // You've been warned.
    // 

    // Splits up by two space matches.
    // @todo make sure there are no one spaced out items!
    var rowFields = row.split(/\s{2,}/);

    // Edge case for space at begninning
    if (rowFields[0] == '') {
        rowFields.shift();
    }
    // petition checker
    if (!isNaN(rowFields[0])) {
        cc_member.petition_number = rowFields.shift();
    }

    if (/County Committee/i.test(rowFields[0])) {
        cc_member.office = rowFields.shift();
    } else {
        throw new ccExtractionException('Petition or position Field Not Valid. ' + rowFields[0] + ' Row: ' + row);
    }

    // ED AD extractor
    if (/\d+\/\d+/.test(rowFields[0])) {
        cc_member.ed_ad = rowFields.shift();
        var ed_ad = cc_member.ed_ad.split('/');
        cc_member.electoral_district = parseInt(ed_ad[0], 10);
        cc_member.assembly_district = parseInt(ed_ad[1], 10);
    } else {
        throw new ccExtractionException('ED/AD Field Not Valid. ' + rowFields[0] + ' Row: ' + row);
    }

    // Office Holder extractor
    if (/Vacancy/i.test(rowFields[0])) {

        cc_member.office_holder = rowFields.shift();
    } else {

        cc_member.office_holder = rowFields.shift();

        //if (/NY/.test(rowFields[0])) {
        cc_member.address = rowFields.shift();
        //} else {
        //    throw 'Address Field Not Valid. ' + rowFields[0] + ' Row: ' + row;
        //}

        if (!isNaN(parseInt(rowFields[0], 10))) {
            cc_member.tally = rowFields.shift();
        } else {
            throw new ccExtractionException('Tally Field Not Valid. ' + rowFields[0] + ' Row: ' + row);
        }

    }

    if (/.+$/i.test(rowFields[0])) {
        cc_member.entry_type = rowFields.shift();
    }

    return cc_member;

}


function ccExtractionException(message) {
    this.message = message;
    this.name = 'CCMemberException';
}

function extractCCMembersFromPage(page) {

    var rows = page.match(/(.+)/g);

    var county = extractCountyFromPage(page);

    // console.log('county', county);

    var headerRowIndex = rows.findIndex(findCCMemberHeaderRow);
    var footerRowIndex = rows.findIndex(findCCMemberFooterRow);
    console.log(rows);
    if (headerRowIndex > 0 && footerRowIndex > 0) {
        var ccMemberRows = rows.slice(headerRowIndex + 1, footerRowIndex);

        var errors = [];
        var ccMembers = [];

        ccMemberRows.forEach(function(memberRow, index) {

            try {
                ccMembers.push(extractCCMemberDataFromRow(memberRow, county));
            } catch (e) {
                errors.push(e);
            }

        });

        //console.log(errors);
        console.log(ccMembers);
        return ccMembers;

    }

}


function extractCountyFromPage(page) {
    var match = page.match(/IN THE CITY OF NEW YORK\s+(.+), .+Party/);

    if (match) {
        return match[1];
    }
}