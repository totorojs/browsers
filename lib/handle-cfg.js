'use strict';

var fs = require('fs')
var path = require('path')
var logger = require('totoro-log')

var defaultServerHost = '10.15.52.87'
var defaultServerPort = '9999'
var defaultClientPort = '9997'

var defaultCfg = {
    port: '9997',
    timeout: 50000,
    capture: '10.15.52.87:9999',
    manager: false,
    maxMemory: 500
}

module.exports = handleCfg

function handleCfg(cfg) {
    var browsersCfg = readCfgFile('browsers-config.json')
    cfg = mix(cfg, browsersCfg, defaultCfg)

    if (cfg.capture.indexOf('http') < 0) {
        cfg.capture = 'http://' + cfg.capture
    }

    return cfg
}

function readCfgFile(p) {
    try {
        return require(path.resolve(p))
    } catch(e) {
        logger.debug('fail to read config file: ' + p)
        return
    }
}

function mix(target, src, ow) {
    target = target || {}
    var len = arguments.length
    var srcEnd = len - 1
    var lastArg = arguments[len - 1]

    if ( typeof lastArg === 'boolean' || typeof lastArg === 'number') {
        ow = lastArg
        srcEnd--
    } else {
        ow = false
    }

    for (var i = 1; i <= srcEnd; i++) {
        var current = arguments[i] || {}
        for (var j in current) {
            if (ow || typeof target[j] === 'undefined') {
                target[j] = current[j]
            }
        }
    }

    return target
}
