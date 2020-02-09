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
const EnrollmentModel = require("../enrollment/enrollment-model");
const Term = require("../term/term-model");
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

      if (data.length === 0) {
        throw new Error(
          "Invalid or out of bounds address provided. Non NYC addresses are not yet available."
        );
      }

      const [lat, long] = [data[0].latitude, data[0].longitude];
      const yourGeomDoc = yield edGeometry.findOne(intersectQuery([lat, long]));

      if (!yourGeomDoc) {
        throw new Error(
          "Invalid or out of bounds address provided. Non NYC addresses are not yet available."
        );
      }

      const [ad, ed] = [yourGeomDoc.ad, yourGeomDoc.ed];

      // Get the party committees for the specfied party
      const partyCommittees = yield countyCommittee.find({ party: party });
      const partyCommitteeIds = partyCommittees.map(function(committee) {
        return committee._id;
      });

      // const enrollment = yield EnrollmentModel.findOne({
      //   assembly_district: ad,
      //   electoral_district: ed,
      //   term_id: { $in: upcomingTermIds }
      // }).exec();

      // console.log("enrollment", enrollment);

      // Get the current active terms for the user's party

      const currentTerms = yield Term.find({
        end_date: { $gt: new Date() },
        committee_id: { $in: partyCommitteeIds }
      }).lean();

      const currentTermIds = currentTerms.map(function(term) {
        return term._id;
      });

      // Gets members who match the ed and ad and are in an active term
      const yourMembers = yield countyCommitteeMember.find({
        assembly_district: ad,
        electoral_district: ed,
        term_id: { $in: currentTermIds }
      });

      let county = "",
        term,
        partyPositionsToBeFilled,
        enrollment;

      const memberData = yield bb.map(
        yourMembers,
        co(function*(member) {
          if (!county) {
            county = member.county;
          }
          if (!term) {
            term = yield Term.findOne({
              _id: member.term_id
            }).lean();
          }
          return {
            office: member.office,
            entry_type: member.entry_type,
            office_holder: member.office_holder,
            petition_number: member.petition_number,
            entry_type: member.entry_type
          };
        })
      );

      const upcomingTermIds = partyCommittees.map(partyCommittee => {
        return partyCommittee.upcoming_term_id;
      });

      if (upcomingTermIds.length) {
        enrollment = yield EnrollmentModel.findOne(
          {
            assembly_district: ad,
            electoral_district: ed
          },
          null,
          { sort: { date: -1 } }
        ).exec();

        if (enrollment) {
          const SIG_REQ_PERCENTAGE = 0.03;
          enrollment.demSignaturePercentage = Math.ceil(
            enrollment.active.democrat * SIG_REQ_PERCENTAGE
          );
          enrollment.repSignaturePercentage = Math.ceil(
            enrollment.active.republican * SIG_REQ_PERCENTAGE
          );
        }

        const partyCallForEd = yield partyCall
          .findOne({
            term_id: { $in: upcomingTermIds },
            positions: {
              $elemMatch: {
                assembly_district: ad,
                electoral_district: ed
              }
            }
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
                entry_type: "Petitionable Position"
              };
            });
          }
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
        party: party,
        enrollment: enrollment,
        term: { ...term, party_call: null }
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

  const service = new Service();

  service.id = "fullAddress";
  service.docs = {
    description: "Service to manage projects",

    definitions: {
      operations: {
        get: {
          operationId: "fullAddress",
          description:
            "Returns all pets from the system that the user has access to",
          responses: {
            "200": {
              description: "A list of pets."
            }
          },
          parameters: [
            {
              name: "fullAddress",
              in: "path",
              description: "ID of pet that needs to be updated",
              required: true,
              schema: {
                type: "string"
              }
            }
          ]
        }
      }
    }
  };
  // Initialize our service with any options it requires
  app.use(app.get("apiPath") + "/address", service);

  // Get our initialize service to that we can bind hooks
  const addressService = app.service(app.get("apiPath") + "/address");

  // Set up our before hooks
  addressService.before(hooks.before);

  // Set up our after hooks
  addressService.after(hooks.after);
};

module.exports.Service = Service;
