"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boeElectionResultsSchema = new Schema(
  {
    published_on: {
      type: Date
    },
    title: {
      type: String
    },
    url: {
      type: String,
      required: true
    },
    tableSelector: {
      type: String,
      required: true
    },
    tableHeaderSelector: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    results: {
      type: Array,
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

const boeElectionResultsModel = mongoose.model(
  "boe-election-results",
  boeElectionResultsSchema
);

module.exports = boeElectionResultsModel;
