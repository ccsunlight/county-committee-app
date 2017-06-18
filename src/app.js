'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const memory = require('feathers-memory');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const auth = require('feathers-authentication');
const errors = require('feathers-errors');
const forceSSL = require('express-force-ssl');
// const errorHandler = require('feathers-errors/handler');

const middleware = require('./middleware');
const services = require('./services');
const routes = require('./routes');
const hbs = require('hbs');
const app = feathers();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.configure(configuration(path.join(__dirname, '..')));

// Site access auth for demo purposes
/*if (app.get('env') === 'production') {
  const basicAuth = require('basic-auth-connect');
  app.use(basicAuth(app.get('auth').site_access.username,app.get('auth').site_access.password));
}
*/

const localConfig = {
    'entity': 'user',
    'service': 'user',
    'usernameField': 'email',
    'passwordField': 'password'
};

app.use(compress())
    .configure(rest())
    .configure(hooks())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(forceSSL)
    .configure(auth({ secret: 'supersecret' }))
    .configure(local(localConfig))
    .configure(jwt(localConfig))
    .options('*', cors())
    .use(cors())
    .use(favicon(path.join(app.get('public'), 'favicon.ico')))
    .use('/cc-admin', serveStatic(app.get('public') + '/cc-admin/build'))
    .use(routes)
    .use('/', serveStatic(app.get('public')))
    .configure(services)
    .configure(middleware)
    .configure(local(localConfig));
// .configure(jwt())

//.configure(auth({ secret: 'super secret'}));
//.configure(auth())

// .configure(auth());


app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate('local')
    ],
    remove: [
      auth.hooks.authenticate('local')
    ]
  }
});

// Create a user that we can use to log in
var User = {
    email: 'ccuser@jon.com',
    password: 'admin',
    role: 'admin'
};

app.service('user').hooks({
    before: {
        create: local.hooks.hashPassword()
    }
});

app.service('user').create(User).then(user => {
    console.log('Created default user', user);
}).catch(console.error);


app.all('/authentication', auth.express.authenticate('local'))


console.log('Starting env: ', app.get('env'));

module.exports = app;