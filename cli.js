var config = require('config');
var promptly = require('promptly');
var crypto = require('crypto');

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('create-hash', 'Creates a hash for a password using the defined hash algorithm.')
    .demand(1)
    .help('h')
    .alias('h', 'help')
    .argv;

switch (argv._[0]) {
    case 'create-hash':
        createHash();
        break;
    default:
        console.log('Invalid command! Use --help for more information.');
        process.exit(1);
        break;
}


function createHash() {
    var algorithm = config.get('hashAlgorithm');
    var passwordValidator = function (value) {
        if (!value) {
            throw new Error('Password cannot be empty!');
        }

        return value;
    };

    console.log('Hashing algorithm: ', algorithm);
    promptly.password('Password: ', { validator: passwordValidator }, function (err, password) {
        console.log('Password hash: ', crypto.createHash(algorithm).update(password).digest("hex"));
    });
}
