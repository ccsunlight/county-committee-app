"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countyCommitteeMemberSchema = new Schema(
  {
    petition_number: {
      type: Number
    },
    office: {
      type: String,
      required: true
    },
    office_holder: {
      type: String,
      required: true
    },
    address: {
      type: String
    },
    tally: {
      type: Number
    },
    entry_type: {
      type: String,
      required: true
    },
    part: {
      type: String,
      part: [null, "A", "B", "C", "D"],
      default: null,
      required: false
    },
    ed_ad: {
      type: String,
      required: false
    },
    sex: {
      type: String,
      enum: ["Male", "Female", null],
      default: null
    },
    electoral_district: {
      type: Number,
      required: true
    },
    assembly_district: {
      type: Number,
      required: true
    },
    party: {
      type: String,
      enum: ["Democratic", "Republican"]
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
    data_source: {
      type: String,
      required: false
    },
    import_list_id: {
      type: Schema.Types.ObjectId,
      ref: "import_list",
      required: false
    },
    committee: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "county-committee"
    },
    term_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "term"
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

const countyCommitteeMemberModel = mongoose.model(
  "county-committee-member",
  countyCommitteeMemberSchema
);

module.exports = countyCommitteeMemberModel;
