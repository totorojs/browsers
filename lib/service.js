'use strict';

var path = require('path');
var express = require('express');
var async = require('async');

var logger = require('./logger');
var browsers = require('./browsers');


exports.create = function(launcher, options) {

    var allBrowsers = launcher.browsers;

    var server = express();
    var staticPath = path.join(__dirname, '../static');
    server.use(express.static(staticPath));
    server.use(express.bodyParser());
    server.set('views', staticPath);
    server.set('view engine', 'jade');

    server.get('/', function(req, res) {
        // 1. 显示当前系统有效的浏览器
        // 2. 显示当前已经启动的浏览器
        // 3. 页面中增加减少和添加浏览器操作
        res.render('index.html');
    });

    server.get('/browsers', function(req, res) {
        var validBrowsers = browsers.listValidBrowsers();

        var launchedBrowsers = {};

        allBrowsers.forEach(function(b) {
            if (launchedBrowsers[b.name]) {
                launchedBrowsers[b.name]++;
            } else {
                launchedBrowsers[b.name] = 1;    
            }
        });

        res.send({
            validBrowsers: validBrowsers,
            launchedBrowsers: launchedBrowsers
        });
    });

    server.post('/browsers', function(req, res) {
        var succ = addBrowser(req.body.bName);
        res.send({succ: succ});
    });

    server.delete('/browsers', function(req, res) {
        var bName = req.body.bName.toLowerCase();

        for (var i = 0, len = allBrowsers.length; i < len; i++) {
            var brower = allBrowsers[i];
            if (brower.name.toLowerCase() == bName) {
                brower.kill();
                allBrowsers.splice(i, 1);
                break;
            }
        }
        res.send({succ: 1});
    });

    function addBrowser(name) {
        var currentLength = allBrowsers.length;
        var browsers = launcher.launch(name, options);
        return browsers.length > currentLength;
    }

    server.get('/restart', function(req, res) {
        var names = allBrowsers.map(function(b) {
            return b.name;
        });

        launcher.kill();
        addBrowser(names);
        res.send({succ: 1});
    });

    server.listen(options.port, function() {
        console.log('%s listening at %s', server.name, options.port);
    });
};

