const express = require('express');
const router = express.Router();

const _ = require('lodash');
const bb = require('bluebird');
const co = bb.coroutine;
const fs = bb.promisifyAll(require('fs'));
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
    const parsed = yield bb.map(JSON.parse(data).features, (x) => {
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
    if (! _.isString(req.query.address) || req.query.address === '') throw new Error('Empty address');
    const address = req.query.address;

    const data = yield googleGeocoder.geocode(address);
    if (! data[0]) throw new Error('Bad address');

    const [lat, long] = [data[0].latitude, data[0].longitude];
    const geomDoc = yield edGeometry.findOne(intersectQuery([lat, long]));
    if (! geomDoc) throw new Error('Not in NYC');

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
    if (err.message === 'Not in NYC') console.log('TODO: the address must be in NYC');
    else if (err.name === 'HttpError') console.log('TODO: google geocoding service is currently down');
    else if (err.message === 'Empty address') console.log('TODO: empty address entered');
    else if (err.message === 'Bad address') console.log('TODO: bad address entered');
    else {
      // TODO: send to a general error page like 'something went wrong!'
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

    const cleaned = yield bb.map(geomDocs, co(function*(doc) {
      const singleEdCoords = yield bb.map(doc.geometry.coordinates[0][0], oneCoord => {
        return {lat: oneCoord[1], lng: oneCoord[0]}
      });
      return {
        coordinates: singleEdCoords,
        ad: doc.ad,
        ed: doc.ed
      };
    }));
    console.log(cleaned);
    res.render('gmapsjs', {ad: ad, lat: lat, long: long, geomDocs: JSON.stringify(geomDocs)});
  }
  catch (err) {
    console.log(err);
  }
}));

module.exports = router;
