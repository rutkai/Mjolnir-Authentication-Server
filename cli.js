var promptly = require('promptly');
var crypto = require('crypto');
var uuid = require('node-uuid');
var bcrypt = require('bcryptjs');

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('create-hash', 'Creates a hash for a password using the defined hash algorithm.')
    .command('generate-uuid', 'Generates a UUID which is compatible with Minecraft.')
    .demand(1)
    .help('h')
    .alias('h', 'help')
    .argv;

switch (argv._[0]) {
    case 'create-hash':
        createHash();
        break;
    case 'generate-uuid':
        generateUUID();
        break;
    default:
        console.log('Invalid command! Use --help for more information.');
        process.exit(1);
        break;
}


function createHash() {
    var passwordValidator = function (value) {
        if (!value) {
            throw new Error('Password cannot be empty!');
        }

        return value;
    };

    promptly.password('Password: ', { validator: passwordValidator }, function (err, password) {
        console.log('Password hash (WILL CHANGE):', bcrypt.hashSync(password));
    });
}

function generateUUID() {
    console.log(uuid.v4());
}
