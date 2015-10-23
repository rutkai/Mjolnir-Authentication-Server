var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('apiserver.httpPort');

frisby.create('Getting a non-existent UUID gives empty response')
    .get('http://localhost:' + httpPort + '/user/profiles/nonexistent/names')
    .expectStatus(204)
    .toss();

frisby.create('Getting a valid user gives userid and playername')
    .get('http://localhost:' + httpPort + '/user/profiles/650bed2c9ef54b5fb02c61fa493c68b5/names')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON([{
        "name": "testPlayer"
    }])
    .expectJSONTypes([{
        "name": String
    }])
    .toss();
