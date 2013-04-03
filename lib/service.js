'use strict';

var express = require('express');
var async = require('async');

exports.create = function(launcher, options) {

    var allBrowsers = launcher.browsers;

    var server = express();

    server.get('/browsers', function(req, res) {
        if (req.query.add) {
            var succ = addBrowser(req.query.add);

            if (succ) {
                res.redirect('/browsers');
            } else {
                res.send('create ' + req.query.add + ' error!') ;
            }

        } else {
            var bs = allBrowsers.map(function(b) {
                return {
                    'id': b.id,
                    'name': b.name
                };
            });

            res.send(bs);
            //res.send('hello ' + launcher.browsers);
        }
    });

    function addBrowser(name) {
        var currentLength = allBrowsers.length;
        var browsers = launcher.launch(name, options);
        return browsers.length > currentLength;
    }

    server.get('/restart', function(req, res) {
        async.forEachSeries(allBrowsers, function(b, cb) {
            b.kill(cb);
        }, function() {
            var names = allBrowsers.map(function(b) {
                return b.name;
            });
            addBrowser(names);
            res.send('restart success!');
        });
    });

    server.listen(options.port, function() {
        console.log('%s listening at %s', server.name, options.port);
    });
};

