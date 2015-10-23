var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var pem = require('pem');
var config = require('config');
var fs = require('fs');
var actions = require('./lib/actions');
var logger = require('./lib/logger');
var keychain = require('./lib/keychain');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

logger.log("---- Mjolnir authentication server (auth) ----");
if (process.env.MJOLNIR_VERBOSE) {
    logger.log("Settings:");
    logger.log(JSON.stringify(config, null, 4));
    logger.log("Available hashing algorithms: " + require('crypto').getHashes());
}


// Images
app.use('/images', express.static('images'));
app.use('/static', express.static('static'));

// Authserver
app.all('/', actions.root);
app.all('/authenticate', actions.authenticate);
app.all('/refresh', actions.refresh);
app.all('/validate', actions.validate);
app.all('/signout', actions.signOut);
app.all('/invalidate', actions.invalidate);

// Sessionserver
app.all('/session/minecraft/join', actions.sessionJoin);
app.all('/session/minecraft/hasJoined', actions.sessionHasJoined);
app.all('/session/minecraft/profile/:uuid', actions.sessionUUIDToProfile);

// APIserver
app.all('/users/profiles/minecraft/:name', actions.apiNameToUUID);
app.all('/user/profiles/:uuid/names', actions.apiUUIDToName);
app.all('/profiles/minecraft', actions.apiPlayernamesToUUID);

// Other
app.all('*', function (request, response) {
    console.log('Unknown request: ');
    console.log(request.headers.host, request.originalUrl);
    console.log(request.body);
    response.status(404).json({
        error: "Not Found",
        errorMessage: "The server has not found anything matching the request URI"
    });
});


startServer('sessionserver');
startServer('authserver');
startServer('apiserver');


function startServer(server) {
    var privateKey = fs.readFileSync('cert/' + server + '/server.key', 'utf8');
    var certOptions = config.util.extendDeep({}, config.get(server + '.certification'), {"clientKey": privateKey});

    pem.createCertificate(certOptions, function (err, keys) {
        if (err) {
            console.log(err);
            return;
        }

        keychain.store(server + '.key', keys.serviceKey);
        keychain.store(server + '.crt', keys.certificate);

        fs.writeFile('./cert/' + server + '/certificate.key', keys.serviceKey, function (err) {
            if (err) {
                console.log(err);
            }
        });
        fs.writeFile('./cert/' + server + '/certificate.crt', keys.certificate, function (err) {
            if (err) {
                console.log(err);
            }
        });

        http.createServer(app).listen(config.get(server + '.httpPort'));
        https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(config.get(server + '.httpsPort'));

        logger.log(server + ' is listening...');
    });
}
