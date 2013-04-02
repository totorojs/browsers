var restify = require('restify');
var async = require('async');

exports.create = function(launcher, options, defaultBrowsers) {

    var allBrowsers = [];

    if (defaultBrowsers) {
        allBrowsers = allBrowsers.concat(defaultBrowsers);
    }

    var server = restify.createServer({
        name: 'browsers-service',
        version: '1.0.0'
    });

    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.get('/browsers', function(req, res, next) {
         res.send('hello ' + launcher.browsers);
    });

    server.get('/browsers/:name', function(req, res, next) {
        var browsers = addBrowser(req.params.name);
        if (browsers.length > 0) {
            res.send('create ' + browsers + ' success!');
        } else {
            res.send('create ' + req.params.name + ' error!') ;
        }
    });

    function addBrowser(name) {
        var browsers = launcher.launch(name, options); 
        if (browsers.length > 0) {
            browsers = browsers.map(function(b) {
                allBrowsers.push(b);
                return b.name; 
            });
        }
        return browsers;
    }

    server.get('/restart', function(req, res, next) {
        async.forEachSeries(allBrowsers, function(b, cb) {
            b.kill(cb);
        }, function() {
            var names = allBrowsers.map(function(b) {
                return b.name; 
            });
            allBrowsers.splice(0, allBrowsers.length);
            addBrowser(names);
            res.send('restart success!');
        });
    });

    server.listen(options.port, function() {
        console.log('%s listening at %s', server.name, server.url);
    });
};

