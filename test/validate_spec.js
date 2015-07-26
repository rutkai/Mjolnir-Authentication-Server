var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('authserver.httpPort');
var syncTestRunner = require('./synchronousTestRunner');


frisby.create('Nothing gives illegal argument error')
    .get('http://localhost:' + httpPort + '/validate')
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
    .post('http://localhost:' + httpPort + '/validate', {
        "accessToken": "nonexistent"
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

frisby.create('Old login returns exception')
    .post('http://localhost:' + httpPort + '/validate', {
        "username": "testOld",
        "password": "test",
        "accessToken": "d41d8cd98f00b204e9800998ecf8427e"
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
    frisby.create('After authentication')
        .post('http://localhost:' + httpPort + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('the validate accepts the accessToken')
                .post('http://localhost:' + httpPort + '/validate', {
                    "accessToken": response.accessToken
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

syncTestRunner.runNext();