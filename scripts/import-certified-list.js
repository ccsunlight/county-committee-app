const app = require("../src/app");

let filepath = process.argv[2];

const CertifiedList = app.service(app.get("apiPath") + "/certified-list");

console.log("filepath", filepath);

CertifiedList.create({ filepath: filepath })
  .then(certifiedList => {
    console.log("List Imported");
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });
