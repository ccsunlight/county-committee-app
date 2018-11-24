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
      ref: "CountyCommittee",
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

// termSchema.virtual("id").get(function() {
//   return this._id;
// });

termSchema.virtual("party_call", {
  ref: "party-call",
  localField: "_id",
  foreignField: "term_id",
  justOne: true,
  options: { sort: { _id: 1 } } // Query options, see http://bit.ly/mongoose-query-options
});

termSchema.set("toJSON", { getters: true, virtuals: true });

termSchema.set("toObject", { getters: true, virtuals: true });

const termModel = mongoose.model("term", termSchema);

module.exports = termModel;
