import feathers from 'feathers';
import hooks from 'feathers-hooks';
import rest from 'feathers-rest/client';
// import authentication from 'feathers-authentication-client';

const host = 'http://localhost';

export default feathers()
  .configure(hooks())
  .configure(rest(host).fetch(window.fetch.bind(window)));