'use strict';

const dotenv = require('dotenv').config();
const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const globalHooks = require('./hooks');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const memory = require('feathers-memory');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const auth = require('feathers-authentication');
const errors = require('feathers-errors');

// const forceSSL = require('express-force-ssl');
const errorHandler = require('feathers-errors/handler');
// const acl = require('feathers-acl');
const middleware = require('./middleware');
const services = require('./services');
const routes = require('./routes');
const hbs = require('hbs');

const paginate = require('handlebars-paginate');
const app = feathers();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

hbs.registerHelper('paginate', paginate);


app.configure(configuration(path.join(__dirname, '..')));

// Load DB settings
// MONGODB_URL overrides 
app.set('mongodb', process.env.MONGODB_URL); // ? process.env.MONGODB_URL : "mongodb://" + process.env.DB_USER + ":" + process.env.DB_PASS + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME);

app.set('apiPath', '/' + app.get('api').basePath + '/' + app.get('api').version);

const apiPath = app.get('apiPath');
// Site access auth for demo purposes
/*if (app.get('env') === 'production') {
  const basicAuth = require('basic-auth-connect');
  app.use(basicAuth(app.get('auth').site_access.username,app.get('auth').site_access.password));
}
*/

const aclConfig = app.get('acl');

const localConfig = {
    'entity': 'user',
    'service': apiPath + '/user',
    'usernameField': 'email',
    'passwordField': 'password',
    'payload': ['role']
};

//console.log('https://' + app.get('host'));
//

app.use(compress())
    .configure(rest())
   /* .configure(acl(aclConfig, {
         denyNotAllowed: false,             // deny all routes without "allow" rules 
         adminRoles: ['admin'],  // need for owner rule 
         baseUrl: 'http://' + app.get('host'),
         jwt: {
           secret: 'supersecret',           // Default is 'Authorization' 
           options: {}                     // options for 'jsonwebtoken' lib 
         }
       })) */
    .configure(hooks())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    //.use(forceSSL)
    .configure(auth({
        path: apiPath + '/authentication',
        secret:  app.get('authentication').secret,
        passReqToCallback: true
    }))
    .configure(local(localConfig))
    .configure(jwt(localConfig))
    .options('*', cors())
    .use(cors())
   // .use(favicon(path.join(app.get('public'), 'favicon.ico')))
    .use('/cc-admin', serveStatic(app.get('public') + '/cc-admin/build'))
    .configure(services)
    .use(routes)
    .use('/', serveStatic(app.get('public')))
    .configure(middleware)
    .configure(local(localConfig));

//.configure(jwt());
//.configure(auth({ secret: 'super secret'}));
//.configure(auth());
//.configure(auth());

app.service(apiPath + '/authentication').hooks({
    before: {
        create: [
            // You can chain multiple strategies
            auth.hooks.authenticate(['jwt', 'local'])
        ],
        remove: [
            auth.hooks.authenticate('jwt')
        ]
    }
});



app.service(apiPath + '/authentication').hooks({
    after: {
        create: [
            // You can chain multiple strategies
            globalHooks.logAction
        ],
        remove: [
            globalHooks.logAction
        ]
    }
});





app.service(apiPath + '/user').hooks({
    before: {
        all:  [local.hooks.hashPassword(), auth.hooks.authenticate('jwt')],
    }
});

app.service(apiPath + '/county-committee-member').hooks({
    before: {
        all:  [local.hooks.hashPassword(), auth.hooks.authenticate('jwt')],
    }
});

// app.service(apiPath + '/invite').sendInvite({ email: 'joncrockett@gmail.com', role: 'admin'});
// app.all(apiPath + '/authentication', auth.express.authenticate('jwt'))

console.log('Starting env: ', app.get('env'));

module.exports = app;