import feathers from "feathers-client";
import hooks from "feathers-hooks";
import rest from "feathers-rest/client";
import authentication from "feathers-authentication-client";
import localstorage from "feathers-localstorage";

const host = process.env.REACT_APP_API_HOSTNAME
  ? process.env.REACT_APP_API_HOSTNAME + process.env.REACT_APP_API_BASEPATH
  : window.location.origin + process.env.REACT_APP_API_BASEPATH;

const jwtOpts = {
  header: "Authorization", // the default authorization header
  path: "/authentication", // the server side authentication service path
  jwtStrategy: "jwt", // the name of the JWT authentication strategy
  entity: "user", // the entity you are authenticating (ie. a users)
  service: "user", // the service to look up the entity
  cookie: "feathers-jwt", // the name of the cookie to parse the JWT from when cookies are enabled server side
  storageKey: "feathers-jwt" // the key to store the accessToken in localstorage or AsyncStorage on React Native
};

export default feathers()
  .use("storage", localstorage())
  .configure(hooks())
  .configure(rest(host).fetch(window.fetch.bind(window)))
  .configure(authentication(jwtOpts));
