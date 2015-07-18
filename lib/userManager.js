var config = require('config');
var crypto = require('crypto');

module.exports = (function () {
    var users = config.get('users'),

        authenticate = function (user, password) {
            var success = false;
            users.forEach(function (elem) {
                if (elem.username == user) {
                    success = password && elem.password == crypto.createHash(config.get('hashAlgorithm')).update(password).digest("hex");
                }
            });
            return success;
        },
        generateAccessToken = function (user) {
            var token = false;
            users.forEach(function (elem) {
                if (elem.username == user) {
                    token = elem.accessToken = makeAccessToken(elem.username);
                }
            });
            return token;
        },
        setClientToken = function (user, token) {
            var newToken = false;
            users.forEach(function (elem) {
                if (elem.username == user) {
                    if (token) {
                        newToken = elem.clientToken = token;
                    } else {
                        newToken = elem.clientToken = makeClientToken(elem.username);
                    }
                }
            });
            return newToken;
        },
        getUserId = function (user) {
            var id = false;
            users.forEach(function (elem) {
                if (elem.username == user) {
                    id = elem.id;
                }
            });
            return id;
        },
        getPlayerName = function (user) {
            var name = false;
            users.forEach(function (elem) {
                if (elem.username == user) {
                    name = elem.playerName;
                }
            });
            return name;
        },
        refreshAccessToken = function (accessToken, clientToken) {
            var token = false;
            users.forEach(function (elem) {
                if (elem.accessToken == accessToken && elem.clientToken == clientToken) {
                    token = elem.accessToken = makeAccessToken(elem.username);
                }
            });
            return token;
        },

        makeAccessToken = function (user) {
            return crypto.createHash("md5").update(user + "ACCESS" + new Date().getTime() + config.get('secret')).digest("hex");
        },
        makeClientToken = function (user) {
            return crypto.createHash("md5").update(user + "CLIENT" + new Date().getTime() + config.get('secret')).digest("hex");
        };

    return {
        authenticate: authenticate,
        generateAccessToken: generateAccessToken,
        setClientToken: setClientToken,
        getUserId: getUserId,
        getPlayerName: getPlayerName,
        refreshAccessToken: refreshAccessToken
    };
}());