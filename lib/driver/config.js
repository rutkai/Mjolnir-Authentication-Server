var config = require('config');

var users = config.get('users');

exports.findUserBy = findUserBy;
function findUserBy(field, value) {
    return new Promise(function (resolve, reject) {
        for (var i in users) {
            if (caseInsensitiveEqual(users[i][field], value)) {
                return resolve(users[i]);
            }
        }

        return resolve(null);
    });
}

exports.saveUser = saveUser;
function saveUser(user) {
    return new Promise(function (resolve, reject) {
        for (var i in users) {
            if (users[i].id === user.id) {
                users[i] = user;
                return resolve(user);
            }
        }

        reject('User not found!');
    });
}

exports.addUser = addUser;
function addUser() {
    throw new Error('Invalid operation!');
}

exports.removeUser = removeUser;
function removeUser() {
    throw new Error('Invalid operation!');
}

exports.close = close;
function close() {
    // noop
}


function caseInsensitiveEqual(left, right) {
    return !!(left === right || typeof left === 'string' && typeof right === 'string' && left.toLowerCase() === right.toLowerCase());
}


// Validating UUID-s
var uuid = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");
for (var i in users) {
    if (!uuid.test(users[i].id)) {
        console.log('The following UUID is not valid in the config file: ', users[i].id);
        process.exit(1);
    }
}
