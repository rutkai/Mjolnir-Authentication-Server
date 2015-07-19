var config = require('config');

var users = config.get('users');

exports.findUserBy = findUserBy;
function findUserBy(field, value) {
    for (var i in users) {
        if (users[i][field] === value) {
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
