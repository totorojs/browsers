'use strict';

var fs = require('fs')
var path = require('path')
var common = require('totoro-common')

var defaultCfg = {
    port: '9997',
    timeout: 50000,
    capture: '10.15.52.87:9999',
    manager: false,
    maxMemory: 500
}

module.exports = handleCfg

function handleCfg(cfg) {
    var browsersCfg = common.readCfgFile('browsers-config.json')
    cfg = common.mix(cfg, browsersCfg, defaultCfg)
    if (cfg.capture.indexOf('http') < 0) {
        cfg.capture = 'http://' + cfg.capture
    }

    return cfg
}
