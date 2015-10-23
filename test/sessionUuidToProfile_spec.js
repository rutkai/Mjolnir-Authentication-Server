var frisby = require('frisby');
var config = require('config');
var moment = require('moment');
var crypto = require('crypto');
var fs = require('fs');
var httpPort = config.get('sessionserver.httpPort');

frisby.create('Getting a non-existent UUID gives empty response')
    .get('http://localhost:' + httpPort + '/session/minecraft/profile/nonexistent')
    .expectStatus(204)
    .toss();

frisby.create('Getting a valid UUID gives player data without cape')
    .get('http://localhost:' + httpPort + '/session/minecraft/profile/650bed2c9ef54b5fb02c61fa493c68b5')
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
    .toss();

frisby.create('Getting a valid UUID gives player data with cape')
    .get('http://localhost:' + httpPort + '/session/minecraft/profile/1294fda6159c4218be4c89b660d9cf32')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "id": "1294fda6159c4218be4c89b660d9cf32",
        "name": "testPlayerOld",
        "properties": function (value) {
            var properties = base64Decode(value[0].value);

            expect(typeof properties.textures.CAPE).toBe('object');
            expect(typeof properties.textures.CAPE.url).toBe('string');
            expect(properties.textures.CAPE.url).toBe('https://authserver.mojang.com/images/cape/mycape.png');
        }
    })
    .toss();

frisby.create('Getting a valid UUID gives no signature if we don\'t want it')
    .get('http://localhost:' + httpPort + '/session/minecraft/profile/650bed2c9ef54b5fb02c61fa493c68b5?unsigned=true')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "id": "650bed2c9ef54b5fb02c61fa493c68b5",
        "name": "testPlayer",
        "properties": function (value) {
            expect(typeof value[0].signature).toBe('undefined');
        }
    })
    .toss();


function textureValueValidator(value) {
    value = base64Decode(value);

    expect(typeof value).toBe('object');

    expect(typeof value.timestamp).toBe('number');
    expect(Math.abs(moment().unix() - value.timestamp)).toBeLessThan(60);

    expect(typeof value.profileId).toBe('string');
    expect(value.profileId).toBe('650bed2c9ef54b5fb02c61fa493c68b5');

    expect(typeof value.profileName).toBe('string');
    expect(value.profileName).toBe('testPlayer');

    expect(typeof value.isPublic).toBe('boolean');
    expect(value.isPublic).toBe(true);

    expect(typeof value.textures).toBe('object');
    expect(typeof value.textures.SKIN).toBe('object');
    expect(typeof value.textures.SKIN.url).toBe('string');
    expect(value.textures.SKIN.url).toBe('https://authserver.mojang.com/images/skin/steve.png');

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
