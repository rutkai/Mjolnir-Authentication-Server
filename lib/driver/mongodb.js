var config = require('config');
var MongoClient = require('mongodb').MongoClient;
var users;

MongoClient.connect(config.get('mongodb.connectionStr'), function(err, db) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    users = db.collection('user');
});

exports.findUserBy = findUserBy;
function findUserBy(field, value) {
    var search = {};

    search[field] = value;
    users.find(search)

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
function addUser(user) {

}

exports.removeUser = removeUser;
function removeUser(user) {
    users.deleteOne(user);
}
