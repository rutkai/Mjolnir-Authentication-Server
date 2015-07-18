var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('./lib/logger');
var http = require('http');
var https = require('https');
var pem = require('pem');
var config = require('config');
var fs = require('fs');
var privateKey = fs.readFileSync('cert/server.key', 'utf8');
var certOptions = config.util.extendDeep({}, config.get('certification'), {"clientKey": privateKey});
var actions = require('./lib/actions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

logger.log("---- Mjolnir authentication server ----");
if (process.env.MJOLNIR_VERBOSE) {
    logger.log("Settings:");
    logger.log(JSON.stringify(config, null, 4));
    logger.log("Available hashing algorithms: " + require('crypto').getHashes());
}


app.all('/', actions.root);
app.all('/authenticate', actions.authenticate);
app.all('/refresh', actions.refresh);
app.all('/validate', actions.validate);
app.all('/signout', actions.signOut);
app.all('/invalidate', actions.invalidate);
app.all('*', function (request, response) {
    console.log(request.body);
    response.json({
        error: "Not Found",
        errorMessage: "The server has not found anything matching the request URI"
    });
});


pem.createCertificate(certOptions, function (err, keys) {
    if (err) {
        console.log(err);
        return;
    }

    http.createServer(app).listen(config.get('httpPort'));
    https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(config.get('httpsPort'));

    logger.log("Server is listening...");
});
