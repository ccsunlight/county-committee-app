'use strict';

const auth = require('feathers-authentication');
// const jwt = require('feathers-authentication-jwt');
const memory = require('feathers-memory');


const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;

module.exports = function() {
  const app = this;
 
  let config = app.get('auth');
  
  config.facebook.strategy = FacebookStrategy;
  config.facebook.tokenStrategy = FacebookTokenStrategy;
  config.google.strategy = GoogleStrategy;
  config.google.tokenStrategy = GoogleTokenStrategy;
  config.secret = 'supersecret';
  config.service = 'user';

  console.dir(config);
  app.set('auth', config);
  app.configure(auth({ secret: 'super secret' }))
 
};

