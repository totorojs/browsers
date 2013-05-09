'use strict';

var fs = require('fs')
var http = require('http')
var path = require('path')

var express = require('express')
var useragent = require('useragent')
var logger = require('totoro-log')


exports.create = function(launcher, options, callback) {
    var browsersMapping = options.browsersMapping = {}

    var app = express()
    var server = http.createServer(app)
    var staticPath = path.join(__dirname, '../static')

    app.use(express.static(staticPath))
    app.use(express.bodyParser())
    app.set('views', staticPath)
    app.set('view engine', 'jade')

    app.get('/', function(req, res) {
        // 1. 显示当前系统有效的浏览器
        // 2. 显示当前已经启动的浏览器
        // 3. 页面中增加减少和添加浏览器操作
        res.render('index.html')
    })

    app.get('/browsers', function(req, res) {
        var browsers = options.browsers
        var launchedBrowsers = {}

        browsers.forEach(function(b) {
            if (launchedBrowsers[b]) {
                launchedBrowsers[b]++
            } else {
                launchedBrowsers[b] = 1
            }
        })

        res.send({
            browsers: browsers,
            launchedBrowsers: launchedBrowsers
        })
    })

    app.get('/versions', function(req, res) {
        res.send(browsersMapping)
    })

    app.post('/browsers', function(req, res) {
        res.send({succ: launcher.launch(req.body.bName).length})
    })

    app.delete('/browsers', function(req, res) {
        var bName = req.body.bName

        launcher.kill(bName, function(err) {
            if (err) {
                res.send({succ: 0, err: err})
            } else {
                res.send({succ: 1})
            }
        })
    })

    app.get('/restart', function(req, res) {
        launcher.restart(function(err) {
            if (err) {
                res.send({succ: 0, msg: 'restart error', err: err})
            } else {
                res.send({succ: 1})
            }
        })
    })

    app.get('/version', function(req, res) {
        var agent = req.headers['user-agent']
        var bInfo = useragent.parse(agent)
        browsersMapping[bInfo.family.toLowerCase()] = {
            value: bInfo.toString(),
            agent: agent
        }
        res.send(JSON.stringify(bInfo))
    })

    app.get('/capture', function(req, res) {
        var browsers = Object.keys(options.browsers)
        // req.body 包含了浏览器的启动参数. 客户端只是被动的启动
        launcher.launch(browsers, req.body)
    })

    if (options.manager) {
        var manager = {
           clients: {},
           browsers: []
        }

        app.post('/hub/register', function(req, res) {
            var client = req.body.client
            var clients = manager.clients
            var succ = 1
            if (client ) {
                client = JSON.parse(client)
                var clientAddr = Object.keys(client)[0]
                if (client[clientAddr]) {
                    logger.warn('Duplicate registration!(' + clientAddr + ')')
                }
                clients[clientAddr] = client[clientAddr]
            } else {
                succ = 0
            }

            res.send({succ: succ})
        })

        // 加载所有 node 的管理页面
        app.get('/hub/managers', function(req, res) {
            var managers = Object.keys(manager.clients)
            res.send(managers)
        })

        var managerHtml
        app.get('/hub/console', function(req, res) {
            if (!managerHtml) {
                managerHtml = fs.readFileSync(path.join(staticPath, 'manager.html')).toString()
            }
            res.send(managerHtml)
        })

        setInterval(function() {
            Object.keys(manager.clients).forEach(function(client) {
                http.request(client, function(res) {
                    if (res.statusCode > 299) {
                        logger.info('lost client ' + client)
                        delete manager.clients[client]
                    }
                }).on('error', function(e) {
                    logger.info('lost client ' + client)
                    delete manager.clients[client]
                })
            })
        }, 10 * 60 * 1000)

    }

    server.listen(options.port, function() {
        callback()
    })

    var io = options.io = require('socket.io').listen(server)

    io.configure('development', function(){
        io.set('log level', 2)
    })
}
