'use strict';

var fs = require('fs');
var _ = require('underscore');
var Launcher = require('./launcher').Launcher;
var Service = require('./service');

exports.create = function(options) {
    var launcher = new Launcher();
    var browsers = options.browsers;
    if (_.isString(browsers)) {
        browsers = browsers.split(',');
    }

    // launcher.launch(['Chrome', 'Firefox', 'Safari', 'Opera'], 'localhost:9000', 300000, 4);
    browsers = launcher.launch(browsers, options);
    Service.create(launcher, options);

    process.on('uncaughtException', function(err) {
        console.error(err);
    });

    process.on('SIGINT', function() {
        console.log('Got SIGINT. ');
        launcher.kill();
        process.exit(0);
    });
};

var defaultBrowsrs = ['Chrome', 'Firefox', 'Opera', 'Safari', 'IE'];
var validBrowsers;
exports.listValidBrowsers = function() {
    if (validBrowsers) return validBrowsers;

    return (validBrowsers = defaultBrowsrs.filter(function(name) {
        var Cls = require('./launchers/' + name);
        var bPath = Cls.prototype.DEFAULT_CMD[process.platform];
        return fs.existsSync(bPath);
    }));
};
