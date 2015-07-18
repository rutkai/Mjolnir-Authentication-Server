var frisby = require('frisby');
var config = require('config');

frisby.create('Nothing gives authentication error')
    .get('http://localhost:' + config.get('httpPort') + '/authenticate')
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
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        username: "nonexistent",
        password: "asdf"
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
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        username: "test",
        password: "asdf"
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
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        username: "test",
        password: "test"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();

frisby.create('Valid credentials with clientToken and agent token')
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        username: "test",
        password: "test",
        clientToken: "test-client-token"
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
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        agent: {
            name: "Minecraft",
            version: 1
        },
        username: "test",
        password: "test"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "availableProfiles": [
            {
                "id": "test0123456789abcdef",
                "name": "testPlayer"
            }
        ],
        "selectedProfile": {
            "id": "test0123456789abcdef",
            "name": "testPlayer"
        }
    })
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();