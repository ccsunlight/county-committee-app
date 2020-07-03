// "use strict";

// // county-committee-model.js - A mongoose model
// //
// // See http://mongoosejs.com/docs/models.html
// // for more of what you can do here.

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const pageSchema = new Schema(
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

// const pageModel = mongoose.model("page", pageSchema);

// module.exports = pageModel;

"use strict";

const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

const sequelize = new Sequelize("foo", "postgres", "mysecretpassword", {
  dialect: "postgres",
  host: "host.docker.internal",
  port: 49153,
  logging: false
});

const PageSchema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true
  },
  status: {
    type: DataTypes.STRING,
    enum: ["draft", "published"],
    default: "draft"
  },
  title: {
    type: DataTypes.STRING
  },
  alias: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE
  },
  updatedAt: {
    type: DataTypes.DATE
  },
  mongo_id: {
    type: DataTypes.STRING,
    unique: true
  }
};

// county-committee-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const PageModel = sequelize.define(
  "pages",
  { ...PageSchema },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    },
    timestamps: true,
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
module.exports = PageModel;
module.exports.PageSchema = PageSchema;
