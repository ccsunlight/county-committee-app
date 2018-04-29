const express = require("express");
const router = express.Router();
const feathers = require("feathers");

const _ = require("lodash");
const bb = require("bluebird");
const co = bb.coroutine;
const fs = bb.promisifyAll(require("fs"));
const rp = require("request-promise");
const download = require("download");
//const NodeGeocoder = require('node-geocoder');
const serveStatic = require("feathers").static;
const auth = require("feathers-authentication");
const countyCommittee = require("../services/county-committee/county-committee-model");
const countyCommitteeMember = require("../services/county-committee-member/county-committee-member-model");
const edGeometry = require("../services/edGeometry/edGeometry-model");
const page = require("../services/page/page-model");
const news = require("../services/news-link/news-link-model");
const confirm = require("../services/invite/email-confirm");
const User = require("../services/user/user-model");
const Address = require("../services/address");

// Prevents crawlers from cralwer not on production

router.use("/robots.txt", function(req, res) {
  res.type("text/plain");

  if (process.env.NODE_ENV === "production") {
    res.send("User-agent: *\nAllow: /");
  } else {
    res.send("User-agent: *\nDisallow: /");
  }
});

/*
const googleGeocoderOptions = {
    provider: 'google',
    apiKey: 'AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg',
    httpAdapter: 'https',
    formatter: null
};

const googleGeocoder = NodeGeocoder(googleGeocoderOptions);
*/

router.use("/invite/confirm/:confirm_code", function(req, res, next) {
  confirm.confirmUser(req.params.confirm_code, function(registeredUser) {
    const Invite = require("../services/invite/invite-model");

    Invite.remove(
      {
        email: registeredUser.email
      },
      function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("invite deleted");
        }
      }
    );

    req.data = {
      strategy: "local",
      email: registeredUser.email,
      password: registeredUser.password
    };
    req.body = req.data;

    next();
  });
});

router.get(
  "/invite/confirm/:confirm_code",
  auth.express.authenticate("local", {
    successRedirect: "/cc-admin/#/profile",
    failureRedirect: "/cc-admin/"
  }),
  function(req, res) {
    res.send("ok time to make a password");
  }
);
/*
router.use('/invite/confirm/:confirm_code', function(req, res, next) {
   
    confirm.confirmUser(req.params.confirm_code, function(registeredUser) {
        console.log('result', registeredUser);
        req.body.email = registeredUser.email;
        req.body.username = registeredUser.email;
        req.body.password = registeredUser.password;

        req.data = { strategy: 'local', email: registeredUser.email, password:registeredUser.password }
        feathers().service('/authentication').create(req.data, { after: [next()]})
    });

});

router.get('/invite/confirm/:confirm_code',auth.express.authenticate('local', { successRedirect: '/cc-admin/#/county-committee', failureRedirect: '/cc-admin/fail' }))
*/

// we need to update the db if there's nothing in it or if it's been more than a week
const updateEdDb = co(function*() {
  try {
    const oneDay = 1000 * 60 * 60 * 24;
    const oneWeek = oneDay * 7;
    setTimeout(updateEdDb, oneDay);

    // get the first doc to check the date
    const topDoc = yield edGeometry.findOne({});
    const expireTime = topDoc !== null ? topDoc.createdAt + oneWeek : 0;
    if (expireTime > Date.now()) return;

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
      return {
        ad: Number(x.properties.elect_dist.slice(0, 2)),
        ed: Number(x.properties.elect_dist.slice(2)),
        geometry: {
          type: "MultiPolygon",
          coordinates: x.geometry.coordinates
        }
      };
    });

    yield edGeometry.insertMany(parsed);
    yield edGeometry.deleteMany({
      createdAt: {
        $lt: expireTime
      }
    });

    console.log("Updated ED geometry DB");
  } catch (err) {
    console.log(err);
  }
});
updateEdDb();

/* GET home page. */
router.get(
  "/",
  co(function*(req, res, next) {
    let numOfElected = yield countyCommitteeMember
      .find({
        county: "Kings County",
        entry_type: {
          $in: ["Elected", "Uncontested"]
        }
      })
      .count();

    let numOfVacancies = yield countyCommitteeMember
      .find({
        office_holder: "Vacancy",
        county: "Kings County"
      })
      .count();

    let numOfAppointed = yield countyCommitteeMember
      .find({
        entry_type: "Appointed",
        county: "Kings County"
      })
      .count();

    let countySeatBreakdowns = [
      {
        county: "Kings",
        numOfSeats: numOfElected + numOfVacancies + numOfAppointed,
        numOfElected: numOfElected,
        numOfVacancies: numOfVacancies,
        numOfAppointed: numOfAppointed
      }
    ];

    numOfElected = yield countyCommitteeMember
      .find({
        county: "Queens County",
        entry_type: {
          $in: ["Elected", "Uncontested"]
        }
      })
      .count();

    numOfVacancies = yield countyCommitteeMember
      .find({
        office_holder: "Vacancy",
        county: "Queens County"
      })
      .count();

    numOfAppointed = yield countyCommitteeMember
      .find({
        entry_type: "Appointed",
        county: "Queens County"
      })
      .count();

    countySeatBreakdowns.push({
      county: "Queens",
      numOfSeats: numOfElected + numOfVacancies + numOfAppointed,
      numOfElected: numOfElected,
      numOfVacancies: numOfVacancies,
      numOfAppointed: numOfAppointed
    });

    res.render("index", {
      countySeatBreakdowns: countySeatBreakdowns
    });
  })
);
/*
function* getCountySeatBreakdown(county) {



    console.log(numOfSeats, numOfVacancies);

    return {
        county: county,
        numOfSeats: numOfSeats - numOfVacancies,
        numOfVacancies: numOfVacancies
    }
};

const intersectQuery = (coordinates) => {
    return {
        geometry: {
            '$geoIntersects': {
                '$geometry': {
                    // geojson expects its lat/long backwards (like long,lat)
                    type: 'Point',
                    coordinates: coordinates.reverse()
                }
            }
        }
    };
};
*/

