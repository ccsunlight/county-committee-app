"use strict";

const handler = require("feathers-errors/handler");
const notFound = require("./not-found-handler");
const logger = require("./logger");

module.exports = function() {
  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  const app = this;

  app.use(notFound());
  app.use(logger(app));
  // Log the error
  app.use(function(err, req, res, next) {
    if (err.code == 401) {
      res.status(401).json({ message: "Authentication failed." });
    } else if (err.name === "ValidationError") {
      console.log("error", err);
      res.status(400).json({ ...err, status: 400 });
    }
  });

  app.use(handler());
};
