"use strict";

const Sequelize = require("sequelize");

const sequelize = new Sequelize("foo", "postgres", "mysecretpassword", {
  dialect: "postgres",
  host: "host.docker.internal",
  port: 49153,
  logging: false
});

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const FooModel = sequelize.define(
  "foo",
  {
    text: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

// const fooSchema = new Schema(
//   {
//     status: {
//       type: String,
//       enum: ["draft", "published"],
//       default: "draft"
//     },
//     title: {
//       type: String
//     },
//     alias: {
//       type: String
//     },
//     content: {
//       type: String
//     }
//   },
//   {
//     toObject: {
//       virtuals: true
//     },
//     toJSON: {
//       virtuals: true
//     },
//     timestamps: true
//   }
// );

// const fooModel = sequelize.model("foo", fooSchema);

module.exports = FooModel;
