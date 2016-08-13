var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('authserver.httpPort');

if (config.get('drivers').length !== 2) {
    return;
}

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

frisby.create('Wrong password for config user gives authentication error')
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

frisby.create('Valid credentials in config user')
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

frisby.create('Wrong password in mongodb user')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "username": "dbUser",
        "password": "test"
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

frisby.create('Valid credentials using mongodb user')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "username": "dbUser",
        "password": "db"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();

frisby.create('Config user overlaps mongodb user')
    .post('http://localhost:' + httpPort + '/authenticate', {
        "agent": {
            "name": "Minecraft",
            "version": 1
        },
        "username": "overlapUser",
        "password": "asdf"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "availableProfiles": [
            {
                "id": "0e565137f98349feac6115adfe19e962",
                "name": "overlapPlayer"
            }
        ],
        "selectedProfile": {
            "id": "0e565137f98349feac6115adfe19e962",
            "name": "overlapPlayer"
        }
    })
    .expectJSONTypes({
        "accessToken": String,
        "clientToken": String
    })
    .toss();
