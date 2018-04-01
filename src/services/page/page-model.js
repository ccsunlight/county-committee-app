'use strict';

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pageSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    title: {
      type: String
    },
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

pageSchema.virtual('id').get(function() {
  return this._id;
});

const pageModel = mongoose.model('page', pageSchema);

module.exports = pageModel;
