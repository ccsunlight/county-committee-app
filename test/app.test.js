"use strict";

const assert = require("assert");
const request = require("request");
var mongoose = require("mongoose");
var db = mongoose.createConnection();
let app = require("../src/app");

describe("Feathers application tests", function() {
  let server;

  beforeEach(done => {
    server = app.listen(3030);
    server.once("listening", () => done());
  });
  // Clears collection after finishing all tests.
  afterEach(done => {
    server.close(err => {
      if (err) {
        throw err;
      }
      done();
    });
  });

  it("starts and shows the index page", function(done) {
    request("http://localhost:3030", function(err, res) {
      assert.ok(res.statusCode === 200);
      assert.ok(res.body.indexOf("<html") !== -1);
      done();
    });
  });

  describe("404", function() {
    it("shows a 404 HTML page", function(done) {
      request(
        {
          url: "http://localhost:3030/path/to/nowhere",
          headers: {
            Accept: "text/html"
          }
        },
        function(err, res, body) {
          assert.equal(res.statusCode, 404);
          assert.ok(body.indexOf("<html>") !== -1);
          done(err);
        }
      );
    });

    it("shows a 404 JSON error without stack trace", function(done) {
      request(
        {
          url: "http://localhost:3030/path/to/nowhere",
          json: true
        },
        function(err, res, body) {
          assert.equal(res.statusCode, 404);
          assert.equal(body.code, 404);
          assert.equal(body.message, "Page not found");
          assert.equal(body.name, "NotFound");
          done(err);
        }
      );
    });
  });
});
