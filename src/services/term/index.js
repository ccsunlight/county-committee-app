"use strict";

const FeathersMongoose = require("feathers-mongoose");
const TermModel = require("./term-model");
const MemberModel = require("../county-committee-member/county-committee-member-model");
const hooks = require("./hooks");
const mongoose = require("mongoose");

class Service extends FeathersMongoose.Service {}

module.exports = function() {
  const app = this;

  const options = {
    Model: TermModel,
    paginate: {
      default: 5,
      max: app.get("api").defaultItemLimit
    },
    lean: false
  };

  const service = new Service(options);
  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/term", service, function updateData(
    req,
    res,
    next
  ) {
    // If it's request in a csv format send a download attachment response
    // of the CSV text
    // @todo find a better way to handle this
    if (req.query.format === "csv") {
      res.setHeader(
        "Content-disposition",
        `attachment; filename=term-results-${req.params.__feathersId}.csv`
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
  });

  // Get our initialize service to that we can bind hooks
  const termService = app.service(app.get("apiPath") + "/term");
  // Set up our before hooks
  termService.before(hooks.before);

  // Set up our after hooks
  termService.after(hooks.after);
};
