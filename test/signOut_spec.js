var frisby = require('frisby');
var config = require('config');
var syncTestRunner = require('./synchronousTestRunner');

frisby.create('Nothing gives illegal argument error')
    .get('http://localhost:' + config.get('httpPort') + '/signout')
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

frisby.create('Invalid user gives exception')
    .post('http://localhost:' + config.get('httpPort') + '/signout', {
        "username": "non-existent-user",
        "password": "random"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "ForbiddenOperationException",
        "errorMessage": "Invalid credentials. Invalid username or password."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Empty password gives exception')
    .post('http://localhost:' + config.get('httpPort') + '/signout', {
        "username": "test"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "ForbiddenOperationException",
        "errorMessage": "Invalid credentials. Invalid username or password."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

syncTestRunner.registerTest(
    frisby.create('Authenticating for signing out')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then logging out with invalid credentials do not invalidate the session')
                .post('http://localhost:' + config.get('httpPort') + '/signout', {
                    "username": "test",
                    "password": "wrong-password"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSON({
                    "error": "ForbiddenOperationException",
                    "errorMessage": "Invalid credentials. Invalid username or password."
                })
                .expectJSONTypes({
                    "error": String,
                    "errorMessage": String
                })
                .after(function () {
                    frisby.create('so validate accepts the accessToken')
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
    frisby.create('Authenticating for signing out')
        .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
            "username": "test",
            "password": "test",
            "clientToken": "test-client-token"
        })
        .afterJSON(function (response) {
            frisby.create('then logging out with valid credentials invalidate the session')
                .post('http://localhost:' + config.get('httpPort') + '/signout', {
                    "username": "test",
                    "password": "test"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSONLength(0)
                .after(function () {
                    frisby.create('so validate rejects the accessToken')
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
