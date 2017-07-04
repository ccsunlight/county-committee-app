'use strict';

const app = require('./app');

const fs = require('fs');
const port = app.get('port');
const path = require('path');
const https = require('https');
const appDir = path.dirname(require.main.filename);
const SMTPServer = require('smtp-server').SMTPServer;

const server = app.listen(port);

var certificateFilename = 'localhost.crt';
var privateKeyFilename = 'localhost.key';

if (app.get('env') === 'production') {
	console.log('production keys loading');
    certificateFilename == 'live/fullchain.pem';
    privateKeyFilename == 'live/privkey.pem';
}

var privateKey = fs.readFileSync(appDir + '/../cert/' + privateKeyFilename);
var certificate = fs.readFileSync(appDir + '/../cert/' + certificateFilename);

const secureServer = https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);

// This example starts a SMTP server using TLS with your own certificate and key
const smtpServer = new SMTPServer({
    secure: true,
    key: privateKey,
    cert: certificate
});
smtpServer.listen(465);

server.on('listening', () =>
    console.log(`Feathers application started on ${app.get('host')}:${port}`)
);