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
const ADPartMapModel = require("../ad-part-map/ad-part-map-model");

function* getCountySeatBreakdown(county) {
  return {
    county: county,
    numOfSeats: numOfSeats - numOfVacancies,
    numOfVacancies: numOfVacancies
  };
}

class Service {
  constructor(options) {
    this.options = options || {};
    this.googleGeocoder = NodeGeocoder(this.options.googleGeocoderOptions);
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(address, params = {}) {
    const party = params.party || "Democratic";

    const currentCountyCommitteeMapRelease = this.options
      .currentCountyCommitteeMapRelease;
    const upcomingCountyCommitteeMapRelease = this.options
      .upcomingCountyCommitteeMapRelease;

    const googleGeocoder = this.googleGeocoder;

    const get_address = co(function*(address) {
      const data = yield googleGeocoder.geocode(address);

      console.log(
        "data",
        upcomingCountyCommitteeMapRelease,
        currentCountyCommitteeMapRelease
      );

      if (data.length === 0) {
        throw new Error(
          "Invalid or out of bounds address provided. Non NYC addresses are not yet available."
        );
      }

      const [lat, long] = [data[0].latitude, data[0].longitude];
      const currentCCGeomDoc = yield edGeometry.findOne({
        geometry: {
          $geoIntersects: {
            $geometry: {
              // geojson expects its lat/long backwards (like long,lat)
              type: "Point",
              coordinates: [long, lat]
            }
          }
        },
        release: currentCountyCommitteeMapRelease
      });

      const upcomingCCGeomDoc = yield edGeometry.findOne({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [long, lat]
            }
          }
        },
        release: upcomingCountyCommitteeMapRelease
      });

      console.log("currentCCGeomDoc", currentCCGeomDoc);

      if (!currentCCGeomDoc) {
        throw new Error(
          `Invalid or out of bounds address provided. Non NYC addresses are not yet available. Current Map Release ${currentCCGeomDoc}`
        );
      }

      if (!upcomingCCGeomDoc) {
        throw new Error(
          `Invalid or out of bounds address provided. Non NYC addresses are not yet available. Upcoming Map Release ${upcomingCCGeomDoc}`
        );
      }

      const [legacyCCAD, legacyCCED] = [
        currentCCGeomDoc.ad,
        currentCCGeomDoc.ed
      ];

      const [upcomingCCAD, upcomingCCED] = [
        upcomingCCGeomDoc.ad,
        upcomingCCGeomDoc.ed
      ];

      console.log(
        `DISTRICT INFO LEGACY AD/ED: ${legacyCCAD}/${legacyCCED} NEW: AD/ED: ${upcomingCCAD}/${upcomingCCED} `
      );

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
      // NOTE: CC Members go by last district map which has been redrawn 2022.
      const yourMembers = yield countyCommitteeMember.find({
        assembly_district: legacyCCAD,
        electoral_district: legacyCCED,
        term_id: { $in: currentTermIds }
      });

      let county = "",
        term,
        part,
        partyPositionsToBeFilled,
        enrollment;

      const memberData = yield bb.map(
        yourMembers,
        co(function*(member) {
          if (!county) {
            county = member.county;
          }
          if (!part) {
            part = member.part;
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
            assembly_district: upcomingCCAD,
            electoral_district: upcomingCCED
          },
          null,
          { sort: { date: -1 } }
        ).exec();

        if (enrollment) {
          const SIG_REQ_PERCENTAGE = 0.05;
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
                assembly_district: upcomingCCAD,
                electoral_district: upcomingCCED
              }
            }
          })
          .exec();

        if (partyCallForEd) {
          let partyPositions = partyCallForEd.positions.filter(position => {
            return (
              position.assembly_district === upcomingCCAD &&
              position.electoral_district === upcomingCCED
            );
          });

          if (partyPositions) {
            let adPart = "";

            // Check for part mapping
            const adPartMapping = yield ADPartMapModel.findOne({
              term_id: { $in: upcomingTermIds },
              partMappings: {
                $elemMatch: {
                  assembly_district: upcomingCCAD,
                  electoral_district: upcomingCCED
                }
              }
            }).exec();

            if (adPartMapping) {
              let partMapping = adPartMapping.partMappings.find(partMapping => {
                return (
                  partMapping.assembly_district === upcomingCCAD &&
                  partMapping.electoral_district === upcomingCCED
                );
              });

              if (partMapping) {
                // There should be on
                adPart = partMapping.part;
              }
            }

            partyPositionsToBeFilled = partyPositions.map(function(position) {
              return {
                office: position.office,
                entry_type: "Petitionable Position",
                part: adPart
              };
            });
          }
        }
      }

      let result = {
        address: address,
        lat: lat,
        long: long,
        ad: upcomingCCAD,
        ed: upcomingCCED,
        legacyAD: legacyCCAD,
        legacyED: legacyCCED,
        part: part,
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

  const service = new Service({
    upcomingCountyCommitteeMapRelease: app.get("edGeometry").release,
    currentCountyCommitteeMapRelease: app.get("edGeometry").release,
    googleGeocoderOptions: {
      provider: "google",
      apiKey: app.get("googleMapsApiKey"),
      httpAdapter: "https",
      formatter: null
    }
  });

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
