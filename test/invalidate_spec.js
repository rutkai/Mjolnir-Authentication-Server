var frisby = require('frisby');
var config = require('config');
var syncTestRunner = require('./synchronousTestRunner');


frisby.create('Nothing gives empty response')
    .get('http://localhost:' + config.get('httpPort') + '/invalidate')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

frisby.create('Invalid access token gives empty response')
    .post('http://localhost:' + config.get('httpPort') + '/invalidate', {
        "accessToken": "nonexistent"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

frisby.create('Invalid client token without access token gives empty response')
    .post('http://localhost:' + config.get('httpPort') + '/invalidate', {
        "clientToken": "nonexistent"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

syncTestRunner.registerTest(
    frisby.create('Authenticating for invalidating')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then invalidating without client token')
                .post('http://localhost:' + config.get('httpPort') + '/invalidate', {
                    "accessToken": response.accessToken
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSONLength(0)
                .after(function () {
                    frisby.create('invalidates the user session')
                        .post('http://localhost:' + config.get('httpPort') + '/validate', {
                            "accessToken": response.accessToken
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
                .toss();
        })
);

syncTestRunner.registerTest(
    frisby.create('Authenticating for invalidating')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then invalidating with wrong client token')
                .post('http://localhost:' + config.get('httpPort') + '/invalidate', {
                    "accessToken": response.accessToken,
                    "clientToken": "wrong-client-token"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSONLength(0)
                .after(function () {
                    frisby.create('does not invalidate the user session')
                        .post('http://localhost:' + config.get('httpPort') + '/validate', {
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
                .toss();
        })
);

syncTestRunner.registerTest(
    frisby.create('Authenticating for invalidating')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then invalidating with valid client token')
                .post('http://localhost:' + config.get('httpPort') + '/invalidate', {
                    "accessToken": response.accessToken,
                    "clientToken": "test-client-token"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSONLength(0)
                .after(function () {
                    frisby.create('invalidates the user session')
                        .post('http://localhost:' + config.get('httpPort') + '/validate', {
                            "accessToken": response.accessToken
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
                .toss();
        })
);
