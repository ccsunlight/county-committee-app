"use strict";

const assert = require("assert");
const app = require("../../../src/app");

describe("term service", function() {
  it("registered the terms service", () => {
    assert.ok(app.service(app.get("apiPath") + "/term"));
  });
});
