'use strict';

var os = require('os')
var async = require('async')
var logger = require('totoro-log')

var helper = require('./helper')

// 内存相关服务和监控
exports.run = function(launcher, options, cb) {
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

    var io = options.io

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

    cb()
}
