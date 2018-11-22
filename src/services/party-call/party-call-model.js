"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ccMemberModelSchema = require("../county-committee-member/county-committee-member-model")
  .schema;
const partyCallSchema = new Schema({
  county: { type: String, required: true },
  party: { type: String, required: true },
  source: { type: String, required: true },
  committee_id: { type: "ObjectId", ref: "CountyCommittee", required: true },
  positions: [ccMemberModelSchema],
  isApproved: { type: Boolean, default: false },
  isImported: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const partyCallModel = mongoose.model("party-call", partyCallSchema);

module.exports = partyCallModel;
