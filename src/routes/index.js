const express = require('express');
const router = express.Router();

const _ = require('lodash');
const Client = require('node-rest-client').Client;
const client = new Client();
const countyCommittee = require('../services/county-committee/county-committee-model')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Index'});
});


// TODO add error handling
// TODO add https


const getLatLongFromAddress = (address, cb) => {
  const apiKey = "AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg";
  const url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + apiKey;

  client.get(url, function (data, response) {
    // console.log(data);
    const lat = data.results[0].geometry.location.lat;
    const long = data.results[0].geometry.location.lng;
    cb(lat, long);
  });
};

const getDistrictInfoFromLatLong = (lat, long, cb) => {
  // TODO server-side PIP query to mongodb
  const ad = 44;
  const ed = 1;

  countyCommittee.find({assembly_district: ad, electoral_district: ed})
  .then((members) => {
    cb(ad, ed, members);
  })
};


router.get('/get_address', (req, res, next) => {
  getLatLongFromAddress(req.query.address, (lat, long) => {
    getDistrictInfoFromLatLong(lat, long, (ad, ed, members) => {
      res.render('get_address', {
        address: req.query.address,
        lat: lat,
        long: long,
        ad: 44,
        ed: 1,
        members: members,
        title: 'Address Search...'
      });
    });
  });
});


router.get('/fusiontable', function(req, res, next) {
  res.render('fusiontable', {ad: req.query.ad, lat: req.query.lat, long: req.query.long});
});

module.exports = router;
