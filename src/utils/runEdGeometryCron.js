const edGeometry = require("../services/edGeometry/edGeometry-model");
const download = require("download");
const turf = require("turf");
const unkinkPolygon = require("@turf/unkink-polygon");
const bb = require("bluebird");
const co = bb.coroutine;
const fs = require("fs");

const runEdGeometryCron = co(function*() {
  try {
    const oneDayMS = 1000 * 60 * 60 * 24;
    const oneWeekMS = oneDayMS * 7;
    const expireTimeMS = Date.now() - oneWeekMS;

    // Runs this job every day
    setTimeout(runEdGeometryCron, oneDayMS);

    // get the first doc to check the date
    const firstExpriedEdGeometryDoc = yield edGeometry.findOne({
      createdAt: { $lt: expireTimeMS }
    });

    // If there is no expired geo documents,
    // check that there are any geo documents at all
    if (!firstExpriedEdGeometryDoc) {
      const anyEdGeomtryDoc = yield edGeometry.findOne({});

      // If there are already geo documents, don't proceed
      // with import
      if (anyEdGeomtryDoc) {
        // console.log("No expired edgeometries found, exiting.");
        return;
      }
    }

    const saveTo = "downloads/Election_Districts.geojson";

    try {
      const geojsonFile = yield download(
        "https://data.cityofnewyork.us/api/geospatial/h2n3-98hq?method=export&format=GeoJSON"
      );
      yield fs.writeFileAsync(saveTo, geojsonFile);
    } catch (err) {
      // if the download fails, just log it and fall back to whatever we already have
      console.log("ED geojson download failed!");
    }

    const data = yield fs.readFileAsync(saveTo);
    const parsed = yield bb.map(JSON.parse(data).features, x => {
      try {
        var poly = turf.multiPolygon(x.geometry.coordinates);
        var unkinkedPolygon = unkinkPolygon(poly);

        return {
          ad: Number(x.properties.elect_dist.slice(0, 2)),
          ed: Number(x.properties.elect_dist.slice(2)),
          geometry: {
            type: "MultiPolygon",
            coordinates: x.geometry.coordinates
          }
        };
      } catch (e) {
        console.log(e);

        return {
          ad: Number(x.properties.elect_dist.slice(0, 2)),
          ed: Number(x.properties.elect_dist.slice(2)),
          geometry: {
            type: "MultiPolygon",
            coordinates: x.geometry.coordinates
          },
          kinked: true
        };
      }
    });
    const parsedRemovedKinked = parsed.filter(poly => !poly.kinked);

    // Removes expired documents first
    // @todo Refactor this to be more redundant
    yield edGeometry.deleteMany({
      createdAt: {
        $lt: expireTimeMS
      }
    });

    // inserts new documents.
    yield edGeometry.insertMany(parsedRemovedKinked);

    console.log("Updated ED geometry DB");
  } catch (err) {
    console.log(err);
  }
});

module.exports = runEdGeometryCron;
