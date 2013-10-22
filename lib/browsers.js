'use strict';

var fs = require('fs')
var async = require('async')
var path = require('path')
var rimraf = require('rimraf')
var common = require('totoro-common')
var logger = common.logger

var Launcher = require('./launcher').Launcher

var defaultCfg = {
    port: '9997',
    timeout: 50000,
    capture: '10.15.52.87:9999',
    manager: false,
    maxMemory: 500
}

exports.run = function(cfg) {
    var browsersCfg = common.readCfgFile('browsers-config.json')
    common.mix(cfg, browsersCfg, defaultCfg)
    if (cfg.capture.indexOf('http') < 0) {
        cfg.capture = 'http://' + cfg.capture
    }

    var browsers = cfg.browsers

    // TODO promise launcher
    var launcher = new Launcher(cfg)

    var q = async.queue(function(task, cb) {
        task(cb);
    }, 1)

    q.drain = function() {
        logger.info('browsers server start...')
        /**
        setTimeout(function() {
            launcher.restart()
        }, 8000)

        setTimeout(function() {
            launcher.kill()
        }, 18000)
        **/

    }
    
/**
    q.push(function(cb) {
        require('./memory').run(launcher, cfg, cb)
    })

    q.push(function(cb) {
        require('./monitor').run(launcher, cfg, cb)
    })
**/

    // launcher.launch(['Chrome', 'Firefox', 'Safari', 'Opera'], 'localhost:9000', 300000, 4);
    // browsers = launcher.launch(browsers, cfg);
/**
    process.on('uncaughtException', function(err) {
        logger.error(err);
        logger.info(err.stack)
        console.info(err.stack)
    })
**/

    process.on('SIGINT', function() {
        logger.debug('Got SIGINT. ')
        launcher.kill();
        process.exit(0);
    })
}
