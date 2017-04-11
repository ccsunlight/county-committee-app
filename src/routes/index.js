const express = require('express');
const router = express.Router();

const _ = require('lodash');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const rp = require('request-promise');
const download = require('download');

const countyCommittee = require('../services/county-committee/county-committee-model');
const edGeometry = require('../services/edGeometry/edGeometry-model');


const googleGeocodingApiKey = 'AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg';


// we need to update the db if there's nothing in it or if it's been more than a week
const updateEdDb = async () => {
  try {
    const oneDay = 1000*60*60*24;
    const oneWeek = oneDay*7;
    setTimeout(updateEdDb, oneDay);

    // get the first doc to check the date
    const topDoc = await edGeometry.findOne({});
    const expireTime = (topDoc !== null) ? topDoc.createdAt + oneWeek : 0;
    if (expireTime > Date.now()) throw 'No need to update ED geometry DB';

    const saveTo = 'downloads/Election_Districts.geojson';

    try {
      const geojsonFile = await download('https://data.cityofnewyork.us/api/geospatial/h2n3-98hq?method=export&format=GeoJSON');
      await fs.writeFileAsync(saveTo, geojsonFile);
    }
    catch (err) {
      // if the download fails, just rely on whatever we already have
      console.log('ED geojson download failed!');
    }

    const data = await fs.readFileAsync(saveTo);
    const parsed = JSON.parse(data).features.map((x) => {
      return {
        ad: Number(x.properties.elect_dist.slice(0, 2)),
        ed: Number(x.properties.elect_dist.slice(2)),
        geometry: {type: 'MultiPolygon', coordinates: x.geometry.coordinates}
      };
    });

    await edGeometry.insertMany(parsed);
    await edGeometry.deleteMany({createdAt: {$lt: expireTime}});

    console.log('Updated ED geometry DB');
  }
  catch (err) {
    console.log(err);
  }
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

router.get('/get_address', async (req, res, next) => {
  try {
    // TODO: add a backup geocoder
    const address = req.query.address;
    const uri = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + googleGeocodingApiKey;

    const data = await rp({uri: uri, json: true});
    const [lat, long] = [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng];
    const geomDoc = await edGeometry.findOne(intersectQuery([lat, long]));
    const [ad, ed] = [geomDoc.ad, geomDoc.ed];
    const members = await countyCommittee.find({assembly_district: ad, electoral_district: ed});

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
    console.log(err);
  }
});


router.get('/fusiontable', (req, res, next) => {
  res.render('fusiontable', {ad: req.query.ad, lat: req.query.lat, long: req.query.long});
});

module.exports = router;
