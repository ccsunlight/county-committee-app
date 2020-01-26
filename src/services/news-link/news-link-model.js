"use strict";

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsLinkSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    published_on: {
      type: Date
    },
    social_post_status: {
      type: String
    },
    post_to_social: {
      type: Boolean
    },
    title: {
      type: String
    },
    url: {
      type: String
    },
    image: {
      type: String
    },
    site_name: {
      type: String
    },
    description: {
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

const newsLinkModel = mongoose.model("news-link", newsLinkSchema);

module.exports = newsLinkModel;
