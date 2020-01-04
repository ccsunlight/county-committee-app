"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const actionLogSchema = new Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String
    },
    message: {
      type: String
    },
    meta: { type: Schema.Types.Mixed }
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

// Workaround for mongo error with admin
// and sorting documents.
actionLogSchema.index({ createdAt: -1 });

const actionLog = mongoose.model("action-log", actionLogSchema);

module.exports = actionLog;
