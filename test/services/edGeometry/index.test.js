"use strict";

const assert = require("assert");

describe("ED Geometry service", function() {
  const app = require("../../../src/app");

  it("registered the edGeometries service", () => {
    assert.ok(app.service("edGeometries"));
  });
});
