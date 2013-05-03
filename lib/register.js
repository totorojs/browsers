'use strict';

var http = require('http')
var url = require('url')
var async = require('async')
var io = require('socket.io-client')
var _ = require('underscore')

var logger = require('totoro-log')

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

    var hubServer = options.hub + '/hub/register'

    var clientInfo = {}
    clientInfo['http://' + getExternalIpAddress() + ':' + options.port] = options.browsers

    var browsersInfo = 'client=' + JSON.stringify(clientInfo)

    var urlInfo = url.parse(hubServer)

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
        logger.debug('register to hub: STATUS: ' + res.statusCode);
        cb()
        res.on('data', function(chunk) {
        })

        res.on('end', function() {
        })
    })

    req.on('error', function(e) {
        logger.error('register ' + options.hub + ' error!')
    })
    req.write(browsersInfo)
    req.end()
}

function registerToTotoro(launcher, options, cb) {
    // 和 totoro-test 建立通信
    var totoroServer = options.server + '/notice'
    var socket = io.connect(totoroServer)
    var tryConnectTimer;
    var connectTimeout = 60 * 1000

    var tryConnect = function() {
        //logger.info('tryConnect---------------', socket.socket, socket.socket.connected, socket.socket.connecting)
        logger.debug('try connect totoro server...' + totoroServer)

        if (socket.socket.connected === false &&
                socket.socket.connecting === false) {
            socket.socket.connect()
        }
    }

    tryConnect()

    tryConnectTimer = setInterval(tryConnect, connectTimeout)

    socket.on('connect', function() {
        options.connected = true
        clearInterval(tryConnectTimer)
        logger.info('connected totoro test server ' + totoroServer)
    })

    cb()

    var closeBrowsers = null

    socket.on('launchServer', function(data) {
        if (closeBrowsers) {
            clearTimeout(closeBrowsers)
            closeBrowsers = null
        }

        launcher.launch(null, data.capture)
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

function getExternalIpAddress(){
    var interfaces = require('os').networkInterfaces()
    var addresses = []
    _.each(interfaces, function(iface, name){
        addresses = addresses.concat(
            _.filter(iface, function(node){
                return node.family === 'IPv4' && node.internal === false
            })
        );
    })
    if(addresses.length > 0){
        return addresses[0].address;
    }
}

