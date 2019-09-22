"use strict";

// certified-list-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ccMemberModelSchema = require("../county-committee-member/county-committee-member-model")
  .schema;

const converter = require("json-2-csv");

const certifiedListSchema = new Schema(
  {
    source: { type: String, required: false },
    positions: { type: Array },
    type: {
      type: String,
      enum: ["party_position_certified_list", "party_position_candidacy_list"]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
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

const certifiedListModel = mongoose.model(
  "certified-list",
  certifiedListSchema
);

module.exports = certifiedListModel;
