'use strict';

var http = require('http')
var url = require('url')
var async = require('async')
var io = require('socket.io-client')

var logger = require('./logger')

exports.run = function(launcher, options, callback) {
    async.parallel([
        function(cb) {
            registerToHub(launcher, options, cb)
        },
        function(cb) {
            registerToTotoro(launcher, options, cb)
        }
    ], callback)
}

function registerToHub(launcher, options, cb) {
    var hub = options.hub
    if (!hub) {
        cb()
        return
    }

    var browsersInfo = 'browsers=' + JSON.stringify(options.browsers)

    var urlInfo = url.parse(options.hub)

    var reqOptions = {
        hostname:  urlInfo.hostname,
        port: urlInfo.port,
        path: urlInfo.path,
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': browsersInfo.length
        }
    }

    var req = http.request(reqOptions, function(res) {
        console.log('STATUS: ' + res.statusCode);
        cb()
        res.on('data', function(chunk) {

        })

        res.on('end', function() {
            //TODO
        })
    })

    req.on('error', function(e) {
        console.error('register ' + options.hub + ' error!')
        console.error(e)
    })
    req.write(browsersInfo)
    req.end()
}

function registerToTotoro(launcher, options, cb) {
    // 和 totoro-test 建立通信
    var totoroServer = 'http://' + options.server + '/browsers'
    var socket = io.connect(totoroServer)
    var tryConnectTimer;
    var connectTimeout = 60 * 1000

    var tryConnect = function() {
        //console.info('tryConnect---------------', socket.socket, socket.socket.connected, socket.socket.connecting)
        logger.debug('try connect totoro server...')

        if (socket.socket.connected === false &&
                socket.socket.connecting === false) {
            socket.socket.connect()
        }
    }

    tryConnectTimer = setInterval(tryConnect, connectTimeout)

    socket.on('connect', function() {
        options.connected = true
        clearInterval(tryConnectTimer)
        logger.info('connected totoro test server ' + totoroServer)
    })

    cb()

    var closeBrowsers = null

    socket.on('action', function(action, names) {
        if (closeBrowsers) {
            clearTimeout(closeBrowsers)
            closeBrowsers = null
        }

        names = launcher.findBrowserById(names)
        if (names.length === 0) {
            return
        }

        if (action === 'start') {
            launcher.launch(names, arguments[2])
            return;
        }

        if (!launcher[action]) {
            logger.error('totor-test action error')
        } else {
            launcher[action](names)
        }
    })

    socket.on('disconnect', function() {
        options.connected = false
        closeBrowsers = setTimeout(function() {
            launcher.kill(function() {
                tryConnectTimer = setInterval(tryConnect, connectTimeout)
            })

            closeBrowsers = null
        }, 10000)
    })
}
