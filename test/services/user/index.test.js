"use strict";

const assert = require("assert");

describe("User service", function() {
  const app = require("../../../src/app");

  it("registered the users service", () => {
    const service = app.service(app.get("apiPath") + "/user");
    assert.ok(service);
  });
});
