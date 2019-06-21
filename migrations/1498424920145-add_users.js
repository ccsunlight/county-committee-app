"use strict";

const app = require("../src/app");
const apiPath = app.get("apiPath");
const generator = require("generate-password");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  // Create a user that we can use to log in
  var seedAdminData = {
    email: "sadmin@ccsunlight.org",
    password: password,
    role: "admin",
    firstname: "Seed",
    lastname: "Admin"
  };

  seedUser(seedAdminData);

  function seedUser(seedData) {
    app
      .service(apiPath + "/user")
      .find({
        query: {
          email: seedData.email
        }
      })
      .then(result => {
        if (result.total === 0) {
          app
            .service(apiPath + "/user")
            .create(seedData)
            .then(user => {
              console.log("\n\n###########################");
              console.log("### ADMIN LOGIN CREATED ###");
              console.log("###########################");

              console.log("\nSAVE THIS SOMEWHERE SECURE!\n");
              console.log("un: " + seedAdminData.email);
              console.log("pw: " + password);

              console.log("\n\n#########################");

              // rl.question(
              //   "Please write this down somewhere and hit enter to contiune. ",
              //   answer => {
              //     // TODO: Log the answer in a database
              //     console.log(
              //       `Thank you for your valuable feedback: ${answer}`
              //     );

              //     rl.close();
              //     done();
              //   }
              // );
              done();
            })
            .catch(console.error);
        } else {
          let existingUser = result.data[0];

          app
            .service(apiPath + "/user")
            .update(existingUser._id, seedData)
            .then(user => {
              console.log("\n\n###########################");
              console.log("### ADMIN LOGIN UPDATED ###");
              console.log("###########################");

              console.log("\nSAVE THIS SOMEWHERE SECURE!\n");

              console.log("un: " + seedAdminData.email);
              console.log("pw: " + password);
              console.log("\n\n#########################");
              rl.question(
                "Please write this down somewhere and hit enter to contiune. ",
                answer => {
                  // TODO: Log the answer in a database
                  console.log(
                    `Thank you for your valuable feedback: ${answer}`
                  );

                  rl.close();
                  done();
                }
              );
            });
        }
      });
  }
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
