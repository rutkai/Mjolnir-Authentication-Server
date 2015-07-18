var config = require('config');
var logger = require('./logger');
var userManager = require('./userManager');

module.exports = {
    root: function (request, response) {
        logger.log("Server info is requested");
        response.json({
            'Status': 'OK',
            'Runtime-Mode': 'productionMode',
            'Application-Author': 'András Rutkai',
            'Application-Description': 'Mjolnir Authentication Server',
            'Specification-Version': '1.0.0',
            'Application-Name': 'mjolnir.auth.server',
            'Implementation-Version': '1.0.0',
            'Application-Owner': config.get('serverOwner')
        });
    },
    authenticate: function (request, response) {
        var userId, playerName, jsonResponse;

        logger.log("Authentication request, user: " + request.body.username);

        if (!userManager.authenticate(request.body.username, request.body.password)) {
            logger.log("  Bad credentials");
            response.json({
                error: "ForbiddenOperationException",
                errorMessage: "Invalid credentials. Invalid username or password."
            });
            return;
        }

        logger.log("  Success");
        jsonResponse = {
            accessToken: userManager.generateAccessToken(request.body.username),
            clientToken: userManager.setClientToken(request.body.username, request.body.clientToken)
        };
        if (request.body.agent) {
            userId = userManager.getUserId(request.body.username);
            playerName = userManager.getPlayerName(request.body.username);

            jsonResponse.selectedProfile = {
                id: userId,
                name: playerName
            };
            jsonResponse.availableProfiles = [
                {
                    id: userId,
                    name: playerName
                }
            ];
        }

        response.json(jsonResponse);
    },
    refresh: function (request, response) {
        var jsonResponse, accessToken = userManager.refreshAccessToken(request.body.accessToken, request.body.clientToken);

        logger.log("Refresh request");

        if (!request.body.accessToken) {
            logger.log("  Missing access token");
            response.json({
                error: "IllegalArgumentException",
                errorMessage: "Access Token can not be null or empty."
            });
            return;
        }
        if (!accessToken) {
            logger.log("  Invalid token");
            response.json({
                error: "ForbiddenOperationException",
                errorMessage: "Invalid token."
            });
            return;
        }

        logger.log("  Token refreshed");
        jsonResponse = {
            accessToken: accessToken,
            clientToken: request.body.clientToken
        };
        if (request.body.selectedProfile) {
            jsonResponse.selectedProfile = request.body.selectedProfile;
        }

        response.json(jsonResponse);
    },
    validate: function (request, response) {
        logger.log("Validation request");
        response.json({});
    },
    signOut: function (request, response) {
        logger.log("Logout request");
        response.json({});
    },
    invalidate: function (request, response) {
        logger.log("Invalidation request");
        response.json({});
    }
};