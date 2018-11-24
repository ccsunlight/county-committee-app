"use strict";

// invite-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inviteSchema = new Schema(
  {
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, required: true, enum: ["admin", "user", "visitor"] },
    password: { type: String, required: false },
    GENERATED_VERIFYING_URL: { type: String, required: false }
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

const inviteModel = mongoose.model("invite", inviteSchema);

module.exports = inviteModel;
