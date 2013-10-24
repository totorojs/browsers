'use strict';

var events = require('events')
var util = require('util')
var logger = require('totoro-common').logger
var async = require('async')
var helper = require('./helper')
var BaseBrowser = require('./launchers/')


var Launcher = function(opts) {
  var that = this
  this.opts = opts

  BaseBrowser.find(function(validBrowsers) {
    that.browsers = findBrowsers(validBrowsers, opts.browsers)
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

Launcher.prototype.launch = function() {
  var that = this
  Object.keys(this.browsers).forEach(function(browserName) {
    var browser = that.browsers[browserName]
    browser.instance = new (browser.Cons)(that.opts)
    logger.info('Starting browser ' + browserName + ' open ' + that.opts.capture)
    browser.instance.start()
  })
}

Launcher.prototype.kill = function() {
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

Launcher.prototype.restart = function() {
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


function findBrowsers(validBrowsers, expectBrowsers) {
  if (!expectBrowsers || expectBrowsers.length === 0) return validBrowsers

  var browsers = {}
  expectBrowsers.map(function(browserName) {
    return browserName.toLowerCase()
  }).forEach(function(browserName) {
    if (!validBrowsers[browserName]) {
      logger.warn('unable to find ' + browserName)
      return
    }
    browsers[browserName] = validBrowsers[browserName]
  })
  return browsers
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


exports.Launcher = Launcher
