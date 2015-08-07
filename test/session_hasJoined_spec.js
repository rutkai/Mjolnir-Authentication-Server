var frisby = require('frisby');
var config = require('config');
var moment = require('moment');
var crypto = require('crypto');
var fs = require('fs');
var httpPort = config.get('authserver.httpPort');
var syncTestRunner = require('./synchronousTestRunner');

frisby.create('Nothing gives empty response')
    .get('http://localhost:' + httpPort + '/session/minecraft/hasJoined')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

frisby.create('Missing username gives empty response')
    .get('http://localhost:' + httpPort + '/session/minecraft/hasJoined?serverId=1234')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

frisby.create('Missing serverId gives empty response')
    .get('http://localhost:' + httpPort + '/session/minecraft/hasJoined?username=test')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

frisby.create('Invalid serverId gives empty response')
    .get('http://localhost:' + httpPort + '/session/minecraft/hasJoined?username=test&serverId=1234')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength(0)
    .toss();

syncTestRunner.registerTest(
    frisby.create('Authenticating for session join')
        .post('http://localhost:' + httpPort + '/authenticate', {
            "agent": {
                "name": "Minecraft",
                "version": 1
            },
            "username": "test",
            "password": "test"
        })
        .afterJSON(function (response) {
            frisby.create('then sending a serverId with valid selectedProfile and accessToken gives no response')
                .post('http://localhost:' + httpPort + '/session/minecraft/join', {
                    "accessToken": response.accessToken,
                    "selectedProfile": response.selectedProfile.id,
                    "serverId": "5555"
                })
                .expectStatus(200)
                .expectHeaderContains('content-type', 'application/json')
                .expectJSONLength(0)
                .afterJSON(function () {
                    frisby.create('then checking the has joined should be successful and returns the required data.')
                        .get('http://localhost:' + httpPort + '/session/minecraft/hasJoined?username=' + response.selectedProfile.name + '&serverId=5555')
                        .expectStatus(200)
                        .expectHeaderContains('content-type', 'application/json')
                        .expectJSON({
                            "id": "650bed2c9ef54b5fb02c61fa493c68b5",
                            "name": "testPlayer",
                            "properties": function (value) {
                                expect(value).not.toBe(undefined);
                                expect(value[0]).not.toBe(undefined);
                                expect(value[0].name).toBe('textures');
                                textureValueValidator(value[0].value);
                                signatureValidator(value[0].value, value[0].signature);
                            }
                        })
                        .expectJSONTypes({
                            "id": String,
                            "name": String,
                            "properties": function (value) {
                                expect(typeof value).toBe('object');
                                expect(typeof value[0]).toBe('object');
                                expect(typeof value[0].name).toBe('string');
                                expect(typeof value[0].value).toBe('string');
                                expect(typeof value[0].signature).toBe('string');
                            }
                        })
                        .after(function () {
                            syncTestRunner.runNext();
                        })
                        .toss();
                })
                .toss();
        })
);


function textureValueValidator(value) {
    value = base64Decode(value);

    expect(typeof value).toBe('object');

    expect(typeof value.timestamp).toBe('number');
    expect(Math.abs(moment().unix() - value.timestamp)).toBeLessThan(60);

    expect(typeof value.profileId).toBe('string');
    expect(value.profileId).toBe('650bed2c9ef54b5fb02c61fa493c68b5');

    expect(typeof value.textures).toBe('object');
    expect(typeof value.textures.SKIN).toBe('object');
    expect(typeof value.textures.SKIN.url).toBe('string');
    expect(value.textures.SKIN.url).toBe('https://minecraft.net/images/steve.png');

    return true;
}

function signatureValidator(value, signature) {
    var crt = fs.readFileSync('./cert/sessionserver/certificate.crt', 'utf8');
    var verifier = crypto.createVerify('sha1WithRSAEncryption');

    verifier.update(value);
    expect(verifier.verify(crt, signature, 'base64')).toBe(true);
    return true;
}

function base64Decode(str) {
    var buffer = new Buffer(str, 'base64');

    try {
        return JSON.parse(buffer.toString('ascii'));
    } catch (err) {
        return null;
    }
}
