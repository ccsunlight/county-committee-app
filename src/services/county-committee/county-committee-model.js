"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countyCommitteeSchema = new Schema(
  {
    chairman: {
      type: String
    },
    party: {
      type: String,
      enum: ["Democratic", "Republican"],
      default: "Democratic"
    },
    url: {
      type: String
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    address: {
      type: String
    },

    county: {
      type: String,
      required: true
    },
    state: {
      type: String,
      enum: [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY"
      ],
      default: "NY"
    },
    party_rules: {
      type: String
    },
    alias: {
      type: String,
      required: true
    }
  },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    },
    timestamps: true
  }
);

countyCommitteeSchema.virtual("members", {
  ref: "county-committee-member", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "committee", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
  options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
});

countyCommitteeSchema.pre("findOne", function() {
  this.populate("members");
});

countyCommitteeSchema.virtual("id").get(function() {
  return this._id;
});

const countyCommitteeModel = mongoose.model(
  "county-committee",
  countyCommitteeSchema
);

module.exports = countyCommitteeModel;
