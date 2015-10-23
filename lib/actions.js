var config = require('config');
var moment = require('moment');
var crypto = require('crypto');
var packageConf = require('../package.json');
var logger = require('./logger');
var userManager = require('./userManager');
var keychain = require('./keychain');


// Authserver actions
exports.root = root;
function root(request, response) {
    logger.log("Server info is requested");
    response.json({
        "Status": 'OK',
        "Runtime-Mode": 'productionMode',
        "Application-Author": 'András Rutkai',
        "Application-Description": packageConf.name,
        "Specification-Version": '2.13.34',
        "Application-Name": 'mjolnir.auth.server',
        "Implementation-Version": packageConf.version,
        "Application-Owner": config.get('serverOwner')
    });
}

exports.authenticate = authenticate;
function authenticate(request, response) {
    var userId, playerName, jsonResponse;

    logger.log("Authentication request, user: " + request.body.username);

    if (!userManager.authenticate(request.body.username, request.body.password)) {
        logger.log("  Bad credentials");
        response.json({
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid credentials. Invalid username or password."
        });
        return;
    }

    logger.log("  Success");
    jsonResponse = {
        "accessToken": userManager.generateAccessToken(request.body.username),
        "clientToken": userManager.setClientToken(request.body.username, request.body.clientToken)
    };
    if (request.body.agent) {
        userId = userManager.getUserId(request.body.username);
        playerName = userManager.getPlayerName(request.body.username);

        jsonResponse.selectedProfile = {
            "id": userId,
            "name": playerName
        };
        jsonResponse.availableProfiles = [
            {
                "id": userId,
                "name": playerName
            }
        ];
    }

    response.json(jsonResponse);
}

exports.refresh = refresh;
function refresh(request, response) {
    var jsonResponse, accessToken = userManager.refreshAccessToken(request.body.accessToken, request.body.clientToken);

    logger.log("Refresh request");

    if (!request.body.accessToken) {
        logger.log("  Missing access token");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Access Token can not be null or empty."
        });
        return;
    }
    if (!accessToken) {
        logger.log("  Invalid token");
        response.json({
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid token."
        });
        return;
    }

    logger.log("  Token refreshed");
    jsonResponse = {
        "accessToken": accessToken,
        "clientToken": request.body.clientToken
    };
    if (request.body.selectedProfile) {
        jsonResponse.selectedProfile = request.body.selectedProfile;
    }

    response.json(jsonResponse);
}

exports.validate = validate;
function validate(request, response) {
    logger.log("Validation request");

    if (!request.body.accessToken) {
        logger.log("  Missing access token");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Access Token can not be null or empty."
        });
        return;
    }

    if (!userManager.isAccessTokenAnActiveSession(request.body.accessToken)) {
        logger.log("  Invalid access token");
        response.json({
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid token"
        });
        return;
    }

    logger.log("  Access token is valid");
    response.json({});
}

exports.signOut = signOut;
function signOut(request, response) {
    logger.log("Logout request, user: " + request.body.username);

    if (!request.body.username) {
        logger.log("  Missing username");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Access Token can not be null or empty."
        });
        return;
    }

    if (!userManager.signOut(request.body.username, request.body.password)) {
        logger.log("  Invalid password");
        response.json({
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid credentials. Invalid username or password."
        });
        return;
    }

    logger.log("  Success");
    response.json({});
}

exports.invalidate = invalidate;
function invalidate(request, response) {
    logger.log("Invalidation request");

    if (request.body.accessToken) {
        userManager.invalidate(request.body.accessToken, request.body.clientToken);
    }

    response.json({});
}


// Sessionserver actions
exports.sessionJoin = sessionJoin;
function sessionJoin(request, response) {
    logger.log("Session join request");

    if (!request.body.serverId) {
        logger.log("  Missing server id");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "accessToken.getServerId() can not be null or empty."
        });
        return;
    }

    if (!request.body.accessToken) {
        logger.log("  Missing access token");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Access Token can not be null or empty."
        });
        return;
    }

    if (!request.body.selectedProfile) {
        logger.log("  Missing access token");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "selectedProfile can not be null."
        });
        return;
    }

    if (!userManager.sessionJoin(request.body.accessToken, request.body.selectedProfile, request.body.serverId)) {
        logger.log("  Invalid access token");
        response.json({
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid token"
        });
        return;
    }

    logger.log("  Success");
    response.json({});
}

