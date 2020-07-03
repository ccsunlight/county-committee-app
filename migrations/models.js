const Sequelize = require("sequelize");
const app = require("../src/app");
const sequelize = app.get("sequelizeClient");
// const sequelize = new Sequelize("foo", "postgres", "mysecretpassword", {
//   dialect: "postgres",
//   host: "host.docker.internal",
//   port: 49153,
//   logging: false
// });

const models = sequelize.models;

console.log("sequelize", sequelize);

// The export object must be a dictionary of model names -> models
// It must also include sequelize (instance) and Sequelize (constructor) properties
module.exports = Object.assign(
  {
    Sequelize,
    sequelize
  },
  models
);

const testDb = conn.db.db("test"); // For example,  get "test" as a sibling

let result = await testDb
  .collection("test")
  .find()
  .toArray();
log(result);
