"use strict";

const assert = require("assert");

describe("Invite Service", function() {
  const app = require("../../../src/app");

  it("registered the invites service", () => {
    const service = app.service(app.get("apiPath") + "/invite");
    assert.ok(service);
  });
});
