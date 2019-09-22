const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const partyPositionSchema = new Schema(
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
      part: ["A", "B", "C", "D"],
      default: "",
      required: false
    },
    ed_ad: {
      type: String,
      required: false
    },
    sex: {
      type: String,
      enum: ["Male", "Female", "Undefined"]
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
      required: false
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

const partyPositionModel = mongoose.model(
  "party-position",
  partyPositionSchema
);

module.exports = partyPositionModel;
