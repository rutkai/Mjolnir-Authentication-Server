var fs = require('fs');
var config = require('config');
var driver = require('./lib/driver/mongodb');
var promptly = require('promptly');
var helper = require('./lib/cli/userHelper');
var crypto = require('crypto');
var uuid = require('node-uuid');

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('show', 'Shows the data of an existing user.')
    .command('create', 'Creates a new user.')
    .command('update', 'Updates an existing user.')
    .command('delete', 'Removed a user from database.')
    .demand(1)
    .help('h')
    .alias('h', 'help')
    .argv;

switch (argv._[0]) {
    case 'show':
        show();
        break;
    case 'create':
        create();
        break;
    case 'update':
        update();
        break;
    case 'delete':
        del();
        break;
    default:
        console.log('Invalid command! Use --help for more information.');
        process.exit(1);
        break;
}


function show() {
    helper.getUser(driver)
        .then(function (user) {
            if (!user) {
                return console.log('User cannot be found!');
            }

            helper.dumpUser(user);
        })
        .catch(function () {
        })
        .then(function () {
            driver.close();
        });
}

function create() {
    var user = {};

    helper.askReqField('Username (required)')
        .then(function (username) {
            user.username = username;
            return helper.askPassword('Password (required)');
        })
        .then(function (password) {
            user.password = crypto.createHash(config.get('hashAlgorithm')).update(password).digest("hex");
            return helper.askReqField('Player name (required)');
        })
        .then(function (playerName) {
            user.playerName = playerName;
            return helper.askOptField('Skin (optional)');
        })
        .then(function (skin) {
            user.skinUrl = skin ? skin : 'steve.png';
            try {
                fs.accessSync('./images/skin/' + user.skinUrl);
            } catch (err) {
                console.log('Skin does not exist!');
                throw err;
            }

            return helper.askOptField('Cape (optional)');
        })
        .then(function (cape) {
            user.capeUrl = cape;
            if (user.capeUrl) {
                try {
                    fs.accessSync('./images/cape/' + user.skinUrl);
                } catch (err) {
                    console.log('Cape does not exist!');
                    throw err;
                }
            }
        })
        .then(function () {
            return driver.findUserBy('username', user.username)
        })
        .then(function (user) {
            if (user) {
                console.log('Username already exists!');
                throw Error('Username already exists!');
            }
        })
        .then(function () {
            return driver.findUserBy('playerName', user.playerName);
        })
        .then(function (user) {
            if (user) {
                console.log('Player name already exists!');
                throw Error('Player name already exists!');
            }
        })
        .then(function () {
            helper.dumpUser(user);

            return helper.askConfirm('Are you sure you want to create this user?');
        })
        .then(function () {
            user.id = uuid.v4();
            user.playerNameIndex = user.playerName.toLowerCase();

            return driver.addUser(user);
        })
        .then(function () {
            console.log('User is added to the database!');
        })
        .catch(function (err) {
        })
        .then(function () {
            driver.close();
        });
}

function update() {
    var userDoc;

    helper.getUser(driver)
        .then(function (user) {
            if (!user) {
                console.log('User cannot be found!');
                throw Error('User cannot be found!');
            }

            helper.dumpUser(userDoc = user);

            return helper.askOptField('Username (leave blank for skip)');
        })
        .then(function (username) {
            if (username) {
                userDoc.username = username;
            }

            return driver.findUserBy('username', username);
        })
        .then(function (user) {
            if (user && user.id !== userDoc.id) {
                console.log('Username already exists!');
                throw Error('Username already exists!');
            }

            return helper.askPassword('Password (leave blank for skip)', true);
        })
        .then(function (password) {
            if (password) {
                userDoc.password = crypto.createHash(config.get('hashAlgorithm')).update(password).digest("hex");
            }

            return helper.askOptField('Player name (leave blank for skip)');
        })
        .then(function (playerName) {
            if (playerName) {
                userDoc.playerName = playerName;
                userDoc.playerNameIndex = playerName.toLowerCase();
            }

            return driver.findUserBy('playerName', playerName);
        })
        .then(function (user) {
            if (user && user.id !== userDoc.id) {
                console.log('Player name already exists!');
                throw Error('Player name already exists!');
            }

            return helper.askOptField('Skin (leave blank for skip)');
        })
        .then(function (skin) {
            if (skin) {
                try {
                    fs.accessSync('./images/skin/' + skin);
                } catch (err) {
                    console.log('Skin does not exist!');
                    throw err;
                }
                userDoc.skinUrl = skin;
            }

            return helper.askOptField('Cape (leave blank for skip)');
        })
        .then(function (cape) {
            if (cape) {
                try {
                    fs.accessSync('./images/cape/' + cape);
                } catch (err) {
                    console.log('Cape does not exist!');
                    throw err;
                }
                userDoc.capeUrl = cape;
            }

            helper.dumpUser(userDoc);

            return helper.askConfirm('Are you sure you want to update this user as above?');
        })
        .then(function () {
            return driver.saveUser(userDoc);
        })
        .then(function () {
            console.log('User has been updated!');
        })
        .catch(function (err) {
        })
        .then(function () {
            driver.close();
        });
}

function del() {
    var userDoc;

    helper.getUser(driver)
        .then(function (user) {
            if (!user) {
                console.log('User cannot be found!');
                throw Error('User cannot be found!');
            }

            helper.dumpUser(userDoc = user);

            return helper.askConfirm('Are you sure you want to delete this user?');
        })
        .then(function () {
            return driver.removeUser(userDoc);
        })
        .then(function () {
            console.log('User has been removed!');
        })
        .catch(function (err) {
        })
        .then(function () {
            driver.close();
        });
}
