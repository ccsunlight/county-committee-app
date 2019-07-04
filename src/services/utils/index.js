"use strict";

const hooks = require("./hooks");
const os = require("os");
const fs = require("fs");
const base64 = require("base64topdf");

class Service {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Takes a string of PDF data and saves it to a temp file
   * @param {String} base64Data A string of base64 data with or without the data uri prefix.
   * @param {String} filename
   * @returns {String} The full path of the newly created temp file
   */
  saveBase64PDFDataToTempFile(base64Data, filename) {
    const tempFileFullPath = os.tmpdir() + "/" + filename;
    let encodedPDFData;

    if (base64Data.indexOf("pdf;base64,") > -1) {
      encodedPDFData = base64Data.split(",")[1];
    } else {
      encodedPDFData = base64Data;
    }

    base64.base64Decode(base64Data, tempFileFullPath);

    return tempFileFullPath;
  }

  /**
   * Takes a string of data and saves it to a temp file
   * @param {String} base64Data A string of base64 data with or without the data uri prefix.
   * @param {String} filename
   * @returns {String} The full path of the newly created temp file
   */
  saveBase64CSVDataToTempFile(base64Data, filename) {
    const tempFileFullPath = os.tmpdir() + "/" + filename;
    let csvBase64Encoded, csvUtf8encoded;

    if (base64Data.indexOf("csv;base64,") > -1) {
      csvBase64Encoded = base64Data.split(",")[1];
    } else {
      csvBase64Encoded = base64Data;
    }

    csvUtf8encoded = Buffer.from(csvBase64Encoded, "base64").toString("utf8");

    if (csvUtf8encoded) {
      fs.writeFileSync(tempFileFullPath, csvUtf8encoded);
    } else {
      throw Error("Something went wrong while trying to save " + filename);
    }

    return tempFileFullPath;
  }

  saveCSVTextToTempFile(csvText, filename) {
    const tempFileFullPath = os.tmpdir() + "/" + filename;

    if (csvText) {
      fs.writeFileSync(tempFileFullPath, csvText);
    } else {
      throw Error("Something went wrong while trying to save " + filename);
    }

    return tempFileFullPath;
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    return Promise.resolve({
      id,
      text: `A new message with ID: ${id}!`
    });
  }

  create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update(id, data, params) {
    return Promise.resolve(data);
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function() {
  const app = this;

  // Initialize our service with any options it requires
  app.use("/utils", new Service());

  // Get our initialize service to that we can bind hooks
  const utilsService = app.service("/utils");

  // Set up our before hooks
  utilsService.before(hooks.before);

  // Set up our after hooks
  utilsService.after(hooks.after);
};

module.exports.Service = Service;
