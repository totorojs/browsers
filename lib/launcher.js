'use strict';

var events = require('events')
var util = require('util')
var logger = require('totoro-common').logger
var async = require('async')
var when = require('when')
var helper = require('./helper')
var BaseBrowser = require('./launchers/')

var Launcher = function(opts) {
  var that = this
  var deferred = when.defer()
  function emptyFn() {}

  this.maxMemory = opts.maxMemory

  BaseBrowser.find(function(validBrowsers) {
    that.browsers = findBrowsers(validBrowsers, opts.browsers)
    that.launch(opts.capture)
    deferred.resolve(that)
  })

  this.kill = function() {
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

  this.restart = function() {
    parseArgs(arguments, function(names, cb) {
      logger.debug('restart browsers ' + names)

      this.kill(names, function() {
        that.launch(names)
        cb && cb()
      })
    })
  }

  function parseArgs(args, callback) {
    var cb, names = []
    if (args.length === 1 && isFunction(args[0])) {
      cb = args[0]
    } else {
      names = args[0]
      cb = args[1] || emptyFn
    }
    callback(names, cb)
  }

  // register events
  this.on('exit', this.kill)

  return deferred.promise
}


util.inherits(Launcher, events.EventEmitter)

Launcher.prototype.launch = function(captureUrl) {
  var that = this
  Object.keys(this.browsers).forEach(function(browserName) {
    var browser = that.browsers[browserName]
    browser.instance = new (browser.Cons)()
    logger.info('Starting browser ' + browser.instance.name + ' open ' + captureUrl)
    browser.instance.start(captureUrl)
  })
}

Launcher.prototype.findBrowserById = function(id) {
  this.browsers.filter(function(browser) {
    return browser.is(id)
  }).map(function(b) {
    return b.name
  })
}


Launcher.prototype.checkMemory= function(browserName, m) {
  m = parseInt(m, 10)

  if (m > maxMemory) {
    logger.warn('The browser ' + browserName + ' memory use too much ' + m + 'M')
    if (this.memoryRestartTimeout) return

    this.memoryRestartTimeout = setTimeout(function() {
      that.restart(browserName)
      this.memoryRestartTimeout = null
    }, 10000)
  }
}


function isFunction(obj) {
  return typeof obj === 'function'
}

function findBrowsers(validBrowsers, expectBrowsers) {
  //TODO filter expect browsers
  return validBrowsers
}

// PUBLISH
exports.Launcher = Launcher
