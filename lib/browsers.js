'use strict';

var fs = require('fs')
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
  memory: 100
}

exports.run = function(cfg) {
  var browsersCfg = common.readCfgFile('browsers-config.json')
  common.mix(cfg, browsersCfg, defaultCfg)
  if (cfg.capture.indexOf('http') < 0) {
    cfg.capture = 'http://' + cfg.capture
  }

  (new Launcher(cfg)).then(function(launcher) {
    //graceful shutdown
    process.on('SIGINT', function() {
      logger.debug('Got SIGINT. ')

      launcher.kill(function() {
        process.exit()
      })
    })
    //require('./monitor').run(launcher, cfg)
  })

  /**
  process.on('uncaughtException', function(err) {
    logger.error(err);
    logger.info(err.stack)
    console.info(err.stack)
  })
  **/

}
