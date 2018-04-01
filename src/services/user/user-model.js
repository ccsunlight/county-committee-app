'use strict';

// user-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  facebookId: { type: String },
  facebook: { type: Schema.Types.Mixed },
  googleId: { type: String },
  google: { type: Schema.Types.Mixed },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['admin', 'user', 'visitor'] },
  password: { type: String, required: true },
  firstname: { type: String, required: false },
  lastname: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.virtual('id').get(function() {
  return this._id;
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
