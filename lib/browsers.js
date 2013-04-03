'use strict';

var Launcher = require('./launcher').Launcher;
var Service = require('./service');

exports.create = function(options) {
    var launcher = new Launcher();
    var browsers = options.browsers.split(',');

    // launcher.launch(['Chrome', 'Firefox', 'Safari', 'Opera'], 'localhost:9000', 300000, 4);
    browsers = launcher.launch(browsers, options);
    Service.create(launcher, options);

    process.on('uncaughtException', function(err) {
        logger.error(err); 
    });

    process.on('SIGINT', function() {
        console.log('Got SIGINT. ');
        launcher.kill();
        process.exit(0);
    });
};
