const user = require("../user/user-model");
const invite = require("./invite-model");
const mongoose = require("mongoose");
const nev = require("email-verification")(mongoose);
const bcrypt = require("bcrypt");
const local = require("feathers-authentication-local");

// @todo this is super hacky. Gotta clean this up at some point.
let tempModelGenerated = false;

function nevInit(verifyMailOptions, callback) {
  const app = require("../../app.js");

  let protocol = "http://";

  if (app.get("env") === "production") {
    protocol = "https://";
  }

  let nevOptions = {
    verificationURL: protocol + app.get("host") + "/invite/confirm/${URL}",
    URLLength: 48,
    persistentUserModel: user,
    tempUserModel: invite,
    tempUserCollection: "temporary_users",
    emailFieldName: "email",
    hashingFunction: null,
    passwordFieldName: "password",
    URLFieldName: "GENERATED_VERIFYING_URL",
    expirationTime: 86400 * 7,
    transportOptions: {
      service: "Gmail",
      auth: {
        user: app.get("gmail_un"),
        pass: app.get("gmail_pw")
      }
    },
    verifyMailOptions: verifyMailOptions,
    shouldSendConfirmation: true,
    confirmMailOptions: {
      from: "County Committee Sunlight Project <" + app.get("gmail_un") + ">",
      subject: "Successfully verified!",
      html: "<p>Your account has been successfully verified.</p>",
      text: "Your account has been successfully verified."
    }
  };

  nev.configure(nevOptions, function(error, options) {});

  var myHasher = function(password, tempUserData, insertTempUser, callback) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return insertTempUser(hash, tempUserData, callback);
  };

  if (!tempModelGenerated) {
    // generating the model, pass the User model defined earlier
    nev.generateTempUserModel(invite, function(err, info) {
      tempModelGenerated = true;

      callback();
    });
  }
}

function sendInvite(data, password_for_email, callback) {
  let newUser = new invite(data);

  // saved!
  const app = require("../../app.js");

  nevInit(
    {
      from: "County Committee Sunlight Project <" + app.get("gmail_un") + ">",
      subject: "Confirm your account",
      html:
        '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
        "paste the following link into your browser and using your login details below:</p><p>${URL}</p><p>username: " +
        data.email +
        "</p><p>pw: " +
        password_for_email +
        "</p>",
      text:
        "Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}"
    },
    function() {
      nev.createTempUser(newUser, function(
        err,
        existingPersistentUser,
        newTempUser
      ) {
        // some sort of error
        if (err) {
          console.log("error creating user", err);
          callback(err);
        }
        // handle error...

        // user already exists in persistent collection...
        if (existingPersistentUser) {
          callback("User exists already");
        }
        // handle user's existence... violently.

        // a new user
        if (newTempUser) {
          var URL = newTempUser["GENERATED_VERIFYING_URL"];
          nev.sendVerificationEmail(newTempUser.email, URL, function(
            err,
            info
          ) {
            if (err) {
              console.log("error sending verification email", err);
            }
            // handle error...
            callback(err, newTempUser);
            // flash message of success
          });

          // user already exists in temporary collection...
        } else {
          console.log("no temp user", existingPersistentUser, newTempUser);
          //callback('no temp user');
          /*   var URL = newUser[nev.options.URLFieldName];
                  nev.sendVerificationEmail(newUser.email, URL, function(err, info) {
                      if (err) {
                          console.log('err')
                      }

                      console.log(info);
                      // handle error...

                      // flash message of success
                  });
                  */
          // flash message of failure...
        }
      });
    }
  );
}

function confirmUser(url, callback) {
  nev.confirmTempUser(url, function(err, user) {
    if (err) {
      console.log(err);
      callback(err);
    }
    // user was found!
    if (user) {
      // optional
      //
      nev.sendConfirmationEmail(user["email_field_name"], function(err, info) {
        // redirect to their profile...
      });

      callback(user);
    } else {
      callback("nope");
    }
    // redirect to sign-up
  });
}

module.exports = {
  sendInvite: sendInvite,
  confirmUser: confirmUser
};
