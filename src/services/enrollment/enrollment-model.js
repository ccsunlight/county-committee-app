"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    title: {
      type: String
    },
    registeredAsOf: { type: Date },
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

const enrollmentModel = mongoose.model("enrollment", enrollmentSchema);

module.exports = enrollmentModel;
