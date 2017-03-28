var express = require('express');
var router = express.Router();

var _ = require('lodash');
var Client = require('node-rest-client').Client;
var client = new Client();
var countyCommittee = require('../services/county-committee/county-committee-model')


var FUSIONTABLES_APIKEY = "AIzaSyDSNEqr9T9c4K-I8qnCcXB4Zc1no3ruPp4";
var GEOCODING_APIKEY = "AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg";


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Index'});
});



// TODO add error handling
// TODO add https
// TODO add code minimizing


var getInfoFromLatLong = function(lat, long, cb) {
  var tableNum = "11jgsAPWJLHQn83d5CAteQeD4KeBv1Dci0HNXpKXv";
  var url = "https://www.googleapis.com/fusiontables/v2/query?key=" + FUSIONTABLES_APIKEY + "&sql=SELECT elect_dist FROM " + tableNum + " WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(" + lat + ", " + long + "), 0.05))";

  client.get(url, function (data, response) {
    // console.log(data);
    var raw = data.rows[0][0];
    var ad = Number(_.join(_.slice(raw, 0, 2), ''));
    var ed = Number(_.join(_.slice(raw, 2), ''));

    cb(lat, long, ad, ed)
  });
};

var getInfoFromAddress = function(address, cb) {
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + GEOCODING_APIKEY;

  client.get(url, function (data, response) {
    // console.log(data);
    var lat = data.results[0].geometry.location.lat;
    var long = data.results[0].geometry.location.lng;
    getInfoFromLatLong(lat, long, cb);
  });
};


router.get('/get_address', function(req, res, next) {
  res.render('get_address', {address: req.query.address, title: 'Address Search...'});
});

router.get('/get_json_stuff', function(req, res, next) {
  if (_.isEmpty(req.query.address)) {
    // TODO Display an error message
  }
  else {
    getInfoFromAddress(req.query.address, function(lat, long, ad, ed) {


      countyCommittee.find({ assembly_district:ad, electoral_district: ed}).then(function(members) {

          console.log(members);
          res.send({items:[{lat: lat, long: long, ad: ad, ed: ed, members: members}]});

      })
    
    });
  }
});

router.get('/fusiontable', function(req, res, next) {
  res.render('fusiontable', {ad: req.query.ad, lat: req.query.lat, long: req.query.long});
});

module.exports = router;
