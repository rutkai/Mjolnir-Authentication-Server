var promptly = require('promptly');
var Table = require('cli-table');

exports.getUser = getUser;
function getUser(driver) {
    console.log('You may find a user by Username or Player name:');
    return askOptField('Username')
        .then(function (username) {
            if (username) {
                return driver.findUserBy('username', username);
            }

            return askOptField('Player name')
                .then(function (playerName) {
                    if (!playerName) {
                        throw Error('Cancelled');
                    }

                    return driver.findUserBy('playerName', playerName);
                });
        });
}

exports.dumpUser = dumpUser;
function dumpUser(user) {
    var table = new Table({});
    table.push(
        {'Username': user.username},
        {'Password': user.password ? '********' : 'DISABLED'},
        {'Player name': user.playerName},
        {'Skin': user.skinUrl ? user.skinUrl : 'NOT SET'},
        {'Cape': user.capeUrl ? user.capeUrl : 'NOT SET'}
    );
    console.log(table.toString());
}

exports.askOptField = askOptField;
function askOptField(field) {
    return new Promise(function (resolve, reject) {
        promptly.prompt(field + ': ', {default: -1}, function (err, value) {
            if (value !== -1) {
                resolve(value);
            }

            resolve(null);
        });
    });
}

exports.askReqField = askReqField;
function askReqField(field) {
    return promptly.prompt(field + ': ');
}

exports.askPassword = askPassword;
function askPassword(message, optional) {
    return promptly.password(message + ': ', {default: optional ? '' : null});
}

exports.askConfirm = askConfirm;
function askConfirm(question) {
    return new Promise(function (resolve, reject) {
        promptly.confirm(question, function (err, value) {
            if (value) {
                return resolve()
            }

            reject();
        });
    });
}
