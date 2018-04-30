"use strict";

const assert = require("assert");

describe("edGeometry service", function() {
  const app = require("../../../src/app");

  it("registered the edGeometries service", () => {
    assert.ok(app.service("edGeometries"));
  });
});
