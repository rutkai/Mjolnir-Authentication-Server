var config = require('config');
var moment = require('moment');

module.exports = {
    log: function (message) {
        console.log(moment().format(config.get('timestampFormat')) + message);
    }
};