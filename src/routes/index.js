const express = require('express');
const router = express.Router();

const _ = require('lodash');
const bb = require('bluebird');
const co = bb.coroutine;
const fs = bb.promisifyAll(require('fs'));
const rp = require('request-promise');
const download = require('download');
const NodeGeocoder = require('node-geocoder');
const serveStatic = require('feathers').static;


const countyCommittee = require('../services/county-committee/county-committee-model');
const edGeometry = require('../services/edGeometry/edGeometry-model');
const page = require('../services/page/page-model');

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
router.get('/', co(function*(req, res, next) {
  const numOfSeats = yield countyCommittee.find({}).count();
  const numOfVacancies = yield countyCommittee.find({office_holder: 'Vacancy'}).count();

  res.render('index', {numOfFilledSeats: numOfSeats - numOfVacancies, numOfVacancies: numOfVacancies});
}));

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
    const yourGeomDoc = yield edGeometry.findOne(intersectQuery([lat, long]));
    if (! yourGeomDoc) throw new Error('Not in NYC');

    const [ad, ed] = [yourGeomDoc.ad, yourGeomDoc.ed];
    const yourMembers = yield countyCommittee.find({assembly_district: ad, electoral_district: ed});

    const allGeomDocsInAd = yield edGeometry.find({ad: ad});

    const cleanedAllGeomDocsInAd = yield bb.map(allGeomDocsInAd, co(function*(doc) {
      const singleEdCoords = yield bb.map(doc.geometry.coordinates[0][0], oneCoord => {
        return {lat: oneCoord[1], lng: oneCoord[0]}
      });

      const memberDocs = yield countyCommittee.find({assembly_district: doc.ad, electoral_district: doc.ed});
      const filledDocs = _.filter(memberDocs, x => x.office_holder !== 'Vacancy');
      const numOfSeats = _.size(memberDocs);
      const numOfFilledSeats = _.size(filledDocs);

      return {
        co: singleEdCoords,
        ed: doc.ed,
        ns: numOfSeats,
        nf: numOfFilledSeats
      };
    }));

    const memberData = yield bb.map(yourMembers, co(function*(member) {
      return {
        office: member.office,
        entry_type: member.entry_type,
        office_holder: member.office_holder,
        petition_number: member.petition_number,
        entry_type: member.entry_type
      }
    }));


    const locals = {
      address: address,
      lat: lat,
      long: long,
      ad: ad,
      ed: ed,
      members: memberData,
      cleanedAllGeomDocsInAd: JSON.stringify(cleanedAllGeomDocsInAd)
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

    const locals = {
      address: req.query.address,
      error: err.message
    };
    res.render('get_address', locals);

  }
}));


router.get('/county-committee/:county', co(function*(req, res, next) {

    const members = yield countyCommittee.find({ county: new RegExp(req.params.county, "i") });
    console.log(members[0].toObject());

    const memberData = yield bb.map(members, co(function*(member) {
      return {
        ed: member.electoral_district,
        ad: member.assembly_district,
        office: member.office,
        entry_type: member.entry_type,
        office_holder: member.office_holder,
        county: member.county,
        petition_number: member.petition_number,
        entry_type: member.entry_type
      }
    }));

    // console.log(memberData);

    res.render('table', { membersJSON: JSON.stringify(memberData.slice(50)), members: memberData.slice(0,50)});

}));


/* GET home page. */
router.get('/:page', co(function*(req, res, next) {
  page.findOne({ 'alias': req.params.page}).then(function(data) {
    if (data) {
       res.render('page', data);
    } else {
      next();
    }
    
  });
}));



module.exports = router;
