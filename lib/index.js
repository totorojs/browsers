'use strict';

var utilx = require('utilx')

var logger = require('./logger')
var driver = require('./driver')
var monitor = require('./monitor')

var defaultCfg = {
  capture: 'server.totorojs.org:9999',
  memory: 400,
  cpu: 0.5,
  interval: 4
}

module.exports = function(cfg) {
  handleCfg(cfg)

  var browserNames = cfg.browsers || driver.availableDrivers
  browserNames.forEach(function(name) {
    driver.get(name, function(browser) {
      browser.open(cfg.capture)
    })
  })
}

function handleCfg(cfg) {
  utilx.mix(cfg, defaultCfg)
  if (cfg.capture.indexOf('http') === -1) cfg.capture = 'http://' + cfg.capture
  if (cfg.socket && cfg.socket.indexOf('http') === -1) cfg.socket = 'http://' + cfg.socket
  logger.debug('Handled config.', cfg)
}
