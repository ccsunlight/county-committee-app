"use strict";

const assert = require("assert");
const app = require("../../../src/app");
const Facebook = require("fb").Facebook,
  FB = new Facebook();

console.log("hi");
describe("Social Service", function() {
  it("registered the social service", () => {
    var ccFacebookApp = FB.extend({
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN
    });

    const testUrl =
      "https://patch.com/new-york/jamaica/queens-county-democrats-petition-party-reforms";

    ccFacebookApp.api(
      "/ccsunlightproject/feed",
      "post",
      {
        link: testUrl,
        access_token: "FOO-" + process.env.FACEBOOK_ACCESS_TOKEN
      },
      function(res) {
        if (!res || res.error) {
          console.log(!res ? "error occurred" : res.error);
          return;
        }
        console.log("Post Id: " + res.id);
      }
    );
  });
});
