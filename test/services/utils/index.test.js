"use strict";

const assert = require("assert");
const app = require("../../../src/app");

describe("utils service", function() {
  it("registered the utils service", () => {
    assert.ok(app.service("utils"));
  });
});
