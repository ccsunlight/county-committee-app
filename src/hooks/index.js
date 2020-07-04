"use strict";

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

const util = require("util");
const winston = require("winston");
const user = require("../services/user/user-model");

require("winston-mongodb");

exports.myHook = function(options) {
  return function(hook) {
    logger.info("My custom global hook ran. Feathers is awesome!");
  };
};

var MongooseLogger = (winston.transports.MongooseLogger = function(options) {
  this.name = "mongooseLogger";

  options = options || {};

  this.level = options.level || "info";
  this.collection_name = options.collection_name || "action-log";
});

util.inherits(MongooseLogger, winston.Transport);
let LogModel = require("../services/action-log/action-log-model");
MongooseLogger.prototype.log = function(level, message, metadata, callback) {
  // @todo convert to postgres
  // let Log = new LogModel(app.get("sequelizeClient"));
  // var entry = new Log({
  //   level: level,
  //   message: message,
  //   meta: metadata
  // });
  // entry.save(function(err) {
  //   return callback(err, true);
  // });
};

const logger = new winston.Logger({
  level: "info",
  transports: [
    new winston.transports.MongooseLogger({
      level: "info"
    })
  ]
});

exports.logAction = function(hook) {
  let user;
  if (hook.params.user) {
    user = hook.params.user;
  } else {
    user = {
      email: "anonymous",
      id: ""
    };
  }

  var logObject;

  switch (hook.path) {
    case "api/v1/authentication":
      logObject = {
        user: user.email,
        user_id: user.id,
        type: "authentication",
        description: "Login" // @todo add data changing
      };

      break;
    default:
      logObject = {
        user: user.email,
        user_id: user.id,
        type: hook.service.Model.modelName,
        description: JSON.stringify(hook.result) // @todo change to diff data changing
      };
      break;
  }

  logger.log("info", hook.method, {
    user: logObject.user,
    type: logObject.type,
    description: logObject.description
  });
};
