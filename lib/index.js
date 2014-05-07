'use strict';

var uuid = require('uuid')

var logger = require('./logger')
var driver = require('./driver')
var monitor = require('./monitor')


module.exports = function(cfg) {
  handleCfg(cfg)

  var browsers = {}
  var browserNames = cfg.browsers || driver.availableDrivers

  browserNames.forEach(function(name) {
    driver.get(name, function(browser) {
      browser.open(cfg.capture)
      browsers[name] = browser
    })
  })
}

function handleCfg(cfg) {
  cfg.capture = cfg.capture || 'server.totorojs.org:9999'

  if (cfg.capture.indexOf('http') === -1) cfg.capture = 'http://' + cfg.capture
  if (cfg.pulse) {
    cfg.id = uuid.v4()
    var hasQuery = cfg.capture.indexOf('?') !== -1
    cfg.capture = cfg.capture.replace(/(#.*$)|$/, (hasQuery ? '&' : '?') + '__totoro_bid=' + cfg.id + '$1')

    if (cfg.pulse.indexOf('http') === -1) cfg.pulse = 'http://' + cfg.pulse
  }

  logger.debug('Handled config.', cfg)
}
