var config = require('config');
var packageConf = require('../package.json');
var logger = require('./logger');
var userManager = require('./userManager');


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

    if (!request.body.accessToken) {
        logger.log("  Missing access token");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "Access Token can not be null or empty."
        });
        return;
    }

    if (!request.body.serverId) {
        logger.log("  Missing server id");
        response.json({
            "error": "IllegalArgumentException",
            "errorMessage": "ServerId can not be null or empty."
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
    logger.log("Session has joined request");
    console.log(request.query);

    response.json({});
}
