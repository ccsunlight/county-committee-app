"use strict";

const service = require("feathers-mongoose");
const EnrollmentModel = require("./enrollment-model");
const TermModel = require("../term/term-model");
const FeathersMongoose = require("feathers-mongoose");
const hooks = require("./hooks");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

const COLUMN_INDEX_MAP = {
  COUNTY: 0,
  "ELECTION DIST": 1,
  STATUS: 2,
  DEM: 3,
  REP: 4,
  DATE: 0
};

class Service extends FeathersMongoose.Service {
  extractCountyFromRow(row) {
    const output = row[COLUMN_INDEX_MAP.COUNTY].trim();
    return output;
  }

  extractEDADFromRow(row) {
    const cell = row[COLUMN_INDEX_MAP["ELECTION DIST"]].trim();
    const ed_ad = cell.split(" ").pop();
    if (isNaN(ed_ad[0]) || isNaN(ed_ad[1])) {
      return false;
    }
    const ed = parseInt(ed_ad.substring(ed_ad.length - 3), 10);
    const ad = parseInt(ed_ad.substring(0, ed_ad.length - 3), 10);
    return { ed, ad };
  }

  extractDateFromRow(row) {
    let matches;
    for (let x = 0; x < row.length; x++) {
      if (row[x]) {
        matches = row[x].match(/Voters Registered as of\s(.+)/);
        if (matches) {
          const date = Date.parse(matches[1]);
          return date;
        }
      }
    }
    return false;
  }

  extractDataFromRow(row) {
    const ed_ad = this.extractEDADFromRow(row);
    const county = this.extractCountyFromRow(row);

    const obj = {
      electoral_district: ed_ad.ed,
      assembly_district: ed_ad.ad,
      county,
      status: row[COLUMN_INDEX_MAP.STATUS],
      dem: row[COLUMN_INDEX_MAP.DEM].replace(",", ""), // strips out numeric comma
      rep: row[COLUMN_INDEX_MAP.REP].replace(",", "")
    };

    return obj;
  }

  extractEnrollmentFromCSV(params) {
    const { filepath, party, county, state, committee_id } = params;

    var parse = require("csv-parse");
    let date;
    let enrollmentRecords = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(parse({ delimiter: "," }))
        .on("data", (csvrow, foo) => {
          // Date comes before data
          if (!date) {
            date = this.extractDateFromRow(csvrow);
          } else {
            let data = this.extractDataFromRow(csvrow);
            if (data.electoral_district) {
              enrollmentRecords.push({ ...data, date });
            }
          }
        })
        .on("end", () => {
          resolve(enrollmentRecords);
        })
        .on("error", err => {
          reject(err);
        });
    });
  }
  create(params) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(params.filepath)) {
        reject("File does not exist: " + params.filepath);
        return;
      }

      this.extractEnrollmentFromCSV({
        ...params
      }).then(async enrollmentRecords => {
        const enrollments = [];
        let enrollment;

        for (let x = 0; x < enrollmentRecords.length; x++) {
          /**
           * Each enrollment record has three documents
           * "Active, Inactive and Total"
           */
          enrollment = await EnrollmentModel.findOneAndUpdate(
            {
              electoral_district: enrollmentRecords[x].electoral_district,
              assembly_district: enrollmentRecords[x].assembly_district,
              status: enrollmentRecords[x].status
            },
            {
              source: path.basename(params.filepath),
              ...enrollmentRecords[x]
            },
            {
              new: true,
              upsert: true
            }
          );
          enrollments.push(enrollment);
        }

        resolve(enrollments.pop());
      });
    });
  }
}

module.exports = function() {
  const app = this;
  const options = {
    Model: EnrollmentModel,
    paginate: {
      default: 10,
      max: 10
    },
    lean: false
  };

  // Initialize our service with any options it requires
  app.use(
    app.get("apiPath") + "/enrollment",
    new Service(options),
    function updateData(req, res, next) {
      // If it's request in a csv format send a download attachment response
      // of the CSV text
      // @todo find a better way to handle this
      if (req.query.format === "csv") {
        res.setHeader(
          "Content-disposition",
          `attachment; filename=party-call-${req.params.__feathersId}.csv`
        );
        res.setHeader("Content-type", "text/plain");

        res.send(res.data, options, function(err) {
          if (err) {
            next(err);
          } else {
          }
        });
      } else {
        next();
      }
    }
  );

  // Get our initialize service to that we can bind hooks
  const enrollmentService = app.service(app.get("apiPath") + "/enrollment");

  // Set up our before hooks
  enrollmentService.before(hooks.before);

  // Set up our after hooks
  enrollmentService.after(hooks.after);
};