router.get("/get_address", function(req, res, next) {
  try {
    let addressSvc = new Address.Service();
    addressSvc
      .get(req.query.address)
      .then(
        co(function*(data) {
          if (data.ad >= 23 && data.ad <= 64) {
            // @todo move this to feathers map service.
            const allGeomDocsInAd = yield edGeometry.find({
              ad: data.ad
            });

            const cleanedAllGeomDocsInAd = yield bb.map(
              allGeomDocsInAd,
              co(function*(doc) {
                const singleEdCoords = yield bb.map(
                  doc.geometry.coordinates[0][0],
                  oneCoord => {
                    return {
                      lat: oneCoord[1],
                      lng: oneCoord[0]
                    };
                  }
                );
                const memberDocs = yield countyCommitteeMember.find({
                  assembly_district: doc.ad,
                  electoral_district: doc.ed
                });
                const filledDocs = _.filter(
                  memberDocs,
                  x => x.office_holder !== "Vacancy"
                );
                const numOfSeats = _.size(memberDocs);
                const numOfFilledSeats = _.size(filledDocs);

                return {
                  co: singleEdCoords,
                  ed: doc.ed,
                  ns: numOfSeats,
                  nf: numOfFilledSeats
                };
              })
            );

            data.cleanedAllGeomDocsInAd = JSON.stringify(
              cleanedAllGeomDocsInAd
            );
            res.render("get_address", data);
          } else {
            const locals = {
              address: req.query.address,
              error: "No data for this district.",
              new_district: true
            };
            res.render("get_address", locals);
          }
        })
      )
      .catch(function(error) {
        const locals = {
          address: req.query.address,
          error: error.message
        };
        res.render("get_address", locals);
      });
  } catch (err) {
    console.log("err no data");

    if (err.message === "Not in NYC")
      console.log("TODO: the address must be in NYC");
    else if (err.name === "HttpError")
      console.log("TODO: google geocoding service is currently down");
    else if (err.message === "Empty address")
      console.log("TODO: empty address entered");
    else if (err.message === "Bad address")
      console.log("TODO: bad address entered");
    else {
      // TODO: send to a general error page like 'something went wrong!'
      console.log(err);
    }

    const locals = {
      address: req.query.address,
      error: err.message,
      newDistrict: true
    };
    res.render("get_address", locals);
  }
});

/* GET home page. */
router.get(["/news", "/news/:pageNum"], function(req, res, next) {
  let perPage = 20;
  let pageNum = req.params.pageNum;

  if (!pageNum) {
    pageNum = 0;
  }

  news.count({}).then(function(count) {
    news
      .find({})
      .skip(perPage * pageNum)
      .limit(perPage)
      .sort({
        published_on: -1
      })
      .then(function(data) {
        let pagination = {
          page: pageNum,
          pageCount: Math.floor(count / perPage) - 1
        };

        if (pageNum < Math.floor(count / perPage) - 1) {
          pagination.hasNext = true;
        }

        if (data) {
          res.render("news", {
            news_links: data,
            pagination: pagination
          });
        } else {
          next();
        }
      });
  });
});

router.get("/counties/:alias", function(req, res, next) {
  countyCommittee
    .findOne({
      alias: new RegExp(req.params.alias, "i")
    })
    .then(function(county_committee) {
      if (county_committee) {
        res.render("county-committee-page", {
          foo: "bah",
          county: county_committee.county,
          party: county_committee.party,
          chairman: county_committee.chairman,
          county_committee: county_committee
        });
      } else {
        next();
      }
    });
});

/* GET home page. */
router.get(
  "/:page",
  co(function*(req, res, next) {
    let queryParams = {
      alias: req.params.page
    };

    if (req.query.preview !== "1") {
      queryParams.status = "published";
    }

    page.findOne(queryParams).then(function(data) {
      if (data) {
        res.render("page", data);
      } else {
        next();
      }
    });
  })
);

module.exports = router;
