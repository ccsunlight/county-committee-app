"use strict";

const assert = require("assert");

describe("county-committee service", function() {
  const app = require("../../../src/app");

  it("registered the county-committees service", () => {
    const service = app.service(app.get("apiPath") + "/address");
    assert.ok(service);
  });
});
