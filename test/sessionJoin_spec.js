var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('sessionserver.httpPort');
var syncTestRunner = require('./synchronousTestRunner');

frisby.create('Nothing gives illegal argument error')
    .get('http://localhost:' + httpPort + '/session/minecraft/join')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "IllegalArgumentException",
        "errorMessage": "accessToken.getServerId() can not be null or empty."
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
        "errorMessage": "accessToken.getServerId() can not be null or empty."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Missing accessToken gives illegal argument exception')
    .post('http://localhost:' + httpPort + '/session/minecraft/join', {
        "serverId": "nonexistent"
    })
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

syncTestRunner.registerTest(
    frisby.create('Authenticating for session join')
        .post('http://localhost:' + httpPort + '/authenticate', {
            "username": "test",
            "password": "test"
        })
        .afterJSON(function (response) {
            frisby.create('then missing selected profile gives exception')
                .post('http://localhost:' + httpPort + '/session/minecraft/join', {
                    "accessToken": response.accessToken,
                    "serverId": "random"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSON({
                    "error": "IllegalArgumentException",
                    "errorMessage": "selectedProfile can not be null."
                })
                .expectJSONTypes({
                    "error": String,
                    "errorMessage": String
                })
                .after(function () {
                    syncTestRunner.runNext();
                })
                .toss();
        })
);

syncTestRunner.registerTest(
    frisby.create('Authenticating for session join')
        .post('http://localhost:' + httpPort + '/authenticate', {
            "username": "test",
            "password": "test"
        })
        .afterJSON(function (response) {
            frisby.create('then sending a serverId with invalid selectedProfile and valid accessToken gives exception')
                .post('http://localhost:' + httpPort + '/session/minecraft/join', {
                    "accessToken": response.accessToken,
                    "selectedProfile": "nonexistent",
                    "serverId": "random"
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
                .after(function () {
                    syncTestRunner.runNext();
                })
                .toss();
        })
);

syncTestRunner.registerTest(
    frisby.create('Authenticating for session join')
        .post('http://localhost:' + httpPort + '/authenticate', {
            "agent": {
                "name": "Minecraft",
                "version": 1
            },
            "username": "test",
            "password": "test"
        })
        .afterJSON(function (response) {
            frisby.create('then sending a serverId with valid selectedProfile and accessToken gives no response')
                .post('http://localhost:' + httpPort + '/session/minecraft/join', {
                    "accessToken": response.accessToken,
                    "selectedProfile": response.selectedProfile.id,
                    "serverId": "5555"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSONLength(0)
                .after(function () {
                    syncTestRunner.runNext();
                })
                .toss();
        })
);
