

require('greenlock-express').create({
    server: 'staging',
    email: 'joncrockett@gmail.com',
    agreeTos: true,
    approveDomains: ['ccsunlight.org'],
    app: require('express')().use('/', function(req, res) {
        res.end('Hello, World!');
    })
}).listen(80, 443);