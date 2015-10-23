var frisby = require('frisby');
var config = require('config');
var httpPort = config.get('apiserver.httpPort');

frisby.create('Nothing gives nothing')
    .get('http://localhost:' + httpPort + '/profiles/minecraft')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON([])
    .toss();

frisby.create('Getting one invalid user gives nothing')
    .post('http://localhost:' + httpPort + '/profiles/minecraft', [
        'nonexistent'
    ])
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON([])
    .toss();

frisby.create('More than a hundred users gives error')
    .post('http://localhost:' + httpPort + '/profiles/minecraft', generateNames(101))
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "IllegalArgumentException",
        "errorMessage": "Too many names."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Getting one valid user gives userid and playername')
    .post('http://localhost:' + httpPort + '/profiles/minecraft', [
        'testPlayer'
    ])
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON([{
        "id": "650bed2c9ef54b5fb02c61fa493c68b5",
        "name": "testPlayer"
    }])
    .expectJSONTypes([{
        "id": String,
        "name": String
    }])
    .toss();

frisby.create('Getting one valid user corrects invalid username case')
    .post('http://localhost:' + httpPort + '/profiles/minecraft', [
        'tEstPLaYer'
    ])
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON([{
        "id": "650bed2c9ef54b5fb02c61fa493c68b5",
        "name": "testPlayer"
    }])
    .expectJSONTypes([{
        "id": String,
        "name": String
    }])
    .toss();

frisby.create('Getting an empty username gives exception')
    .post('http://localhost:' + httpPort + '/profiles/minecraft', [
        'testPlayer',
        '',
        'somebody'
    ])
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "error": "IllegalArgumentException",
        "errorMessage": "Empty username."
    })
    .expectJSONTypes({
        "error": String,
        "errorMessage": String
    })
    .toss();

frisby.create('Getting multiple valid users gives userid and playername')
    .post('http://localhost:' + httpPort + '/profiles/minecraft', [
        'testPlayer',
        'testPlayerOld'
    ])
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON([
        {
            "id": "650bed2c9ef54b5fb02c61fa493c68b5",
            "name": "testPlayer"
        },
        {
            "id": "1294fda6159c4218be4c89b660d9cf32",
            "name": "testPlayerOld"
        }
    ])
    .expectJSONTypes([{
        "id": String,
        "name": String
    }])
    .toss();


function generateNames(amount) {
    var names = [];

    while (names.length < amount) {
        names.push('name' + names.length);
    }

    return names;
}
