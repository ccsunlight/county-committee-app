"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ccMemberModelSchema = require("../county-committee-member/county-committee-member-model")
  .schema;
const partyCallSchema = new Schema({
  source: { type: String, required: true },
  committee_id: { type: "ObjectId", ref: "CountyCommittee", required: true },
  // term_id: {
  //   type: "ObjectId",
  //   ref: "Term"
  // },
  positions: [ccMemberModelSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const partyCallModel = mongoose.model("party-call", partyCallSchema);

module.exports = partyCallModel;
