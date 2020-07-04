"use strict";

const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;
const ActionLogSchema = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  level: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.STRING
  },
  meta: { type: DataTypes.JSONB },
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

function ActionLogModel(sequelizeClient) {
  const model = sequelizeClient.define(
    "action-logs",
    { ...ActionLogSchema },
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

// const fooModel = sequelize.model("foo", fooSchema);
module.exports = ActionLogModel;
module.exports.ActionLogSchema = ActionLogSchema;

// // Workaround for mongo error with admin
// // and sorting documents.
// actionLogSchema.index({ createdAt: -1 });