exports.sessionHasJoined = sessionHasJoined;
function sessionHasJoined(request, response) {
    var jsonReponse, user;

    logger.log("Session has joined request");

    if (request.query.username && request.query.serverId && (user = userManager.sessionHasJoined(request.query.username, request.query.serverId))) {
        jsonReponse = createFullProfileResponse(user, false);
        logger.log("  Success");

        response.json(jsonReponse);
        return;
    }

    logger.log("  Invalid parameters");
    response.json({});
}

exports.sessionUUIDToProfile = sessionUUIDToProfile;
function sessionUUIDToProfile(request, response) {
    var jsonReponse, user;

    logger.log("UUID -> Profile request");

    if (user = userManager.getUserByUuid(request.params.uuid)) {
        jsonReponse = createFullProfileResponse(user, request.query.unsigned);
        logger.log("  Success");

        response.json(jsonReponse);
        return;
    }

    logger.log("  UUID doesn't exist");
    response.status(204).json({});
}

exports.apiNameToUUID = apiNameToUUID;
function apiNameToUUID(request, response) {
    var userId;

    logger.log("Name -> UUID request with name: " + request.params.name);

    if (!request.params.name) {
        logger.log("  Missing name");
        response.status(400).json({
            "error": "IllegalArgumentException",
            "errorMessage": "Name is missing."
        });
        return;
    }

    if (userId = userManager.nameToUUID(request.params.name)) {
        logger.log("  User found");
        response.json({
            "id": userId,
            "name": request.params.name
        });
        return;
    }

    logger.log("  Name doesn't exist");
    response.status(204).json({});
}

exports.apiUUIDToName = apiUUIDToName;
function apiUUIDToName(request, response) {
    var user;

    logger.log("UUID -> Name history request");

    if (user = userManager.getUserByUuid(request.params.uuid)) {
        logger.log("  UUID found");
        response.json([{
            "name": user.playerName
        }]);
        return;
    }

    logger.log("  UUID doesn't exist");
    response.status(204).json({});
}

exports.apiPlayernamesToUUID = apiPlayernamesToUUID;
function apiPlayernamesToUUID(request, response) {
    var user, userId, results = [];

    logger.log("Bulk name -> UUID request");

    if (typeof request.body !== 'object') {
        logger.log("  Invalid list");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Invalid payload."
        });
        return;
    }

    if (Object.keys(request.body).length > 100) {
        logger.log("  Too many names");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Too many names."
        });
        return;
    }

    for (var i in request.body) {
        if (typeof request.body[i] === 'string' && request.body[i]) {
            if (userId = userManager.nameToUUID(request.body[i])) {
                user = userManager.getUserByUuid(userId);
                logger.log("  User found");
                results.push({
                    "id": userId,
                    "name": user.playerName
                });
            } else {
                logger.log("  User not found");
            }
        } else {
            response.json({
                "error": "IllegalArgumentException",
                "errorMessage": "Empty username."
            });
            return;
        }
    }

    logger.log("  Users are fetched");
    response.json(results);
}


function createFullProfileResponse(user, unsigned) {
    var profileId, value, response;

    profileId = userManager.getUserId(user.username);
    value = {
        "timestamp": moment().unix(),
        "profileId": profileId,
        "profileName": user.playerName,
        "isPublic": true,
        "textures": {
            "SKIN": {
                "url": "https://" + config.get("serverDomain") + "/images/skin/" + (user.skinUrl ? user.skinUrl : "steve.png")
            }
        }
    };
    if (user.capeUrl) {
        value["textures"]["CAPE"] = {
            "url": "https://" + config.get("serverDomain") + "/images/cape/" + user.capeUrl
        }
    }

    value = toBase64(value);

    response = {
        "id": profileId,
        "name": user.playerName,
        "properties": [
            {
                "name": "textures",
                "value": value
            }
        ]
    };
    if (!unsigned) {
        response["properties"][0]["signature"] = generateSignature(value);
    }

    return response;
}

function toBase64(obj) {
    var buffer = new Buffer(JSON.stringify(obj));
    return buffer.toString('base64');
}

function generateSignature(value) {
    var key = keychain.get('sessionserver.key');
    var signature = crypto.createSign('sha1WithRSAEncryption');

    signature.update(value);
    return signature.sign(key, 'base64');
}
