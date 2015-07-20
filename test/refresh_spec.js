var frisby = require('frisby');
var config = require('config');
var syncTestRunner = require('./synchronousTestRunner');

frisby.create('Nothing gives illegal argument error')
    .get('http://localhost:' + config.get('httpPort') + '/refresh')
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

frisby.create('Missing client token gives invalid token error')
    .post('http://localhost:' + config.get('httpPort') + '/refresh', {
        "accessToken": "nonexistent"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "ForbiddenOperationException",
        "errorMessage": "Invalid token."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

syncTestRunner.registerTest(
frisby.create('Authenticating for refresh')
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        "username": "test",
        "password": "test",
        "clientToken": "test-client-token"
    })
    .afterJSON(function () {
        frisby.create('then wrong access token gives invalid token error')
            .post('http://localhost:' + config.get('httpPort') + '/refresh', {
                "accessToken": "nonexistent",
                "clientToken": "test-client-token"
            })
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSON({
                "error": "ForbiddenOperationException",
                "errorMessage": "Invalid token."
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
    frisby.create('Authenticating for refresh')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then wrong client token gives invalid token error')
                .post('http://localhost:' + config.get('httpPort') + '/refresh', {
                    "accessToken": response.accessToken,
                    "clientToken": "nonexistent"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSON({
                    "error": "ForbiddenOperationException",
                    "errorMessage": "Invalid token."
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
    frisby.create('Authenticating for refresh')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then refreshing with valid tokens gives new access token')
                .post('http://localhost:' + config.get('httpPort') + '/refresh', {
                    "accessToken": response.accessToken,
                    "clientToken": "test-client-token"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSON({
                    accessToken: function (val) {
                        expect(val).not.toEqual(response.accessToken)
                    },
                    "clientToken": "test-client-token"
                })
                .expectJSONTypes({
                    "accessToken": String,
                    "clientToken": String
                })
                .after(function () {
                    syncTestRunner.runNext();
                })
                .toss();
        })
);

syncTestRunner.registerTest(
    frisby.create('Authenticating for refresh')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then refreshing with valid tokens and selectedProfile gives the same selectedProfile')
                .post('http://localhost:' + config.get('httpPort') + '/refresh', {
                    "accessToken": response.accessToken,
                    "clientToken": "test-client-token",
                    "selectedProfile": {
                        "id": "test0123456789abcdef",
                        "name": "testPlayer"
                    }
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSON({
                    "selectedProfile": {
                        "id": "test0123456789abcdef",
                        "name": "testPlayer"
                    }
                })
                .expectJSONTypes({
                    "selectedProfile": Object
                })
                .after(function () {
                    syncTestRunner.runNext();
                })
                .toss();
        })
);
