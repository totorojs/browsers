var Launcher = require('./launcher').Launcher;
var Service = require('./service');

exports.create = function(options) {
    var launcher = new Launcher();
    var browsers = options.browsers.split(',');
    
    // launcher.launch(['Chrome', 'Firefox', 'Safari', 'Opera'], 'localhost:9000', 300000, 4);
    browsers = launcher.launch(browsers, options);
    
    Service.create(launcher, options, browsers);
}
