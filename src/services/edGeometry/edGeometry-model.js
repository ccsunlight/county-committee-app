"use strict";

// edGeometry-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const edGeometrySchema = new Schema(
  {
    type: { type: String, default: "Feature" },
    ad: { type: Number, required: true },
    ed: { type: Number, required: true },
    geometry: {
      type: { type: String, default: "MultiPolygon" },
      coordinates: { type: Array, required: true }
    },
    release: { type: String, default: false },
    kinked: { type: Boolean, default: false },
    createdAt: { type: Number, default: Date.now }
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

const edGeometryModel = mongoose.model("edGeometry", edGeometrySchema);

module.exports = edGeometryModel;
