"use strict";

const FeathersMongoose = require("feathers-mongoose");
const ADPartMapModel = require("./ad-part-map-model");
const MemberModel = require("../county-committee-member/county-committee-member-model");
const hooks = require("./hooks");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/lib/sync");

const SERVICE_SLUG = "ad-part-map";

class Service extends FeathersMongoose.Service {
  async create(params) {
    const { filepath, term_id } = params;

    if (!fs.existsSync(filepath)) {
      throw new Error(`File does not exist: ${filepath}`);
    }

    const parsedEDADPartMapCSV = await parse(
      fs.readFileSync(filepath, { encoding: "utf-8" }),
      {
        columns: true,
        skip_empty_lines: true
      }
    );

    const EDADPartMap = parsedEDADPartMapCSV.map(row => {
      const denormalizedEDs = row.ED.split(",")
        .filter(elem => elem.length > 0) // Filters out trailing comma elements.
        .map(edsForADPart => {
          if (edsForADPart.indexOf("-") > -1) {
            /**
             * For values x-y.Splits them and then adds all the numbers
             * in the range.
             */
            const edBounds = edsForADPart.split("-");
            const edsInRange = [];
            for (
              let x = Number(edBounds[0].trim());
              x <= Number(edBounds[1].trim());
              x++
            ) {
              edsInRange.push(x);
            }
            return edsInRange;
          } else {
            return Number(edsForADPart.trim());
          }
        });

      row.EDs = denormalizedEDs.reduce((accumulator, ed) => {
        if (Array.isArray(ed)) {
          accumulator.push(...ed);
        } else {
          accumulator.push(ed);
        }
        return accumulator;
      }, []);

      return row;
    });

    const reducedEDADPartMap = EDADPartMap.reduce((accumulator, partMap) => {
      for (let x = 0; x < partMap.EDs.length; x++) {
        accumulator.push({
          assembly_district: Number(partMap.AD),
          electoral_district: partMap.EDs[x],
          part: partMap.PART,
          status: "Pending"
        });
      }
      return accumulator;
    }, []);

    const adPartMap = await ADPartMapModel.create({
      term_id: term_id,
      source: filepath,
      partMappings: [...reducedEDADPartMap]
    });

    return adPartMap;
  }
  async update(id, data, params) {
    return this.patch(id, data, params);
  }

  async patch(id, data, params) {
    const failedUpdates = [];

    const { approved } = data;

    if (approved !== true) {
      throw Error(`Invalid status update: approved ${approved}`);
    }

    const adPartMap = await ADPartMapModel.findOne({ _id: id });
    const { partMappings } = adPartMap;

    let successCount = 0,
      failedCount = 0,
      totalCount = partMappings.length;

    for (let i = 0; i < partMappings.length; i++) {
      // Goes through each part mapping and updates appropriate
      // CC Members
      const result = await MemberModel.update(
        {
          term_id: adPartMap.term_id,
          assembly_district: partMappings[i].assembly_district,
          electoral_district: partMappings[i].electoral_district
        },
        { $set: { part: partMappings[i].part } },
        { multi: true }
      );
      if (result.n === 0) {
        failedUpdates.push(partMappings[i]);
        partMappings[i].status = "Failed";
        failedCount++;
      } else {
        partMappings[i].status = "Success";
        successCount++;
      }
    }

    const unmappedTermMembersCount = await MemberModel.find({
      term_id: adPartMap.term_id,
      part: ""
    }).count();

    adPartMap.importResults = {
      pendingCount: totalCount - failedCount - successCount,
      failedCount,
      successCount,
      totalCount,
      unmappedTermMembersCount
    };
    adPartMap.partMappings = [...partMappings];
    adPartMap.status = "Completed";
    adPartMap.approved = true;

    await adPartMap.save();

    return adPartMap;
  }
}

module.exports = function() {
  const app = this;

  const options = {
    Model: ADPartMapModel,
    paginate: {
      default: 5,
      max: app.get("api").defaultItemLimit
    },
    lean: false
  };

  const service = new Service(options);
  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/" + SERVICE_SLUG, service, function updateData(
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
  const adPartMapService = app.service(app.get("apiPath") + "/" + SERVICE_SLUG);
  // Set up our before hooks
  adPartMapService.before(hooks.before);

  // Set up our after hooks
  adPartMapService.after(hooks.after);
};
