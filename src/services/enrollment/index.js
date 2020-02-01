"use strict";

const service = require("feathers-mongoose");
const EnrollmentModel = require("./enrollment-model");
const FeathersMongoose = require("feathers-mongoose");
const hooks = require("./hooks");

const COLUMN_INDEX_MAP = {
  COUNTY: 0,
  "ELECTION DIST": 1,
  STATUS: 2,
  DEM: 3,
  REP: 4
};

class Service extends FeathersMongoose.Service {
  extractCountyFromRow(row) {
    const cells = row.split(",");
    const output = cells[COLUMN_INDEX_MAP.COUNTY].trim();
    return output;
  }

  extractEDADFromRow(row) {
    const cells = row.split(",");
    const cell = cells[COLUMN_INDEX_MAP["ELECTION DIST"]].trim();
    const ed_ad = cell.split(" ").pop();
    const ed = ed_ad.substring(ed_ad.length - 3);
    const ad = ed_ad.substring(0, ed_ad.length - 3);
    return { ed, ad };
  }

  extractDataFromRow(row) {
    const ed_ad = this.extractEDADFromRow(row);
    const county = this.extractCountyFromRow(row);
    const cells = row.split(",");

    const obj = {
      electoral_district: ed_ad.ed,
      assembly_district: ed_ad.ad,
      county,
      status: cells[COLUMN_INDEX_MAP.STATUS],
      dem: cells[COLUMN_INDEX_MAP.DEM],
      rep: cells[COLUMN_INDEX_MAP.REP]
    };

    return obj;
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
