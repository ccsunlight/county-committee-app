"use strict";

const assert = require("assert");

describe("address service", function() {
  const app = require("../../../src/app");
  it("registered the addresses service", () => {
    const addressService = app.service(app.get("apiPath") + "/address");
    assert.ok(addressService);
  });
});
