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
    logger.log("Authentication request, user: " + request.body.username);

    var actions = [
        userManager.authenticate(request.body.username, request.body.password),
        userManager.generateAccessToken(request.body.username),
        userManager.setClientToken(request.body.username, request.body.clientToken)
    ];
    if (request.body.agent) {
        actions.push(userManager.getUserId(request.body.username));
        actions.push(userManager.getPlayerName(request.body.username));
    }

    Promise.all(actions)
        .then(function (results) {
            var accessToken = results[1];
            var clientToken = results[2];

            logger.log("  Success");
            var jsonResponse = {
                "accessToken": accessToken,
                "clientToken": clientToken
            };
            if (request.body.agent) {
                var userId = results[3];
                var playerName = results[4];

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
        })
        .catch(function () {
            logger.log("  Bad credentials");
            response.json({
                "error": "ForbiddenOperationException",
                "errorMessage": "Invalid credentials. Invalid username or password."
            });
        });
}

exports.refresh = refresh;
function refresh(request, response) {
    logger.log("Refresh request");

    if (!request.body.accessToken) {
        logger.log("  Missing access token");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Access Token can not be null or empty."
        });
        return;
    }

    userManager.refreshAccessToken(request.body.accessToken, request.body.clientToken)
        .then(function (accessToken) {
            var jsonResponse;

            logger.log("  Token refreshed");
            jsonResponse = {
                "accessToken": accessToken,
                "clientToken": request.body.clientToken
            };
            if (request.body.selectedProfile) {
                jsonResponse.selectedProfile = request.body.selectedProfile;
            }

            response.json(jsonResponse);
        })
        .catch(function () {
            logger.log("  Invalid token");
            response.json({
                "error": "ForbiddenOperationException",
                "errorMessage": "Invalid token."
            });
        });
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

    userManager.isAccessTokenAnActiveSession(request.body.accessToken)
        .then(function () {
            logger.log("  Access token is valid");
            response.json({});
        })
        .catch(function () {
            logger.log("  Invalid access token");
            response.json({
                "error": "ForbiddenOperationException",
                "errorMessage": "Invalid token"
            });
        });
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

    userManager.signOut(request.body.username, request.body.password)
        .then(function () {
            logger.log("  Success");
            response.json({});
        })
        .catch(function () {
            logger.log("  Invalid password");
            response.json({
                "error": "ForbiddenOperationException",
                "errorMessage": "Invalid credentials. Invalid username or password."
            });
        });
}

exports.invalidate = invalidate;
function invalidate(request, response) {
    logger.log("Invalidation request");

    if (request.body.accessToken) {
        userManager.invalidate(request.body.accessToken, request.body.clientToken)
            .then(function () {
                response.json({});
            })
            .catch(function () {
                response.json({});
            });
        return;
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

    userManager.sessionJoin(request.body.accessToken, request.body.selectedProfile, request.body.serverId)
        .then(function () {
            logger.log("  Success");
            response.json({});
        })
        .catch(function () {
            logger.log("  Invalid access token");
            response.json({
                "error": "ForbiddenOperationException",
                "errorMessage": "Invalid token"
            });
        });
}

exports.sessionHasJoined = sessionHasJoined;
function sessionHasJoined(request, response) {
    logger.log("Session has joined request");

    if (!request.query.username || !request.query.serverId) {
        logger.log("  Invalid parameters");
        response.json({});
    }

    userManager.sessionHasJoined(request.query.username, request.query.serverId)
        .then(function (user) {
            return createFullProfileResponse(user, false);
        })
        .then(function (jsonResponse) {
            logger.log("  Success");

            response.json(jsonResponse);
        })
        .catch(function () {
            logger.log("  Invalid parameters");
            response.json({});
        });
}

exports.sessionUUIDToProfile = sessionUUIDToProfile;
function sessionUUIDToProfile(request, response) {
    logger.log("UUID -> Profile request");

    userManager.getUserByUuid(request.params.uuid)
        .then(function (user) {
            return createFullProfileResponse(user, request.query.unsigned);
        })
        .then(function (jsonResponse) {
            logger.log("  Success");

            response.json(jsonResponse);
        })
        .catch(function () {
            logger.log("  UUID doesn't exist");
            response.status(204).json({});
        });
}

exports.apiNameToUUID = apiNameToUUID;
function apiNameToUUID(request, response) {
    logger.log("Name -> UUID request with name: " + request.params.name);

    if (!request.params.name) {
        logger.log("  Missing name");
        response.status(400).json({
            "error": "IllegalArgumentException",
            "errorMessage": "Name is missing."
        });
        return;
    }

    userManager.nameToUUID(request.params.name)
        .then(function (userId) {
            logger.log("  User found");
            response.json({
                "id": userId,
                "name": request.params.name
            });
        })
        .catch(function () {
            logger.log("  Name doesn't exist");
            response.status(204).json({});
        });
}

exports.apiUUIDToName = apiUUIDToName;
function apiUUIDToName(request, response) {
    logger.log("UUID -> Name history request");

    userManager.getUserByUuid(request.params.uuid)
        .then(function (user) {
            logger.log("  UUID found");
            response.json([{
                "name": user.playerName
            }]);
        })
        .catch(function () {
            logger.log("  UUID doesn't exist");
            response.status(204).json({});
        });
}

exports.apiPlayernamesToUUID = apiPlayernamesToUUID;
function apiPlayernamesToUUID(request, response) {
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

    var queries = [];
    for (var i in request.body) {
        if (typeof request.body[i] !== 'string' || !request.body[i]) {
            response.json({
                "error": "IllegalArgumentException",
                "errorMessage": "Empty username."
            });
        }

        var query = userManager.nameToUUID(request.body[i])
            .then(function (userId) {
                logger.log("  User found");

                return userManager.getUserByUuid(userId)
                    .then(function (user) {
                        return {
                            "id": userId,
                            "name": user.playerName
                        };
                    });
            })
            .catch(function () {
                logger.log("  User not found");
            });
        queries.push(query);
    }

    Promise.all(queries)
        .then(function (results) {
            logger.log("  Users are fetched");
            response.json(results);
        })
        .catch(function () {
            response.json([]);
        });
}


function createFullProfileResponse(user, unsigned) {
    return userManager.getUserId(user.username)
        .then(function (profileId) {
            var value = {
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

            var response = {
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
        });
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
