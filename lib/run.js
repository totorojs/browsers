'use strict';

var utilx = require('utilx')
var socketClient = require('socket.io-client')

var logger = require('./logger')
var driver = require('./')

var locked
var browsers = {}

// NOTE
// if safari on mac os is closed by CTRL+C
// it will reopend with previous tab
var closeSafariOnExit = function(browser) {
  process.on('SIGINT', function() {
    logger.debug('About to close safari before process exit.')
    locked = true
    browser.close(function() {
      process.exit(0)
    })
  })
  closeSafariOnExit = function() {}
}


function get(names, cb) {
  var count = names.length
  names.forEach(function(name) {
    driver.get(name, function(browser) {
      if (browser) browsers[name] = browser
      if (--count === 0) {
        if ('safari' in browsers && process.platform === 'darwin') {
          closeSafariOnExit(browsers.safari)
        }
        cb && cb()
      }
    })
  })
}


function open(capture, cb) {
  batch('open', capture, cb)
}

function reopen(capture, cb) {
  batch('reopen', capture, cb)
}

function close(cb) {
  batch('close', cb)
}

function batch(op, capture, cb) {
  if (locked) {
    logger.debug('Locked! Ignore', op)
    return
  }

  logger.info('Batch', op, 'start.')
  locked = true
  var names = Object.keys(browsers)
  var count = names.length

  if (op === 'close') cb = capture
  function _cb() {
    if (--count === 0) {
      locked = false
      logger.info('Batch', op, 'finished.')
      cb && cb()
    }
  }

  names.forEach(function(name) {
    var browser = browsers[name]
    if (op === 'close') {
      browser[op](_cb)
    } else {
      browser[op](capture, _cb)
    }
  })
}


function uid() {
  var id = ''
  for (var i = 0; i < 16; i++) {
    id += Math.floor(Math.random() * 16).toString(16)
  }
  return id
}


function handleCfg(cfg) {
  var fileCfg = utilx.readJSON('totoro-driver-config.json')
  utilx.mix(cfg, fileCfg)

  cfg.capture = cfg.capture || 'server.totorojs.org:9999'
  cfg.browsers = cfg.browsers || driver.availableDrivers

  if (cfg.capture.indexOf('http') === -1) cfg.capture = 'http://' + cfg.capture
  if (cfg.ping && cfg.ping.indexOf('http') === -1) cfg.ping = 'http://' + cfg.ping

  logger.debug('Handled config.', cfg)
}


module.exports = function(cfg) {
  handleCfg(cfg)

  get(cfg.browsers, function() {
    if (cfg.ping) {
      var prevId
      var id

      var socket = socketClient.connect(cfg.ping)

      var init = function() {
        prevId = id
        id = uid()
        var data = {prevId: prevId, id: id}
        socket.emit('init', data)
        logger.info('Driver init.', data)
      }

      socket.on('initBack', function(data) {
        logger.debug('Driver init back.', data)

        if (data.id !== id) {
          logger.info('Outdated driver id<' + data.id + '>.')
          return
        }

        var capture = cfg.capture
        var hasQuery = capture.indexOf('?') !== -1
        capture = capture.replace(/(#.*$)|$/, (hasQuery ? '&' : '?') + '__totoro_did=' + id + '$1')
        prevId ? reopen(capture) : open(capture)
      })

      // reconnect also emits this event
      socket.on('connect', function() {
        logger.debug('Socket connect.')
        init()
      })

      socket.on('disconnect', function() {
        logger.debug('Socket disconnect.')
      })

      socket.on('retire', function(data) {
        var name = data.browser
        logger.info(name, 'retires.')

        if (locked) {
          logger.debug('Locked! Won\'t reopen', name)
          return
        }

        if (data.id !== id) {
          logger.debug('Outdated driver id<' + data.id + '>.')
          return
        }

        if (name in browsers) {
          logger.debug(name, 'exists, will reopen.')
          browsers[name].reopen()
        } else {
          logger.debug('Not found retired browser', name, '.')
        }
      })

      if (cfg.interval) {
        setInterval(function() {
          logger.info('Scheduled batch reopen.')
          init()
        }, 20 * 1000)
      }

    } else {
      open(cfg.capture)

      if (cfg.interval) {
        setInterval(function() {
          logger.info('Scheduled batch reopen.')
          reopen()
        }, cfg.interval * 60 * 60 * 1000)
      }
    }
  })
}



