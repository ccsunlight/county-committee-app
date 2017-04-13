const express = require('express');
const router = express.Router();

const _ = require('lodash');
const bluebird = require('bluebird');
const co = bluebird.coroutine;
const fs = bluebird.promisifyAll(require('fs'));
const rp = require('request-promise');
const download = require('download');
const NodeGeocoder = require('node-geocoder');

const countyCommittee = require('../services/county-committee/county-committee-model');
const edGeometry = require('../services/edGeometry/edGeometry-model');


const googleGeocoderOptions = {
  provider: 'google',
  apiKey: 'AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg',
  httpAdapter: 'https',
  formatter: null
};
const googleGeocoder = NodeGeocoder(googleGeocoderOptions);


// we need to update the db if there's nothing in it or if it's been more than a week
const updateEdDb = co(function*() {
  try {
    const oneDay = 1000*60*60*24;
    const oneWeek = oneDay*7;
    setTimeout(updateEdDb, oneDay);

    // get the first doc to check the date
    const topDoc = yield edGeometry.findOne({});
    const expireTime = (topDoc !== null) ? topDoc.createdAt + oneWeek : 0;
    if (expireTime > Date.now()) return;

    const saveTo = 'downloads/Election_Districts.geojson';

    try {
      const geojsonFile = yield download('https://data.cityofnewyork.us/api/geospatial/h2n3-98hq?method=export&format=GeoJSON');
      yield fs.writeFileAsync(saveTo, geojsonFile);
    }
    catch (err) {
      // if the download fails, just log it and fall back to whatever we already have
      console.log('ED geojson download failed!');
    }

    const data = yield fs.readFileAsync(saveTo);
    const parsed = yield bluebird.map(JSON.parse(data).features, (x) => {
      return {
        ad: Number(x.properties.elect_dist.slice(0, 2)),
        ed: Number(x.properties.elect_dist.slice(2)),
        geometry: {type: 'MultiPolygon', coordinates: x.geometry.coordinates}
      };
    });

    yield edGeometry.insertMany(parsed);
    yield edGeometry.deleteMany({createdAt: {$lt: expireTime}});

    console.log('Updated ED geometry DB');
  }
  catch (err) {
    console.log(err);
  }
});
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
          // geojson expects its lat/long backwards (like long,lat)
          type: 'Point', coordinates: coordinates.reverse()
        }
      }
    }
  };
};

router.get('/get_address', co(function*(req, res, next) {
  try {
    const address = req.query.address;

    const data = yield googleGeocoder.geocode(address);

    const [lat, long] = [data[0].latitude, data[0].longitude];
    const geomDoc = yield edGeometry.findOne(intersectQuery([lat, long]));
    if (geomDoc === null) throw new Error('Not in NYC!');

    const [ad, ed] = [geomDoc.ad, geomDoc.ed];
    const members = yield countyCommittee.find({assembly_district: ad, electoral_district: ed});

    const locals = {
      address: address,
      lat: lat,
      long: long,
      ad: ad,
      ed: ed,
      members: members,
      title: 'Address Search...'
    };

    res.render('get_address', locals);
  }
  catch (err) {
    if (err.message === 'Not in NYC!') {
      console.log('TODO: send user to error page saying the address must be in NYC');
    }
    else if (err.name === 'HttpError') {
      // thrown when the google geocoding api fails
      console.log('TODO: send user to error page saying the service is currently down for maintenance');
    }
    else {
      console.log(err);
    }
  }
}));


router.get('/fusiontable', (req, res, next) => {
  res.render('fusiontable', {ad: req.query.ad, lat: req.query.lat, long: req.query.long});
});

router.get('/gmapsjs', co(function*(req, res, next) {
  try {
    const [ad, lat, long] = [Number(req.query.ad), Number(req.query.lat), Number(req.query.long)];
    const geomDocs = yield edGeometry.find({ad: ad});
    res.render('gmapsjs', {ad: ad, lat: lat, long: long, geomDocs: JSON.stringify(geomDocs)});
  }
  catch (err) {
    console.log(err);
  }
}));

module.exports = router;
