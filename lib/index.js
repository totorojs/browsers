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
  memory: process.platform === 'win32' ? 200 : 500
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
    that.start(Object.keys(that.browsers))

    process.on('SIGINT', function() {
      logger.debug('Got SIGINT.')
      that.kill(Object.keys(that.browsers), function() {
        process.exit()
      })
    })

  })
}

util.inherits(Launcher, events.EventEmitter)

Launcher.prototype.start = function(names) {
  var that = this
  logger.info('Start browsers ' + names.join(',') + ' open ' + that.capture)

  names.forEach(function(name) {
    var Browser = that.browsers[name]
    if (!Browser.instance) {
        Browser.instance = new Browser(that.opts)
    }

    Browser.instance.start(that.capture)
  })
}

Launcher.prototype.kill = function(names, cb) {
  var that = this
  logger.debug('Kill browsers ', names.join(','))

  async.forEach(names, function(name, cb) {
    var Browser = that.browsers[name]
    if (Browser.instance) {
      Browser.instance.kill(cb)
    } else {
      logger.debug('Not found ' + name + ' to kill.')
    }
  }, function() {
      cb && cb()
  })
}

Launcher.prototype.restart = function(names) {
  var that = this
  logger.info('Restart browsers ' + names.join(','))

  names.forEach(function(name){
    that.browsers[name].instance.restart()
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
