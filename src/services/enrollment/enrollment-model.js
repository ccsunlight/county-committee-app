"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema(
  {
    active: { democrat: { type: Number }, republican: { type: Number } },
    inactive: { democrat: { type: Number }, republican: { type: Number } },
    total: { democrat: { type: Number }, republican: { type: Number } },
    electoral_district: { type: Number, required: true },
    assembly_district: { type: Number, required: true },
    county: { type: String, required: true },
    date: { type: Date, required: true },
    source: { type: String, required: true },
    alias: {
      type: String
    },
    content: {
      type: String
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

enrollmentSchema.index({ electoral_district: 1, assembly_district: 1 });

const enrollmentModel = mongoose.model("enrollment", enrollmentSchema);

module.exports = enrollmentModel;
