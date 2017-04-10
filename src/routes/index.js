const express = require('express');
const router = express.Router();

const _ = require('lodash');
const RestClient = require('node-rest-client').Client;
const client = new RestClient();
const countyCommittee = require('../services/county-committee/county-committee-model')



const fs = require('fs');
const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const dbUrl = 'mongodb://localhost:27017/county-committee';
const colName = 'edgeom';
const oneDay = 1000*60*60*24;
const oneWeek = oneDay*7;

const findOne = (col, query, cb) => {
  MongoClient.connect(dbUrl, (err, db) => {
    db.collection(col).findOne(query, (err, docs) => {
      cb(err, docs);
      db.close();
    });
  });
};

const deleteMany = (col, query, cb) => {
  MongoClient.connect(dbUrl, (err, db) => {
    db.collection(col).deleteMany(query, (err, result) => {
      cb(err, result);
      db.close();
    });
  });
};

const findIntersect = (col, coordinates, cb) => {
  findOne(col, {
    geometry: {
      '$geoIntersects': {
        '$geometry': {
          type: 'Point', coordinates: coordinates.reverse()
        }
      }
    }
  }, cb);
};

const insertMany = (col, items, cb) => {
  MongoClient.connect(dbUrl, (err, db) => {
    db.collection(col).insertMany(items, (err, result) => {
      cb(err, result);
      db.close();
    });
  });
};

// ripped from county-committee-extractor.js
const downloadFile = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  http.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close(cb); // close() is async, call cb after close completes.
    });
  }).on('error', (err) => {
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

// we need to update the db if there's nothing in it or if it's been more than a week
// get the first doc to check the date
const updateEdDb = () => {
  setTimeout(updateEdDb, oneDay);

  findOne(colName, {}, (err, doc) => {
    if (doc === null || Date.now() > doc.created + oneWeek) {
      // download some new geojson
      const geoJsonURL = 'http://data.cityofnewyork.us/api/geospatial/h2n3-98hq?method=export&format=GeoJSON';
      downloadFile(geoJsonURL, 'data/Election Districts.geojson', () => {
        // read in our geojson, add a creation time and reformat the ad/ed
        let data = JSON.parse(fs.readFileSync('data/Election Districts.geojson'));
        const creationTime = Date.now();
        data.features = data.features.map(x => {
          x.created = creationTime;
          x.ad = Number(x.properties.elect_dist.slice(0, 2));
          x.ed = Number(x.properties.elect_dist.slice(2));
          return x;
        });

        // insert our new polygons
        insertMany(colName, data.features, (err, result) => {
          // delete our old entries
          deleteMany(colName, {created: {$lt: creationTime}}, (err, result) => {
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

const getLatLongFromAddress = (address, cb) => {
  // TODO: add a backup geocoder
  const apiKey = 'AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg';
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + apiKey;

  client.get(url, (data, response) => {
    // console.log(data);
    const lat = data.results[0].geometry.location.lat;
    const long = data.results[0].geometry.location.lng;
    cb(lat, long);
  });
};

const getDistrictInfoFromLatLong = (lat, long, cb) => {
  findIntersect(colName, [lat, long], (err, doc) => {
    countyCommittee.find({assembly_district: doc.ad, electoral_district: doc.ed})
    .then((members) => {
      cb(doc.ad, doc.ed, members);
    });
  });
};


router.get('/get_address', (req, res, next) => {
  getLatLongFromAddress(req.query.address, (lat, long) => {
    getDistrictInfoFromLatLong(lat, long, (ad, ed, members) => {
      res.render('get_address', {
        address: req.query.address,
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


router.get('/fusiontable', (req, res, next) => {
  res.render('fusiontable', {ad: req.query.ad, lat: req.query.lat, long: req.query.long});
});

module.exports = router;
