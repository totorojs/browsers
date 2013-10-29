'use strict';

var events = require('events')
var util = require('util')
var common = require('totoro-common')
var logger = common.logger
var async = require('async')

var helper = require('./helper')
var BaseBrowser = require('./launchers/')

var defaultOpts = {
  port: '9997',
  timeout: 50000,
  capture: '10.15.52.87:9999',
  manager: false,
  memory: 100
}


var Launcher = function(opts) {
  var that = this

  var fileOpts = common.readCfgFile('browsers-config.json')
  common.mix(opts, fileOpts, defaultOpts)
  if (opts.capture.indexOf('http') < 0) {
    opts.capture = 'http://' + opts.capture
  }

  this.opts = opts
  this.capture = opts.capture

  BaseBrowser.find(function(valid) {
    that.browsers = filterBrowsers(opts.browsers, valid)
    that.launch(Object.keys(that.browsers))

    // TODO test on windows to see if could be deleted
    process.on('SIGINT', function() {
      logger.debug('Got SIGINT. ')

      that.kill(Object.keys(that.browsers), function() {
        process.exit()
      })
    })
  })
}

util.inherits(Launcher, events.EventEmitter)

Launcher.prototype.launch = function(browsers) {
  var that = this

  browsers.forEach(function(browserName) {
    that.start(browserName)
  })
}

Launcher.prototype.start = function(name) {
    var Browser = this.browsers[name]
    if (!Browser.instance) {
        Browser.instance = new Browser(this.opts)
    }

    logger.info('Starting browser ' + name + ' open ' + this.capture)
    Browser.instance.start(this.capture)
}

Launcher.prototype.kill = function(names, cb) {
  var that = this

  async.forEach(names, function(browserName, cb) {
    var Browser = that.browsers[browserName]
    if (Browser.instance) {
      logger.debug('Disconnecting ' + browserName)
      Browser.instance.kill(cb)
    } else {
      logger.debug('Not found ' + browserName)
    }
  }, function() {
      cb && cb()
  })
}

Launcher.prototype.restart = function(name, cb) {
  var that = this

  logger.info('restart browsers ' + name)
  that.kill([name], function() {
    that.start(name)
  })
}

function filterBrowsers(expect, valid) {
  if (!expect || expect.length === 0) {
    return valid
  }

  var rt = {}
  expect.forEach(function(name){
    name = name.toLowerCase()
    if(name in valid) {
      rt[name] = valid[name]
    } else {
      logger.warn('unable to find ' + name)
    }
  })
  return rt
}

module.exports = Launcher
