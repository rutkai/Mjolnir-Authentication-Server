var frisby = require('frisby');
var config = require('config');
var syncTestRunner = require('./synchronousTestRunner');


frisby.create('Nothing gives illegal argument error')
    .get('http://localhost:' + config.get('httpPort') + '/validate')
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
    .post('http://localhost:' + config.get('httpPort') + '/validate', {
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

frisby.create('After authentication')
    .post('http://localhost:' + config.get('httpPort') + '/authenticate', {
        "username": "test",
        "password": "test",
        "clientToken": "test-client-token"
    })
    .afterJSON(function (response) {
        frisby.create('the validate accepts the accessToken')
            .post('http://localhost:' + config.get('httpPort') + '/validate', {
                "accessToken": response.accessToken
            })
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONLength(0)
            .toss();
    })
    .toss();