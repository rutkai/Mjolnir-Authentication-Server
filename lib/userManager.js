var config = require('config');
var crypto = require('crypto');
var moment = require('moment');

var drivers = [];

config.get('drivers').forEach(function (driver) {
    drivers.push(require('./driver/' + driver));
});


exports.authenticate = authenticate;
function authenticate(username, password) {
    return new Promise(function (resolve, reject) {
        var isAuthenticated = false;

        findUser(username, function (user, driver) {
            if (isAuthenticated = password && user.password === crypto.createHash(config.get('hashAlgorithm')).update(password).digest('hex')) {
                user.lastLogin = new Date();
                driver.saveUser(user);
            }
        });

        return isAuthenticated ? resolve() : reject();
    });
}

exports.generateAccessToken = generateAccessToken;
function generateAccessToken(username) {
    return new Promise(function (resolve, reject) {
        var token = false;

        findUser(username, function (user, driver) {
            token = user.accessToken = makeAccessToken(user.username);
            driver.saveUser(user);
        });

        return token ? resolve(token) : reject();
    });
}

exports.setClientToken = setClientToken;
function setClientToken(username, token) {
    return new Promise(function (resolve, reject) {
        var newToken = false;

        findUser(username, function (user, driver) {
            newToken = user.clientToken = token ? token : makeClientToken(user.username);
            driver.saveUser(user);
        });

        return newToken ? resolve(newToken) : reject();
    });
}

exports.getUserId = getUserId;
function getUserId(username) {
    return new Promise(function (resolve, reject) {
        var id = false;

        findUser(username, function (user) {
            id = createIdFromUUID(user.id);
        });

        return id ? resolve(id) : reject();
    });
}

exports.getPlayerName = getPlayerName;
function getPlayerName(username) {
    return new Promise(function (resolve, reject) {
        var name = false;

        findUser(username, function (user) {
            name = user.playerName;
        });

        return name ? resolve(name) : reject;
    });
}

exports.refreshAccessToken = refreshAccessToken;
function refreshAccessToken(accessToken, clientToken) {
    return new Promise(function (resolve, reject) {
        var token = false;

        findUser(clientToken, 'clientToken', function (user, driver) {
            if (user.accessToken === accessToken) {
                token = user.accessToken = makeAccessToken(user.username);
                user.lastLogin = new Date();
                driver.saveUser(user);
            }
        });

        return token ? resolve(token) : reject();
    });
}

exports.isAccessTokenAnActiveSession = isAccessTokenAnActiveSession;
function isAccessTokenAnActiveSession(accessToken) {
    return new Promise(function (resolve, reject) {
        var isActive = false;

        findUser(accessToken, 'accessToken', function (user) {
            isActive = moment().subtract(2, 'hours').isBefore(user.lastLogin);
        });

        return isActive ? resolve() : reject();
    });
}

exports.signOut = signOut;
function signOut(username, password) {
    return new Promise(function (resolve, reject) {
        var success = false;

        findUser(username, function (user, driver) {
            if (success = password && user.password === crypto.createHash(config.get('hashAlgorithm')).update(password).digest("hex")) {
                user.accessToken = undefined;
                driver.saveUser(user);
            }
        });

        return success ? resolve() : reject();
    });
}

exports.invalidate = invalidate;
function invalidate(accessToken, clientToken) {
    return new Promise(function (resolve, reject) {
        findUser(accessToken, 'accessToken', function (user, driver) {
            if (!clientToken || user.clientToken === clientToken) {
                user.accessToken = undefined;
                driver.saveUser(user);
            }
        });

        return resolve();
    });
}

exports.sessionJoin = sessionJoin;
function sessionJoin(accessToken, selectedProfile, serverId) {
    return new Promise(function (resolve, reject) {
        var success = false;

        findUser(accessToken, 'accessToken', function (user, driver) {
            if (selectedProfile !== createIdFromUUID(user.id)) {
                return;
            }

            user.serverId = serverId;
            driver.saveUser(user);
            success = true;
        });

        return success ? resolve() : reject();
    });
}

exports.sessionHasJoined = sessionHasJoined;
function sessionHasJoined(playername, serverId) {
    return new Promise(function (resolve, reject) {
        var result = false;

        findUser(playername, 'playerName', function (user) {
            if (serverId === user.serverId) {
                result = user;
            }
        });

        return result ? resolve(result) : reject();
    });
}

exports.nameToUUID = nameToUUID;
function nameToUUID(playername) {
    return new Promise(function (resolve, reject) {
        var result = false;

        findUser(playername, 'playerName', function (user) {
            result = createIdFromUUID(user.id);
        });

        return result ? resolve(result) : reject();
    });
}

exports.getUserByUuid = getUserByUuid;
function getUserByUuid(uuid) {
    return new Promise(function (resolve, reject) {
        var result = false;

        findUser(createUUIDFromId(uuid), 'id', function (user) {
            result = user;
        });

        return result ? resolve(result) : reject();
    });
}


function findUser(value, field, callback) {
    if (!value) {
        return;
    }

    if (typeof field === 'function') {
        callback = field;
        field = 'username';
    }

    var user;
    for (var i in drivers) {
        if (user = drivers[i].findUserBy(field, value)) {
            callback(user, drivers[i]);
        }
    }
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
