'use strict';

var utilx = require('utilx')
var socketClient = require('socket.io-client')

var logger = require('./logger')
var driver = require('./')

var browsers = {}
var locked = false

function get(names, cb) {
  var count = names.length
  names.forEach(function(name) {
    driver.get(name, function(browser) {
      if (browser) {
        browsers[name] = browser
        if (name === 'safari' && process.platform === 'darwin') {
          // TODO
        }
      }
      if (--count === 0) cb && cb()
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

function batch(op) {
  if (locked) {
    logger.debug('Locked! Ignore batch', op, '.')
    return
  }

  logger.info('Batch', op, 'start.')
  locked = true
  var count = Object.keys(browsers).length
  var last = arguments.length - 1
  var cb = arguments[last]
  var args = []
  for (var i = 1; i < last; i++) {
    args.push(arguments[i])
  }
  args.push(function() {
    if (--count === 0) {
      setTimeout(function() {
        logger.info('Batch', op, 'finished.')
        locked = false
        cb && cb()
      }, 5000)
    }
  })

  Object.keys(browsers).forEach(function(name) {
    var browser = browsers[name]
    browser[op].apply(browser, args)
  })
}


module.exports = function(cfg) {
  handleCfg(cfg)

  get(cfg.browsers, function() {
    open(cfg.capture)

    if (cfg.ping) {
      var socket = socketClient.connect(cfg.ping)

      socket.on('connect', function() {
        logger.debug('Socket connect.')
        socket.emit('init', {id: cfg.id})
      })

      socket.on('disconnect', function() {
        logger.debug('Socket disconnect.')
      })

      socket.on('reconnect', function() {
        logger.debug('Socket reconnect.')
        reopen()
      })

      socket.on('retire', function(data) {
        var name = data.browser
        if (locked) {
          logger.debug('Locked! Ignore', name, 'retire event.')
          return
        }

        logger.info(name, 'retires.')
        if (name in browsers) {
          logger.debug(name, 'exists, will reopen.')
          browsers[name].reopen()
        } else {
          logger.warn('Not found retired browser', name, '.')
        }
      })
    }

    if (cfg.interval) {
      setInterval(function() {
        logger.info('Scheduled batch reopen.')
        reopen()
      }, cfg.interval * 1000)
    }
  })
}




function clearSafariOnExit(browser) {
  process.on('SIGINT', function() {
    console.log('about to close safari before process exit')
    browser.close(function() {
      process.exit(0)
    })
  })
  clearSafariOnExit = function() {}
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

