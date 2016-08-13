var config = require('config');
var crypto = require('crypto');
var moment = require('moment');

var drivers = [];

config.get('drivers').forEach(function (driver) {
    drivers.push(require('./driver/' + driver));
});


exports.authenticate = authenticate;
function authenticate(username, password, token) {
    return findUser(username)
        .then(function (result) {
            if (password && result.user.password === crypto.createHash(config.get('hashAlgorithm')).update(password).digest('hex')) {
                result.user.lastLogin = new Date();
                result.user.accessToken = makeAccessToken(result.user.username);
                result.user.clientToken = token ? token : makeClientToken(result.user.username);
                return result.driver.saveUser(result.user);
            }

            throw new Error('Authentication is unsuccessful.');
        })
        .then(function (user) {
            return {
                accessToken: user.accessToken,
                clientToken: user.clientToken,
                userId: createIdFromUUID(user.id),
                playerName: user.playerName
            }
        });
}

exports.getUserId = getUserId;
function getUserId(username) {
    return findUser(username)
        .then(function (result) {
            return createIdFromUUID(result.user.id);
        });
}

exports.refreshAccessToken = refreshAccessToken;
function refreshAccessToken(accessToken, clientToken) {
    return findUser(clientToken, 'clientToken')
        .then(function (result) {
            if (result.user.accessToken === accessToken) {
                result.user.accessToken = makeAccessToken(result.user.username);
                result.user.lastLogin = new Date();
                return result.driver.saveUser(result.user)
                    .then(function () {
                        return result.user.accessToken;
                    });
            }

            throw new Error('Access token refresh was unsuccessful.');
        });
}

exports.isAccessTokenAnActiveSession = isAccessTokenAnActiveSession;
function isAccessTokenAnActiveSession(accessToken) {
    return findUser(accessToken, 'accessToken')
        .then(function (result) {
            if (moment().subtract(2, 'hours').isBefore(result.user.lastLogin)) {
                return;
            }

            throw new Error('Session inactive.');
        });
}

exports.signOut = signOut;
function signOut(username, password) {
    return findUser(username)
        .then(function (result) {
            if (password && result.user.password === crypto.createHash(config.get('hashAlgorithm')).update(password).digest("hex")) {
                result.user.accessToken = undefined;
                return result.driver.saveUser(result.user);
            }

            throw new Error('Logging out was unsuccessful.');
        });
}

exports.invalidate = invalidate;
function invalidate(accessToken, clientToken) {
    return findUser(accessToken, 'accessToken')
        .then(function (result) {
            if (!clientToken || result.user.clientToken === clientToken) {
                result.user.accessToken = undefined;
                return result.driver.saveUser(result.user);
            }
        });
}

exports.sessionJoin = sessionJoin;
function sessionJoin(accessToken, selectedProfile, serverId) {
    return findUser(accessToken, 'accessToken')
        .then(function (result) {
            if (selectedProfile !== createIdFromUUID(result.user.id)) {
                throw new Error('Invalid selected profile.');
            }

            result.user.serverId = serverId;
            return result.driver.saveUser(result.user);
        });
}

exports.sessionHasJoined = sessionHasJoined;
function sessionHasJoined(playername, serverId) {
    return findUser(playername, 'playerName')
        .then(function (result) {
            if (serverId === result.user.serverId) {
                return result.user;
            }

            throw new Error('ServerId mismatch.');
        });
}

exports.nameToUUID = nameToUUID;
function nameToUUID(playername) {
    return findUser(playername, 'playerName')
        .then(function (result) {
            return createIdFromUUID(result.user.id);
        });
}

exports.getUserByUuid = getUserByUuid;
function getUserByUuid(uuid) {
    return findUser(createUUIDFromId(uuid), 'id')
        .then(function (result) {
            return result.user;
        });
}


function findUser(value, field) {
    if (!value) {
        return new Promise(function (resolve, reject) {
            resolve(null);
        });
    }

    if (!field) {
        field = 'username';
    }

    return findUserInDriver(field, value, 0);
}

function findUserInDriver(field, value, driverId) {
    return drivers[driverId].findUserBy(field, value)
        .then(function (user) {
            if (user) {
                return {
                    user: user,
                    driver: drivers[driverId]
                };
            }

            if (drivers.length === driverId + 1) {
                throw new Error('Value not found in any of the drivers!');
            }

            return findUserInDriver(field, value, driverId + 1);
        });
}

function makeAccessToken(username) {
    return crypto.createHash('md5').update(username + 'ACCESS' + new Date().getTime() + config.get('secret')).digest('hex');
}

function makeClientToken(username) {
    return crypto.createHash('md5').update(username + 'CLIENT' + new Date().getTime() + config.get('secret')).digest('hex');
}

function createIdFromUUID(uuid) {
    return uuid.replace(/-/g, '');
}

function createUUIDFromId(id) {
    return id.slice(0, 8) + '-' + id.slice(8, 12) + '-' + id.slice(12, 16) + '-' + id.slice(16, 20) + '-' + id.slice(20);
}
