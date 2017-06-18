import feathers from 'feathers-client';
import hooks from 'feathers-hooks';
import rest from 'feathers-rest/client';
import authentication from 'feathers-authentication-client';
 import localstorage from 'feathers-localstorage';


const host = window.location.origin;

export default feathers()
  .use('storage', localstorage())
  .configure(hooks())
  .configure(rest(host).fetch(window.fetch.bind(window)))
  .configure(authentication({
    storage: window.localStorage,
    service: 'user',
    jwtStrategy: 'jwt'
  }));

 
