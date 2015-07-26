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


// Validating UUID-s
var uuid = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");
for (var i in users) {
    if (!uuid.test(users[i].id)) {
        console.log('The following UUID is not valid in the config file: ', users[i].id);
        process.exit(1);
    }
}
