var config = require('config');
var MongoClient = require('mongodb').MongoClient;
var dbconn, users;

MongoClient.connect(config.get('mongodb.connectionStr'), function (err, client) {
    var db = client.db(config.get('mongodb.connectionStr').match(/\w+(?=\W*$)/)[0]);
    if (err) {
        console.log(err);
        process.exit(1);
    }

    dbconn = client;
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
    return users.insertOne(user);
}

exports.removeUser = removeUser;
function removeUser(user) {
    return users.deleteOne(user);
}

exports.close = close;
function close() {
    dbconn.close();
}
