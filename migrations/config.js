const app = require("../src/app");
const env = process.env.NODE_ENV || "development";
const dialect = "postgres"; // Or your dialect name
const dotenv = require("dotenv").config({ path: "../.env" });

console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);

module.exports = {
  [env]: {
    dialect,
    url: process.env.DATABASE_URL,
    migrationStorageTableName: "_migrations"
  }
};
