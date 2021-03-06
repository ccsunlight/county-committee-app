"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adPartMap = new Schema(
  {
    source: { type: String, required: true },
    term_id: {
      type: "ObjectId",
      ref: "term"
    },
    approved: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["Draft", "Completed", "Failed"],
      default: "Draft"
    },
    importResults: {
      totalCount: {
        type: Number,
        default: 0
      },
      unmappedTermMembersCount: {
        type: Number,
        default: 0
      },
      failedCount: {
        type: Number,
        default: 0
      },
      pendingCount: {
        type: Number,
        default: 0
      },
      successCount: {
        type: Number,
        default: 0
      }
    },
    partMappings: [
      {
        part: {
          type: String,
          enum: ["A", "B", "C", "D", "E", "F"],
          required: true
        },
        assembly_district: { type: Number, required: true },
        electoral_district: { type: Number, required: true },
        status: {
          type: String,
          enum: ["Pending", "Success", "Failed"],
          default: "Pending"
        }
      }
    ],
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

const adPartMapModel = mongoose.model("ad-part-map", adPartMap);

module.exports = adPartMapModel;
