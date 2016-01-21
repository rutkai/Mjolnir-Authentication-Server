var config = require('config');

var users = config.get('users');

exports.findUserBy = findUserBy;
function findUserBy(field, value) {
    for (var i in users) {
        if (caseInsensitiveEqual(users[i][field], value)) {
            return users[i];
        }
    }

    return null;
}

exports.saveUser = saveUser;
function saveUser(user) {
    for (var i in users) {
        if (users[i].id === user.id) {
            users[i] = user;
            return;
        }
    }
}

exports.addUser = addUser;
function addUser() {
    throw new Error('Invalid operation!');
}

exports.removeUser = removeUser;
function removeUser() {
    throw new Error('Invalid operation!');
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
