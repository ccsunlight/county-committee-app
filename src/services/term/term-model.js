"use strict";

// term-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const termSchema = new Schema(
  {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    committee_id: {
      type: "ObjectId",
      ref: "county-committee",
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

termSchema.virtual("party_call", {
  ref: "party-call",
  localField: "_id",
  foreignField: "term_id",
  justOne: true,
  options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
});

termSchema.virtual("committee", {
  ref: "county-committee",
  localField: "committee_id",
  foreignField: "_id",
  justOne: true,
  options: { sort: { _id: 1 } }
});

// Populate needs to be call in the pre hook
// to work properly
// @see https://stackoverflow.com/a/37536979
termSchema.pre("findOne", function() {
  this.populate("committee");
});

termSchema.pre("find", function() {
  this.populate("committee");
});

// Populate for "save" needs to be call in
// the post hook
termSchema.post("save", function(doc, next) {
  this.populate("committee")
    .execPopulate()
    .then(function() {
      next();
    });
});

const termModel = mongoose.model("term", termSchema);

module.exports = termModel;
