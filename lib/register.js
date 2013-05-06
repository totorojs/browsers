'use strict';

var http = require('http')
var url = require('url')
var async = require('async')
var io = require('socket.io-client')

var logger = require('totoro-log')

exports.run = function(launcher, options, callback) {
    async.parallel([
        function(cb) {
            registerToHub(launcher, options, cb)
        },
        function(cb) {
            captureTotoro(launcher, options, cb)
        }
    ], callback)
}

function registerToHub(launcher, options, cb) {
    var hub = options.hub

    if (!hub) {
        cb()
        return
    }

    var hubServer = hub + '/hub/register'

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
        logger.error('register hub' + hub + ' error!')
    })
    req.write(browsersInfo)
    req.end()
}

function captureTotoro(launcher, options, cb) {

    var running = false

    var checkCapture = function() {
        logger.debug('capture check ......')
        http.get(options.capture, function(res) {
            logger.debug('captureTotoro STATUS: ' + res.statusCode);
            if (res.statusCode > 199 && res.statusCode < 400) {
                if (!running) {
                    launcher.launch(null, options.capture)
                    running = true
                }
            }
        }).on('error', function(e) {
            if (running) {
                launcher.kill(function() {
                    running = false
                })
            }
        })
    }

    checkCapture()

    setInterval(checkCapture, 5 * 60 * 1000)
    //setInterval(checkCapture, 5 * 1000)
    cb()
}

function getExternalIpAddress(){
    var addresses = []
    var ips = require('os').networkInterfaces()
    Object.keys(ips).forEach(function(name) {
        var iface = ips[name]
        addresses = addresses.concat(
            iface.filter(function(node) {
                return node.family === 'IPv4' && node.internal === false
            })
        )
    })
    if(addresses.length > 0){
        return addresses[0].address;
    }
}
