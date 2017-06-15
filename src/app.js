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
if (app.get('env') === 'production') {
  const basicAuth = require('basic-auth-connect');
  app.use(basicAuth(app.get('auth').site_access.username,app.get('auth').site_access.password));
}


app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/cc-admin', serveStatic( app.get('public') + '/cc-admin/build' ))
  .use(routes)
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .configure(middleware);

console.log('Starting env: ', app.get('env')); 

module.exports = app;
