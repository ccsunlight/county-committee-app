const app = require("../src/app");
const env = process.env.NODE_ENV || "development";
const dialect = "postgres"; // Or your dialect name

module.exports = {
  development: {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_NAME,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: dialect
  }
};
