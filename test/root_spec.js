var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('authserver.httpPort');

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