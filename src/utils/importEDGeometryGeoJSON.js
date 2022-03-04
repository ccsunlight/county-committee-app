const edGeometry = require("../services/edGeometry/edGeometry-model");
const download = require("download");
const turf = require("turf");
const unkinkPolygon = require("@turf/unkink-polygon");
const bb = require("bluebird");
const co = bb.coroutine;
const fs = require("fs");

const importEDGeometryGeoJSON = co(function*({ release, geojsonFileUrl }) {
  try {
    if (!release) {
      console.error("Must provide release to import geoJSON");
    }
    // @todo statically setting this to ED_2022_22A
    // which is the latest ED districts
    // This should be changed to an admin process
    const saveTo = `downloads/ED_MAP_${release}.geojson`;

    // If there is no expired geo documents,
    // check that there are any geo documents at all

    const anyEdGeomtryDoc = yield edGeometry.findOne({
      release
    });

    // If there are already geo documents, don't proceed
    // with import
    if (anyEdGeomtryDoc) {
      console.log(
        `Geometry docs with release found ${release}. Please remove all existing or reversion before importing.`
      );
      return;
    }

    if (geojsonFileUrl) {
      console.log(
        `GEO JSON file URL provided. Attempting to retrieve file from url. ${geojsonFileUrl}`
      );
      try {
        const geojsonFile = yield download(geojsonFileUrl);
        yield fs.writeFileAsync(saveTo, geojsonFile);
      } catch (err) {
        // if the download fails, just log it and fall back to whatever we already have
        console.log("ED geojson download failed!");
      }
    } else {
      console.log(
        `No GEO JSON file URL provided or custom local filepath provided. Attempting to retrieve file locally. ${saveTo}`
      );
    }

    const data = yield fs.readFileAsync(saveTo);
    const features = JSON.parse(data).features;

    // Filters out features that don't have EDs
    const featuresFiltered = features.filter(feature => {
      if (!feature.properties.elect_dist) {
        return false;
      }
      return true;
    });

    const parsed = yield bb.map(featuresFiltered, x => {
      try {
        var poly = turf.multiPolygon(x.geometry.coordinates);
        var unkinkedPolygon = unkinkPolygon(poly);

        return {
          ad: Number(x.properties.elect_dist.slice(0, 2)),
          ed: Number(x.properties.elect_dist.slice(2)),
          geometry: {
            type: "MultiPolygon",
            coordinates: x.geometry.coordinates
          },
          release
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
          kinked: true,
          release
        };
      }
    });
    const parsedRemovedKinked = parsed.filter(poly => !poly.kinked);

    // Removes expired documents first
    // @todo Refactor this to be more redundant
    // yield edGeometry.deleteMany({
    //   createdAt: {
    //     $lt: expireTimeMS
    //   }
    // });

    // inserts new documents.
    yield edGeometry.insertMany(parsedRemovedKinked);

    console.log("Updated ED geometry DB");
  } catch (err) {
    console.log(err);
  }
});

module.exports = importEDGeometryGeoJSON;
