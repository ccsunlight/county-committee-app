"use strict";
const service = require("feathers-mongoose");

const _ = require("lodash");
const bb = require("bluebird");
const co = bb.coroutine;
const fs = bb.promisifyAll(require("fs"));
const rp = require("request-promise");
const countyCommittee = require("../county-committee/county-committee-model");
const countyCommitteeMember = require("../county-committee-member/county-committee-member-model");
const partyCall = require("../party-call/party-call-model");
const edGeometry = require("../edGeometry/edGeometry-model");

const hooks = require("./hooks");
const NodeGeocoder = require("node-geocoder");

const googleGeocoderOptions = {
  provider: "google",
  apiKey: "AIzaSyBWT_tSznzz1oSNXAql54sSKGIAC4EyQGg",
  httpAdapter: "https",
  formatter: null
};

const googleGeocoder = NodeGeocoder(googleGeocoderOptions);

function* getCountySeatBreakdown(county) {
  return {
    county: county,
    numOfSeats: numOfSeats - numOfVacancies,
    numOfVacancies: numOfVacancies
  };
}

const intersectQuery = coordinates => {
  return {
    geometry: {
      $geoIntersects: {
        $geometry: {
          // geojson expects its lat/long backwards (like long,lat)
          type: "Point",
          coordinates: coordinates.reverse()
        }
      }
    }
  };
};

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(address, params = {}) {
    const party = params.party || "Democratic";
    const get_address = co(function*(address) {
      const data = yield googleGeocoder.geocode(address);
      if (!data[0]) throw new Error("Bad address");
      const [lat, long] = [data[0].latitude, data[0].longitude];
      const yourGeomDoc = yield edGeometry.findOne(intersectQuery([lat, long]));
      if (!yourGeomDoc) throw new Error("Not in NYC");

      const [ad, ed] = [yourGeomDoc.ad, yourGeomDoc.ed];
      const yourMembers = yield countyCommitteeMember.find({
        assembly_district: ad,
        electoral_district: ed,
        party: party
      });
      let county = "",
        partyPositionsToBeFilled;

      const memberData = yield bb.map(
        yourMembers,
        co(function*(member) {
          if (!county) {
            county = member.county;
          }
          return {
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
        })
      );

      const partyCallForEd = yield partyCall
        .findOne({
          positions: {
            $elemMatch: {
              assembly_district: ad,
              electoral_district: ed,
              party: party
            }
          },
          isApproved: true
        })
        .exec();

      if (partyCallForEd) {
        let partyPositions = partyCallForEd.positions.filter(position => {
          return (
            position.assembly_district === ad &&
            position.electoral_district === ed
          );
        });

        if (partyPositions) {
          partyPositionsToBeFilled = partyPositions.map(function(position) {
            return {
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

      let result = {
        address: address,
        lat: lat,
        long: long,
        ad: ad,
        ed: ed,
        county: county,
        members: memberData,
        partyPositionsToBeFilled: partyPositionsToBeFilled || [],
        party: party
      };

      return result;
    });

    return Promise.resolve(get_address(address));
  }

  create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update(id, data, params) {
    return Promise.resolve(data);
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({
      id
    });
  }
}

module.exports = function() {
  const app = this;

  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/address", new Service());

  // Get our initialize service to that we can bind hooks
  const addressService = app.service(app.get("apiPath") + "/address");

  // Set up our before hooks
  addressService.before(hooks.before);

  // Set up our after hooks
  addressService.after(hooks.after);
};

module.exports.Service = Service;
