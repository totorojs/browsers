'use strict';

var http = require('http')
var path = require('path')
var os = require('os')

var express = require('express')
var async = require('async')
var logger = require('totoro-log')

var helper = require('./helper')


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
            if (launchedBrowsers[b.name]) {
                launchedBrowsers[b.name]++
            } else {
                launchedBrowsers[b.name] = 1
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
        var bInfo = helper.parseUserAgent(agent)
        browsersMapping[bInfo[0].toLowerCase()] = {
            value: bInfo[1],
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
        app.get('/hub/console', function(req, res) {
            var managers = Object.keys(manager.clients)
            res.send(managers)
        })
    }

    server.listen(options.port, function() {
        callback()
    })

    var io = require('socket.io').listen(server)

    io.configure('development', function(){
        io.set('log level', 2)
    })

    var memory, computeTimeout
    var allBrowsers = launcher.browsers

    function computeMemory(cb) {
        cb = cb || function() {}

        if (computeTimeout) {
            cb(memory || {})
            return
        }

        computeTimeout = setTimeout(function() {
            memory = {}
            async.forEachSeries(allBrowsers, function(b, cb) {
                if (memory[b.name]) cb()

                b.getMemory(function(m) {
                    memory[b.name] = m
                    // check memory
                    launcher.checkMemory(b.name, m)
                    cb()
                })
            }, function() {
                // 添加系统内存使用情况
                var freemem = os.freemem()
                var totalmem = os.totalmem()
                var usedmem = totalmem - freemem

                memory['totalmem'] = Math.round(totalmem / (1024 * 1024)) + 'M'
                memory['usedmem'] = Math.round(usedmem / (1024 * 1024)) + 'M'
                cb(memory)
            })

            computeTimeout = null

        }, 5000)

    }

    setInterval(function() {
        if (options.connected) {
            computeMemory()
        }
    }, 5000)


    var checkInterval
    var browserStatus = {}
    var notRespondings = {}
    var browsersInstance = launcher.getBrowsers(options.browsers)

     // begin check browsers status
    var checkBrowsersStatus = function() {
        var allIds = []
        browsersInstance.forEach(function(ins) {
            allIds = allIds.concat(Object.keys(ins.processList))
        })

        if (allIds.length === 0) {
            clearInterval(checkInterval)
            checkInterval = null
        }

        allIds.forEach(function(id) {
            if (!browserStatus[id]) {
                if (notRespondings[id]) {
                    notRespondings[id]++
                } else {
                    notRespondings[id] = 1
                }
            }

            browserStatus[id] = false
            if (notRespondings[id] > 5) {
                launcher.restart(launcher.findBrowserById(id))
            }
        })

        Object.keys(notRespondings).forEach(function(id) {
            if (allIds.indexOf(id) < 0) {
                delete notRespondings[id]
            }
        })

        Object.keys(browserStatus).forEach(function(id) {
            if (allIds.indexOf(id) < 0) {
                delete browserStatus[id]
            }
        })

        //console.info('allIds---->', allIds)
        //console.info('notRespondings---->', notRespondings)
        //console.info('browserStatus--2-->', browserStatus)
    }

    io.of('/status').on('connection', function(socket) {

        if (!checkInterval) {
            checkInterval = setInterval(checkBrowsersStatus, 60 * 1000)
        }

        socket.on('running', function(id) {
            browserStatus[id] = true
        })
    })


    io.sockets.on('connection', function(socket) {
        socket.on('memory', function() {
            computeMemory(function(memory) {
                socket.emit('memory', memory)
            })
        })

        socket.on('systeminfo', function() {
            helper.getSystemInfo(function(info) {
                socket.emit('systeminfo', info)
            })
        })
    })
}
