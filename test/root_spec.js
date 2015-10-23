var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('authserver.httpPort');

frisby.create('Invalid url throws not found error')
    .get('http://localhost:' + httpPort + '/invalid-url-sample')
    .expectStatus(404)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "Not Found",
        "errorMessage": "The server has not found anything matching the request URI"
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Root path shows basic information')
    .get('http://localhost:' + httpPort)
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "Status": "OK",
        "Application-Name": "mjolnir.auth.server",
        "Application-Owner": "Tester"
    })
    .expectJSONTypes({
        "Status": String,
        "Runtime-Mode": String,
        "Application-Author": String,
        "Application-Description": String,
        "Specification-Version": String,
        "Application-Name": String,
        "Implementation-Version": String,
        "Application-Owner": String
    })
    .toss();