'use strict';

var utilx = require('utilx')
var socketClient = require('socket.io-client')

var logger = require('./logger')
var driver = require('./driver')
var monitor = require('./monitor')

var inited = false


module.exports = function(cfg) {
  handleCfg(cfg)

  var browsers = {}

  if (cfg.ping) {
    var socket = socketClient.connect(cfg.ping)

    socket.on('init', function(data){
      if (inited) {
        logger.debug('Reconnect.')
        return
      }

      logger.debug('Init socket to listen browser pulse.', {id: data.id})
      inited = true
      var id = data.id
      var capture = cfg.capture
      var hasQuery = capture.indexOf('?') !== -1
      cfg.capture = capture.replace(/(#.*$)|$/, (hasQuery ? '&' : '?') + '__totoro_did=' + id + '$1')
      open(browsers, cfg)
    })

    socket.on('tired', function(data) {
      var name = data.browser
      if (name in browsers) browsers[name].reopen()
    })

    socket.on('disconnect', function() {})

  } else {
    open(browsers, cfg)
  }
}

function open(browsers, cfg) {
   cfg.browsers.forEach(function(name) {
    driver.get(name, function(browser) {
      browser.open(cfg.capture)
      browsers[name] = browser
    })
  })
}

function handleCfg(cfg) {
  var fileCfg = utilx.readJSON('browsers-config.json')
  utilx.mix(cfg, fileCfg)

  cfg.capture = cfg.capture || 'server.totorojs.org:9999'
  cfg.browsers = cfg.browsers || driver.availableDrivers

  if (cfg.capture.indexOf('http') === -1) cfg.capture = 'http://' + cfg.capture
  if (cfg.ping && cfg.ping.indexOf('http') === -1) cfg.ping = 'http://' + cfg.ping

  logger.debug('Handled config.', cfg)
}
