"use strict";

// candidacy-list-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const converter = require("json-2-csv");

const candidacyListSchema = new Schema(
  {
    source: { type: String, required: false },
    positions: { type: Array },
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

const candidacyListModel = mongoose.model(
  "candidacy-list",
  candidacyListSchema
);

module.exports = candidacyListModel;
