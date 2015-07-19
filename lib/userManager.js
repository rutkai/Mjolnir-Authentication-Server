var config = require('config');
var crypto = require('crypto');
var moment = require('moment');

var drivers = [];

config.get('drivers').forEach(function (driver) {
    drivers.push(require('./driver/' + driver));
});


exports.authenticate = authenticate;
function authenticate(username, password) {
    var isAuthenticated = false;

    findUser(username, function (user, driver) {
        if (isAuthenticated = password && user.password === crypto.createHash(config.get('hashAlgorithm')).update(password).digest("hex")) {
            user.lastLogin = new Date();
            driver.saveUser(user);
        }
    });

    return isAuthenticated;
}

exports.generateAccessToken = generateAccessToken;
function generateAccessToken(username) {
    var token = false;

    findUser(username, function (user, driver) {
        token = user.accessToken = makeAccessToken(user.username);
        driver.saveUser(user);
    });

    return token;
}

exports.setClientToken = setClientToken;
function setClientToken(username, token) {
    var newToken = false;

    findUser(username, function (user, driver) {
        newToken = user.clientToken = token ? token : makeClientToken(user.username);
        driver.saveUser(user);
    });

    return newToken;
}

exports.getUserId = getUserId;
function getUserId(username) {
    var id = false;

    findUser(username, function (user) {
        id = user.id;
    });

    return id;
}

exports.getPlayerName = getPlayerName;
function getPlayerName(username) {
    var name = false;

    findUser(username, function (user) {
        name = user.playerName;
    });

    return name;
}

exports.refreshAccessToken = refreshAccessToken;
function refreshAccessToken(accessToken, clientToken) {
    var token = false;

    findUser(clientToken, 'clientToken', function (user, driver) {
        if (user.accessToken === accessToken) {
            token = user.accessToken = makeAccessToken(user.username);
            driver.saveUser(user);
        }
    });

    return token;
}

exports.isAccessTokenAnActiveSession = isAccessTokenAnActiveSession;
function isAccessTokenAnActiveSession(accessToken) {
    var isActive = false;

    findUser(accessToken, 'accessToken', function (user) {
        isActive = moment().subtract(2, 'hours').isBefore(user.lastLogin);
    });

    return isActive;
}


function findUser(username, field, callback) {
    var user;

    if (typeof field === 'function') {
        callback = field;
        field = 'username';
    }

    for (var i in drivers) {
        if (user = drivers[i].findUserBy(field, username)) {
            callback(user, drivers[i]);
            return true;
        }
    }

    return false;
}

function makeAccessToken(username) {
    return crypto.createHash("md5").update(username + "ACCESS" + new Date().getTime() + config.get('secret')).digest("hex");
}

function makeClientToken(username) {
    return crypto.createHash("md5").update(username + "CLIENT" + new Date().getTime() + config.get('secret')).digest("hex");
}
