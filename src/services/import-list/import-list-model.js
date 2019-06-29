"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ccMemberModelSchema = require("../county-committee-member/county-committee-member-model")
  .schema;
const importListSchema = new Schema(
  {
    source: { type: String, required: true, unique: true },
    // committee_id: { type: "ObjectId", ref: "CountyCommittee", required: true },
    term_id: {
      type: "ObjectId",
      ref: "term"
    },
    bulkFields: {
      type: Object
    },
    conditionals: {
      type: Object
    },
    upsert: {
      type: Boolean
    },
    approved: {
      type: Boolean
    },
    status: {
      type: String,
      enum: ["Draft", "Completed", "Failed"],
      default: "Draft"
    },
    members: [ccMemberModelSchema],
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

const importListModel = mongoose.model("import-list", importListSchema);

module.exports = importListModel;
