"use strict";

const assert = require("assert");

describe("county-committee-member service", function() {
  const app = require("../../../src/app");

  it("registers the county-committee-member service", () => {
    const service = app.service(
      app.get("apiPath") + "/county-committee-member"
    );
    assert.ok(service);
  });
});
