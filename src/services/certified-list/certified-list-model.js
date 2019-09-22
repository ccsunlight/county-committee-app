"use strict";

// certified-list-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const partyPositionSchema = require("./party-position-model").schema;

const certifiedListSchema = new Schema({
  county: { type: String, required: false },
  source: { type: String, required: true },
  positions: [partyPositionSchema],
  isImported: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const certifiedListModel = mongoose.model(
  "certified-list",
  certifiedListSchema
);

module.exports = certifiedListModel;
