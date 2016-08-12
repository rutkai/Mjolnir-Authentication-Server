var config = require('config');
var MongoClient = require('mongodb').MongoClient;
var users;

MongoClient.connect(config.get('mongodb.connectionStr'), function (err, db) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    users = db.collection('user');
});

exports.findUserBy = findUserBy;
function findUserBy(field, value) {
    var search = {};

    if (field === 'playerName') {
        field = 'playerNameIndex';
        value = value.toLowerCase();
    }

    search[field] = value;
    return users.find(search).limit(1).next();
}

exports.saveUser = saveUser;
function saveUser(user) {
    return users.replaceOne({_id: user._id}, user)
        .then(function () {
            return user;
        });
}

exports.addUser = addUser;
function addUser(user) {

}

exports.removeUser = removeUser;
function removeUser(user) {
    users.deleteOne(user);
}
