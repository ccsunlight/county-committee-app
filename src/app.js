"use strict";

const dotenv = require("dotenv").config();
const path = require("path");
const serveStatic = require("feathers").static;
const compress = require("compression");
const cors = require("cors");
const feathers = require("feathers");
const configuration = require("feathers-configuration");
const globalHooks = require("./hooks");
const hooks = require("feathers-hooks");
const rest = require("feathers-rest");
const bodyParser = require("body-parser");
const local = require("feathers-authentication-local");
const jwt = require("feathers-authentication-jwt");
const auth = require("feathers-authentication");
const errors = require("feathers-errors");
const swagger = require("feathers-swagger");
const slugify = require("slugify");
const errorHandler = require("feathers-errors/handler");
// const acl = require('feathers-acl');
const middleware = require("./middleware");
const services = require("./services");
const routes = require("./routes");
const hbs = require("hbs");
const importEDGeometryGeoJSON = require("./utils/importEDGeometryGeoJSON");

const paginate = require("handlebars-paginate");
const app = feathers();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

hbs.registerHelper("if_eq", function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper("toLowerCase", function(str) {
  return str.toLowerCase();
});

hbs.registerHelper("slugify", function(str) {
  return slugify(str).toLowerCase();
});

hbs.registerHelper("decountySlug", function(str) {
  return slugify(str.replace("County", "")).toLowerCase();
});

hbs.registerHelper("dateFormat", require("handlebars-dateformat"));

hbs.registerHelper("paginate", paginate);

/**
 * Takes a array of Member model objects and maps
 * them to an array that can be consumed by the table
 * partial
 */
hbs.registerHelper("map_members", function(members) {
  return members.map(function(member) {
    return {
      ad: member.assembly_district,
      ed: member.electoral_district,
      part: member.part,
      office: member.office,
      entry_type: member.entry_type,
      office_holder: member.office_holder,
      petition_number: member.petition_number,
      entry_type: member.entry_type
    };
  });
});

app.configure(configuration(path.join(__dirname, "..")));

// Load DB settings
// MONGODB_URL overrides
app.set("mongodb", process.env.MONGODB_URL); // ? process.env.MONGODB_URL : "mongodb://" + process.env.DB_USER + ":" + process.env.DB_PASS + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME);

app.set(
  "apiPath",
  "/" + app.get("api").basePath + "/" + app.get("api").version
);

app.set("gmail_un", process.env.GMAIL_UN);
app.set("gmail_pw", process.env.GMAIL_PW);

const apiPath = app.get("apiPath");

// Site access auth for demo purposes
/*if (app.get('env') === 'production') {
  const basicAuth = require('basic-auth-connect');
  app.use(basicAuth(app.get('auth').site_access.username,app.get('auth').site_access.password));
}
*/

const aclConfig = app.get("acl");

const localConfig = {
  entity: "user",
  service: apiPath + "/user",
  usernameField: "email",
  passwordField: "password",
  payload: ["role"]
};

//console.log('https://' + app.get('host'));
//

app
  .use(compress())
  .configure(rest())
  /* .configure(acl(aclConfig, {
         denyNotAllowed: false,             // deny all routes without "allow" rules
         adminRoles: ['admin'],  // need for owner rule
         baseUrl: 'http://' + app.get('host'),
         jwt: {
           secret: 'supersecret',           // Default is 'Authorization'
           options: {}                     // options for 'jsonwebtoken' lib
         }
       })) */
  .configure(hooks())
  .use(bodyParser.json({ limit: "150mb" })) // Needed for large embedded arrays. @todo optimize requests such that this isn't necessary.
  .use(
    bodyParser.urlencoded({
      extended: true,
      limit: "150mb" // Needed for large embedded arrays. @todo optimize requests such that this isn't necessary.
    })
  )
  //.use(forceSSL)
  .configure(
    auth({
      path: apiPath + "/authentication",
      secret: app.get("authentication").secret,
      passReqToCallback: true
    })
  )
  .configure(local(localConfig))
  .configure(jwt(localConfig))
  .options("*", cors())
  .use(cors())
  .use(
    // Maps react directory to be served from cc-app.
    "/cc-admin/build/static",
    serveStatic(app.get("public") + "/cc-admin/build/static")
  )
  .use("/cc-admin", serveStatic(app.get("public") + "/cc-admin/build"))
  .configure(
    swagger({
      docsPath: apiPath + "/docs",
      prefix: /api\/v\d\//,
      versionPrefix: /v\d/,
      uiIndex: true,
      include: {
        tags: [],
        paths: ["api/v1/address"]
      },
      specs: {
        info: {
          title: "CC Sunlight API",
          description:
            "Endpoints for main entities. Some endpoints require auth. Most non write operations do not. These endpoints are not yet stable. Please use for dev purposes only."
        }
        // definitions: {
        //   paths: {
        //     "address/{fullAddress}": {
        //       get: {
        //         description:
        //           "Returns all pets from the system that the user has access to",
        //         responses: {
        //           "200": {
        //             description: "A list of pets."
        //           }
        //         }
        //       }
        //     }
        //   }
        // }
      }
    })
  )
  .configure(services)
  .use(routes)
  .use("/", serveStatic(app.get("public")))
  .configure(middleware)
  .configure(local(localConfig));

app.service(apiPath + "/authentication").hooks({
  before: {
    create: [auth.hooks.authenticate(["jwt", "local"])],
    remove: [auth.hooks.authenticate("jwt")]
  }
});

app.service(apiPath + "/authentication").hooks({
  after: {
    create: [globalHooks.logAction],
    remove: [globalHooks.logAction]
  }
});

app.service(apiPath + "/user").hooks({
  before: {
    all: [local.hooks.hashPassword(), auth.hooks.authenticate("jwt")]
  }
});

app.service(apiPath + "/county-committee-member").hooks({
  before: {
    all: [local.hooks.hashPassword(), auth.hooks.authenticate("jwt")]
  }
});

app.service(apiPath + "/import-list").hooks({
  before: {
    all: [local.hooks.hashPassword(), auth.hooks.authenticate("jwt")]
  }
});

app.service(apiPath + "/ad-part-map").hooks({
  before: {
    all: [local.hooks.hashPassword(), auth.hooks.authenticate("jwt")]
  }
});

app.service(apiPath + "/certified-list").hooks({
  before: {
    all: [local.hooks.hashPassword(), auth.hooks.authenticate("jwt")]
  }
});

app.service(apiPath + "/term").hooks({
  before: {
    all: [local.hooks.hashPassword(), auth.hooks.authenticate("jwt")]
  }
});

if (app.get("edGeometry").importOnStart === "true") {
  console.log("Importing ED Geomtry GeoJSON");
  importEDGeometryGeoJSON({
    release: app.get("edGeometry").release,
    geojsonFileUrl: app.get("edGeometry").geojsonFileUrl
  });
} else {
  console.log("ED Geomtry GeoJSON import on start disabled. Skipping");
}

console.log("Starting env: ", app.get("env"));

module.exports = app;
