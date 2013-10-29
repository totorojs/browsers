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

  BaseBrowser.find(function(valid) {
    that.browsers = filterBrowsers(opts.browsers, valid)
    that.launch()

    // TODO test on windows to see if could be deleted
    process.on('SIGINT', function() {
      logger.debug('Got SIGINT. ')

      that.kill(function() {
        process.exit()
      })
    })
  })
}

util.inherits(Launcher, events.EventEmitter)

Launcher.prototype.launch = function(names, cb) {
  var that = this
  Object.keys(this.browsers).forEach(function(browserName) {
    var browser = that.browsers[browserName]
    browser.instance = new (browser.Cons)(that.opts)
    logger.info('Starting browser ' + browserName + ' open ' + that.opts.capture)
    browser.instance.start()
  })
}

Launcher.prototype.kill = function(names, cb) {
  var that = this
  parseArgs(arguments, function(names, cb) {
    async.forEach(Object.keys(that.browsers), function(browserName, cb) {
      // If the user specifies the browser, need to match
      if (names && names.length > 0 && names.indexOf(browserName) < 0) {
        cb()
        return
      }
      var browser = that.browsers[browserName]
      logger.debug('Disconnecting ' + browserName)
      browser.instance.kill(cb)
    }, function() {
      cb && cb()
    })
  })
}

Launcher.prototype.start = function(names, cb) {

}

Launcher.prototype.restart = function(names, cb) {
  var that = this
  parseArgs(arguments, function(browserName, cb) {
    logger.info('restart browsers ' + browserName)
    that.kill(browserName, function() {
      var browser = that.browsers[browserName]
      browser.instance.start(that.captureUrl)
    })
  })
}


function noop(){}


function isFunction(obj) {
  return typeof obj === 'function'
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


function parseArgs(args, callback) {
  var cb, names = []
  if (args.length === 1 && isFunction(args[0])) {
    cb = args[0]
  } else {
    names = args[0]
    cb = args[1] || noop
  }
  callback(names, cb)
}


module.exports = Launcher




