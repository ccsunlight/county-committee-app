"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TermModel = require("../term/term-model");

// var termSchema = new Schema({
//   start_date: { type: Date, required: true },
//   end_date: { type: Date, required: true }
// });

// termSchema.virtual("party_call", {
//   ref: "party-call",
//   localField: "_id",
//   foreignField: "term_id",
//   justOne: true,
//   options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
// });

// termSchema.pre("findOne", function() {
//   this.populate("party_call");
// });

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
    current_term_id: {
      type: "ObjectId",
      ref: "term"
    },
    upcoming_term_id: {
      type: "ObjectId",
      ref: "term"
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
  localField: "current_term_id", // Find people where `localField`
  foreignField: "term_id", // is equal to `foreignField`
  justOne: false,
  options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
});

countyCommitteeSchema.virtual("party_call", {
  ref: "party-call",
  localField: "_id",
  foreignField: "committee_id",
  justOne: true,
  options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
});

countyCommitteeSchema.virtual("terms", {
  ref: "term",
  localField: "_id",
  foreignField: "committee_id",
  justOne: false,
  options: { sort: { _id: -1 } } // Query options, see http://bit.ly/mongoose-query-options
});

countyCommitteeSchema.virtual("current_term", {
  ref: "term",
  localField: "current_term_id",
  foreignField: "_id",
  justOne: true
});

countyCommitteeSchema.virtual("upcoming_term", {
  ref: "term",
  localField: "upcoming_term_id",
  foreignField: "_id",
  justOne: true
});

countyCommitteeSchema.pre("findOne", function() {
  this.populate("party_call"); // @deprecated
  this.populate("terms");
  this.populate("members");
  this.populate("current_term");
  this.populate("upcoming_term");
});

// @todo
// Pre and post hooks don't work together.
// Need to get the post hook to pull the latest term
// so that the county committee will automatically display
// the latest members.
//

// countyCommitteeSchema.post("findOne", async function(doc) {

//   doc.populate({
//     path: 'members',
//     match: { term_id: {  $in: doc.terms.slice(0,1) }}, // Get the latest term's members only
//    // match: { term_id: {  $ne: null }},
//     options: { limit: 100 }
//   });
//   await doc.execPopulate();
//   debugger;
// });

const countyCommitteeModel = mongoose.model(
  "county-committee",
  countyCommitteeSchema
);

module.exports = countyCommitteeModel;
