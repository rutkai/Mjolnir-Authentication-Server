var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('authserver.httpPort');

frisby.create('Nothing gives authentication error')
    .get('http://localhost:' + httpPort + '/authenticate')
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

frisby.create('Missing user gives authentication error')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "username": "nonexistent",
        "password": "asdf"
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

frisby.create('Wrong password gives authentication error')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "username": "test",
        "password": "asdf"
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

frisby.create('Valid credentials without clientToken and agent token')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "username": "test",
        "password": "test"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();

frisby.create('Valid credentials with clientToken and agent token')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "username": "test",
        "password": "test",
        "clientToken": "test-client-token"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "clientToken": "test-client-token"
    })
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();

frisby.create('Valid credentials with agent token')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "agent": {
            "name": "Minecraft",
            "version": 1
        },
        "username": "test",
        "password": "test"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "availableProfiles": [
            {
                "id": "650bed2c9ef54b5fb02c61fa493c68b5",
                "name": "testPlayer"
            }
        ],
        "selectedProfile": {
            "id": "650bed2c9ef54b5fb02c61fa493c68b5",
            "name": "testPlayer"
        }
    })
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();