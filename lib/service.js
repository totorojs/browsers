'use strict';

var http = require('http');
var path = require('path');
var os = require('os');
var express = require('express');
var async = require('async');
var _ = require('underscore');

var logger = require('./logger');
var browsers = require('./browsers');
var helper = require('./helper');
var Launcher = require('./launcher').Launcher;


exports.create = function(launcher, options) {

    var allBrowsers = launcher.browsers;

    // 浏览器版本映射
    var browsersMapping = {

    };

    var app = express();
    var server = http.createServer(app);
    var staticPath = path.join(__dirname, '../static');

    app.use(express.static(staticPath));
    app.use(express.bodyParser());
    app.set('views', staticPath);
    app.set('view engine', 'jade');

    app.get('/', function(req, res) {
        // 1. 显示当前系统有效的浏览器
        // 2. 显示当前已经启动的浏览器
        // 3. 页面中增加减少和添加浏览器操作
        res.render('index.html');
    });

    app.get('/browsers', function(req, res) {
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

    app.post('/browsers', function(req, res) {
        var succ = addBrowser(req.body.bName);
        res.send({succ: succ});
    });

    app.delete('/browsers', function(req, res) {
        var bName = req.body.bName.toLowerCase();

        for (var i = 0, len = allBrowsers.length; i < len; i++) {
            var brower = allBrowsers[i];
            if (brower.name.toLowerCase() === bName) {
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

    app.get('/restart', function(req, res) {
        var names = allBrowsers.map(function(b) {
            return b.name;
        });

        launcher.kill();
        addBrowser(names);
        res.send({succ: 1});
    });

    app.get('/version', function(req, res) {
        var agent = req.headers['user-agent'];
        var bInfo = helper.parseUserAgent(agent);
        browsersMapping[bInfo[0].toLowerCase()] = {
            value: bInfo[1]
        };
        res.send(bInfo);
    });

    // 获取浏览器版本信息
    app.get('/versions', function(req, res) {
        var validBrowsers = browsers.listValidBrowsers();

        if (_.keys(browsersMapping).length === validBrowsers.length) {
            res.send(browsersMapping);
            return;
        }

        var launcher = new Launcher();
        var _options = _.clone(options);
        _options.capture = 'http://127.0.0.1:' + options.port + '/version';
        launcher.launch(validBrowsers, _options);

        var fetch = setInterval(function() {
            if (_.keys(browsersMapping).length === validBrowsers.length) {
                launcher.kill();
                clearInterval(fetch);
                res.send(browsersMapping);
            }
        }, 1000)
    });

    app.get('/managers', function(req, res) {
        res.send(options.managers);
    });

    server.listen(options.port);

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', function(socket) {
        socket.on('memory', function(data) {
            var memory = {};
            async.forEachSeries(allBrowsers, function(b, cb) {
                if (memory[b.name]) cb();

                b.getMemory(function(m) {
                    memory[b.name] = m;
                    cb();
                });
            }, function() {
                // 添加系统内存使用情况
                var freemem = os.freemem();
                var totalmem = os.totalmem();
                var usedmem = totalmem - freemem;

                memory['totalmem'] = Math.round(totalmem/(1024 * 1024)) + 'M';
                memory['usedmem'] = Math.round(usedmem/(1024 * 1024)) + 'M';
                socket.emit('memory', memory);
            });
        })
    });
};

