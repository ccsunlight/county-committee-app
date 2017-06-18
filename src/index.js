'use strict';

const app = require('./app');

const fs = require('fs');
const port = app.get('port');
const path = require('path');
const https = require('https');
const appDir = path.dirname(require.main.filename);



const server = app.listen(port);
var certificateFilename = 'localhost.crt';
var privateKeyFilename = 'localhost.key';

if (app.get('env') === 'production') {
	certificateFilename == 'ccsunlight.crt';
	privateKeyFilename	== 'ccsunlight.key';
} 

var privateKey = fs.readFileSync(appDir + '/../cert/' + privateKeyFilename );
var certificate = fs.readFileSync(appDir + '/../cert/' + certificateFilename );

const secureServer = https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);



server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${port}`)
);