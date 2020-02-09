const express = require("express");
const router = express.Router();
const feathers = require("feathers");
const _ = require("lodash");
const bb = require("bluebird");
const co = bb.coroutine;
const fs = bb.promisifyAll(require("fs"));
const auth = require("feathers-authentication");
const CountyCommitteeModel = require("../services/county-committee/county-committee-model");
const PartyCallModel = require("../services/party-call/party-call-model");
const EnrollmentModel = require("../services/enrollment/enrollment-model");
const BlockModel = require("../services/block/block-model");

const countyCommitteeMember = require("../services/county-committee-member/county-committee-member-model");
const edGeometry = require("../services/edGeometry/edGeometry-model");
const page = require("../services/page/page-model");
const newsModel = require("../services/news-link/news-link-model");
const confirm = require("../services/invite/email-confirm");
const Address = require("../services/address");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });
const RSS = require("rss");
const getCountyCommitteeBreakdown = require("../utils/getCountyCommitteeBreakdown");

// Prevents crawlers from cralwer not on production
router.use("/robots.txt", function(req, res) {
  res.type("text/plain");

  if (process.env.NODE_ENV === "production") {
    res.send("User-agent: *\nAllow: /");
  } else {
    res.send("User-agent: *\nDisallow: /");
  }
});

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

/* GET home page. */
router.get("/", async function(req, res, next) {
  const announcement = await BlockModel.findOne({ alias: "announcement" });
  const hero = await BlockModel.findOne({ alias: "hero" });

  // Caching the output of the cc breakdowns
  // These don't change much
  let countySeatBreakdowns = cache.get("county-committee-breakdowns");

  if (!countySeatBreakdowns) {
    countySeatBreakdowns = [
      await getCountyCommitteeBreakdown("Kings", "Democratic"),
      await getCountyCommitteeBreakdown("Queens", "Democratic"),
      await getCountyCommitteeBreakdown("New York", "Democratic"),
      await getCountyCommitteeBreakdown("Bronx", "Democratic"),
      await getCountyCommitteeBreakdown("Richmond", "Democratic")
    ];

    cache.set("county-committee-breakdowns", countySeatBreakdowns);
  }
  res.render("index", {
    announcement: announcement ? announcement.content : "",
    hero: hero ? hero.content : "",
    countySeatBreakdowns: countySeatBreakdowns
  });
});

router.get("/:county-:party-county-committee/ad/:ad", function(req, res, next) {
  // For map seats.
  countyCommitteeMember
    .find({
      assembly_district: req.params.ad,
      county: { $regex: new RegExp("^" + req.params.county + " County$", "i") },
      party: { $regex: new RegExp("^" + req.params.party + "$", "i") }
    })
    .then(function(data) {
      const members = data.map(member => {
        return {
          ED: member.electoral_district,
          office: member.office,
          entry_type: member.entry_type,
          office_holder: member.office_holder,
          petition_number: member.petition_number,
          term_begins: member.term_begins.toLocaleString("en-US", {
            year: "2-digit",
            month: "numeric",
            day: "numeric"
          }),
          term_ends: member.term_ends.toLocaleString("en-US", {
            year: "2-digit",
            month: "numeric",
            day: "numeric"
          }),
          entry_type: member.entry_type
        };
      });
      let partyPositionsToBeFilled;
      const partyCallForEd = PartyCallModel.findOne({
        positions: {
          $elemMatch: {
            assembly_district: req.params.ad,
            party: { $regex: new RegExp(req.params.party, "i") }
          }
        },
        isApproved: true
      }).then(partyCallForAd => {
        if (partyCallForAd) {
          let partyPositions = partyCallForAd.positions.filter(position => {
            return position.assembly_district === parseInt(req.params.ad, 10);
          });

          if (partyPositions) {
            partyPositionsToBeFilled = partyPositions.map(function(position) {
              return {
                ED: position.electoral_district,
                office: position.office,
                term_begins: position.term_begins.toLocaleString("en-US", {
                  year: "2-digit",
                  month: "numeric",
                  day: "numeric"
                }),
                entry_type: "Petitionable Position"
              };
            });
          }
        }

        if (members.length) {
          res.render("seats", {
            ad: req.params.ad,
            party: members[0].party,
            members: members,
            partyPositionsToBeFilled: partyPositionsToBeFilled || []
          });
        } else {
          res.render("seats", {
            error: "No data for this district."
          });
        }
      });
    });
});

router.get("/get_address", function(req, res, next) {
  try {
    // For legacy urls set to Democratic
    const party = req.query.party || "Democratic";

    let addressSvc = new Address.Service();
    addressSvc
      .get(req.query.address, { party: party })
      .then(
        co(function*(addressDistrictData) {
          if (addressDistrictData.ad) {
            // @todo move this to feathers map service.
            const allGeomDocsInAd = yield edGeometry.find({
              ad: addressDistrictData.ad
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

                // For map seats.
                const memberDocs = yield countyCommitteeMember.find({
                  assembly_district: doc.ad,
                  electoral_district: doc.ed,
                  term_id: addressDistrictData.term._id
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
                  nf: numOfFilledSeats,
                  party: party
                };
              })
            );

            addressDistrictData.cleanedAllGeomDocsInAd = JSON.stringify(
              cleanedAllGeomDocsInAd
            );

            res.render("get_address", addressDistrictData);
          } else {
            const locals = {
              address: req.query.address,
              error: "No data for this district."
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

router.get(["/news/rss.xml"], async function(req, res, next) {
  newsModel
    .find({})
    .sort([["createdAt", -1]])
    .exec()
    .then(newsLinks => {
      var feed = new RSS({
        title: "County Committee in the News",
        description: "description",
        feed_url: `${req.app.get("protocol")}//${req.app.get(
          "host"
        )}/news/rss.xml`,
        site_url: `${req.app.get("protocol")}//${req.app.get("host")}`,
        image_url: `${req.app.get("protocol")}//${req.app.get(
          "host"
        )}/favicon.png`,
        language: "en",
        categories: ["Local Politics", "County Committee", "New York"],
        pubDate: Date.now(),
        ttl: "60",
        custom_namespaces: {},
        custom_elements: []
      });

      newsLinks.forEach(item => {
        feed.item({
          title: item.title,
          description: item.description,
          url: item.url, // link to the item
          guid: item.id, // optional - defaults to url
          categories: ["Local Politics", "County Committee", "New York"], // optional - array of item categories
          date: item.published_on, // any format that js Date can parse.
          enclosure: { url: item.image } // optional enclosure
        });
      });
      res.set("Content-Type", "text/xml");
      res.send(feed.xml());
    });
});

/* GET home page. */
router.get(["/news", "/news/:pageNum"], function(req, res, next) {
  let perPage = 20;
  let pageNum = req.params.pageNum;

  if (!pageNum) {
    pageNum = 0;
  }

  newsModel.count({ status: "published" }).then(function(count) {
    newsModel
      .find({ status: "published" })
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
  CountyCommitteeModel.findOne({
    alias: new RegExp(req.params.alias, "i")
  }).then(function(county_committee) {
    if (county_committee) {
      res.render("county-committee-page", {
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
