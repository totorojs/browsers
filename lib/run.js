'use strict';

var utilx = require('utilx')
var socketClient = require('socket.io-client')

var logger = require('./logger')
var driver = require('./')

var inited = false


module.exports = function(cfg) {
  handleCfg(cfg)

  var browsers = {}
  cfg.browsers.forEach(function(name) {
    driver.get(name, function(browser) {
      if (!browser) return
      browser.open(cfg.capture)
      browsers[name] = browser
    })
  })

  if (cfg.ping) {
    var socket = socketClient.connect(cfg.ping)
    socket.on('connect', function() {
      socket.emit('init', {id: cfg.id})
    })
    socket.on('tired', function(data) {
      var name = data.browser
      if (name in browsers) browsers[name].reopen()
    })
  }

  if (cfg.interval) {
    setInterval(function() {
      Object.keys(browsers).forEach(function(name){
        browsers[name].reopen()
      })
    }, cfg.interval * 60 * 60 * 1000)
  }
}


function uid() {
  var id = ''
  for (var i = 0; i < 16; i++) {
    id += Math.floor(Math.random() * 16).toString(16)
  }
  return id
}


function handleCfg(cfg) {
  var fileCfg = utilx.readJSON('browsers-config.json')
  utilx.mix(cfg, fileCfg)

  cfg.id = uid()
  cfg.capture = cfg.capture || 'server.totorojs.org:9999'
  cfg.browsers = cfg.browsers || driver.availableDrivers

  if (cfg.capture.indexOf('http') === -1) cfg.capture = 'http://' + cfg.capture
  if (cfg.ping) {
    var capture = cfg.capture
    var hasQuery = capture.indexOf('?') !== -1
    cfg.capture = capture.replace(/(#.*$)|$/, (hasQuery ? '&' : '?') + '__totoro_did=' + cfg.id + '$1')

    if (cfg.ping.indexOf('http') === -1) cfg.ping = 'http://' + cfg.ping
  }

  logger.debug('Handled config.', cfg)
}

