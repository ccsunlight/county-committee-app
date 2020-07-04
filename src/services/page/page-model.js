"use strict";

const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;
const PageSchema = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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

function PageModel(sequelize) {
  const model = sequelize.define(
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

  return model;
}

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
