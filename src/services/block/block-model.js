"use strict";

const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

const BlockSchema = {
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
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  mongo_id: {
    type: DataTypes.STRING
  }
};

function BlockModel(sequelizeClient) {
  const model = sequelizeClient.define(
    "blocks",
    { ...BlockSchema },
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

module.exports = BlockModel;
module.exports.BlockSchema = BlockSchema;
