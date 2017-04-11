const express = require('express');
const router = express.Router();

const _ = require('lodash');
const fs = require('fs');
const RestClient = require('node-rest-client').Client;
const client = new RestClient();

const countyCommittee = require('../services/county-committee/county-committee-model')
const edGeometry = require('../services/edGeometry/edGeometry-model')


// we need to update the db if there's nothing in it or if it's been more than a week
// get the first doc to check the date
const updateEdDb = () => {
  const oneDay = 1000*60*60*24;
  const oneWeek = oneDay*7;
  setTimeout(updateEdDb, oneDay);

  edGeometry.findOne({}, (err, topDoc) => {
    // if our db is empty or if our
    const expireTime = (topDoc !== null) ? topDoc.createdAt + oneWeek : 0;
    if (expireTime < Date.now()) {
      // TODO: download some new geojson from https://data.cityofnewyork.us/api/geospatial/h2n3-98hq?method=export&format=GeoJSON
      // read in our geojson
      fs.readFile('data/Election Districts.geojson', (err, data) => {
        let parsed = JSON.parse(data);

        parsed = parsed.features.map((x) => {
          return {
            ad: Number(x.properties.elect_dist.slice(0, 2)),
            ed: Number(x.properties.elect_dist.slice(2)),
            geometry: {type: 'MultiPolygon', coordinates: x.geometry.coordinates}
          };
        });

        // insert our new polygons
        edGeometry.insertMany(parsed, (err, result) => {
          // delete our old entries
          edGeometry.deleteMany({createdAt: {$lt: expireTime}}, (err, result) => {
            console.log('updated ED DB');
          });
        });
      });

    }
  });
};
updateEdDb();


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {title: 'Index'});
});

const intersectQuery = (coordinates) => {
  return {
    geometry: {
      '$geoIntersects': {
        '$geometry': {
          type: 'Point', coordinates: coordinates.reverse()
        }
      }
    }
  };
};

router.get('/get_address', (req, res, next) => {
  // TODO: add a backup geocoder
  const address = req.query.address;
  const apiKey = 'AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg';
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + apiKey;

  client.get(url, (data, response) => {
    // console.log(data);
    const lat = data.results[0].geometry.location.lat;
    const long = data.results[0].geometry.location.lng;

    edGeometry.findOne(intersectQuery([lat, long]), (err, geomDoc) => {
      const ad = geomDoc.ad;
      const ed = geomDoc.ed;

      countyCommittee.find({assembly_district: ad, electoral_district: ed}, (members) => {
        res.render('get_address', {
          address: address,
          lat: lat,
          long: long,
          ad: ad,
          ed: ed,
          members: members,
          title: 'Address Search...'
        });
      });
    });
  });
});


router.get('/fusiontable', (req, res, next) => {
  res.render('fusiontable', {ad: req.query.ad, lat: req.query.lat, long: req.query.long});
});

module.exports = router;
