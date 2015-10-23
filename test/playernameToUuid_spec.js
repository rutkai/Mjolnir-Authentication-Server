var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('apiserver.httpPort');

frisby.create('Getting a non-existent user gives empty response')
    .get('http://localhost:' + httpPort + '/users/profiles/minecraft/nonexistent')
    .expectStatus(204)
    .toss();

frisby.create('Getting a valid user gives userid and playername')
    .get('http://localhost:' + httpPort + '/users/profiles/minecraft/testPlayer')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "id": "650bed2c9ef54b5fb02c61fa493c68b5",
        "name": "testPlayer"
    })
    .expectJSONTypes({
        "id": String,
        "name": String
    })
    .toss();
