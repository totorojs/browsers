'use strict';

var spawn = require('child_process').spawn
var when = require('when')

var toString = Object.prototype.toString
exports.isString = function(obj) {
    return toString.call(obj) === '[object String]'
}

var slice = Array.prototype.slice
exports.extend = function(obj) {
    slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    })
    return obj;
}

var systemDefer = when.defer()
var systemPromise = null
exports.getSystemInfo = function(cb) {

    if (systemPromise) {
        systemPromise.then(function(info) {
            cb(info)
        })
        return
    }

    systemPromise = systemDefer.promise

    systemPromise.then(function(info) {
        cb(info)
    })

    var platform = process.platform
    var p, datas = []
    if (platform === 'win32') {
        p = spawn('systeminfo')
        p.stdout.on('data', function(data) {
            datas.push(data)
        })

        p.on('close', function() {
            var osInfo = datas.join('').split('\n').filter(function(info) {
                return (/OS/).test(info)
            })[0]

            var info = osInfo.split(/\:/)[1]

            if (info) {
                // 临时解决 GBK 编码问题.
                info = info.match(/[\w\s]+/)[0]
            } else {
                info = 'win32'
            }
            systemDefer.resolve(info)
        })

    } else if (platform === 'darwin') {
        p = spawn('sw_vers')
        p.stdout.on('data', function(data) {
            datas.push(data)
        })

        p.on('close', function(data) {
            var osInfo = datas.join('').split('\n').slice(0,2).map(function(info) {
                return info.split(':')[1].trim()
            }).join(' ')

            systemDefer.resolve(osInfo)
        })
    } else if (platform === 'linux') {
        systemDefer.resolve('linux')
    } else {
        systemDefer.resolve('未知系统')
    }
}

