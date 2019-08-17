"use strict";

var RSS = require("rss");
var parser = require("fast-xml-parser");
const assert = require("assert");
const app = require("../../../src/app");

describe("News Link", function() {
  const newLinkService = app.service(app.get("apiPath") + "/news-link");
  it("registered the news link service", () => {
    assert.ok(newLinkService);
  });

  it("can get the latest news articles", async () => {
    const newsLinks = await newLinkService.find({});
    assert.ok(newsLinks);
    assert.ok(newsLinks.data);
    assert.ok(newsLinks.data.length > 0);
  });

  it("can generate an RSS feed", async () => {
    const newsLinks = await newLinkService.find({});
    assert.ok(newsLinks);
    assert.ok(newsLinks.data);

    /* lets create an rss feed */
    var feed = new RSS({
      title: "County Committee in the News",
      description: "description",
      feed_url: "/news/rss.xml",
      site_url: "http://ccsunlight.org",
      image_url: "http://example.com/icon.png",
      language: "en",
      categories: ["Category 1", "Category 2", "Category 3"],
      pubDate: "May 20, 2012 04:00:00 GMT",
      ttl: "60",
      custom_namespaces: {},
      custom_elements: []
    });

    newsLinks.data.forEach(item => {
      feed.item({
        title: item.title,
        description: item.description,
        url: item.url, // link to the item
        guid: "1123", // optional - defaults to url
        categories: ["Local Politics", "County Committee", "New York"], // optional - array of item categories
        author: "Guest Author", // optional - defaults to feed author property
        date: item.published_on, // any format that js Date can parse.

        enclosure: { url: item.image } // optional enclosure
      });
    });

    assert.ok(parser.validate(feed.xml()));
  });
});
