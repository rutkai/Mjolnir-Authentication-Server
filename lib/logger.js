var config = require('config');
var moment = require('moment');

exports.log = log;

function log(message) {
    console.log(moment().format(config.get('timestampFormat')) + message);
}
