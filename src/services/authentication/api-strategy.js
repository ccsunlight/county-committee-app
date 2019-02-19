const Strategy = require("passport-custom");

module.exports = opts => {
  return function() {
    const verifier = (req, done) => {
      // get the key from the request header supplied in opts

      console.log(opts.paramNam, req.params);
      const key = req.params.query.hasOwnProperty(opts.paramName)
        ? req.params.query[opts.paramName]
        : null;
      // check if the key is in the allowed keys supplied in opts
      const match = opts.allowedKeys.includes(key);

      // user will default to false if no key is present
      // and the authorization will fail
      const user = match ? "api" : match;
      return done(null, user);
    };

    // register the strategy in the app.passport instance
    this.passport.use("apiKey", new Strategy(verifier));
    // Add options for the strategy
    this.passport.options("apiKey", {});
  };
};
