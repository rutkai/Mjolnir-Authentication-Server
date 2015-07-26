var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('authserver.httpPort');

frisby.create('Nothing gives illegal argument error')
    .get('http://localhost:' + httpPort + '/session/minecraft/join')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "IllegalArgumentException",
        "errorMessage": "Access Token can not be null or empty."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Missing serverId gives illegal argument exception')
    .post('http://localhost:' + httpPort + '/session/minecraft/join', {
        "accessToken": "nonexistent"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "IllegalArgumentException",
        "errorMessage": "ServerId can not be null or empty."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Invalid access token gives exception')
    .post('http://localhost:' + httpPort + '/session/minecraft/join', {
        "accessToken": "nonexistent",
        "selectedProfile": "asdf",
        "serverId": "xxx"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "ForbiddenOperationException",
        "errorMessage": "Invalid token"
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();
