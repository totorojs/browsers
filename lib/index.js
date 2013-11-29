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

var Browsers = {}
var options

exports.launch = function(opts) {
  var M = require('./monitors/cpu')
  var m = new M('chrome')
  return

  var fileOpts = common.readCfgFile('browsers-config.json')
  common.mix(opts, fileOpts, defaultOpts)

  if (opts.capture.indexOf('http') < 0) {
    opts.capture = 'http://' + opts.capture
  }

  options = opts

  BaseBrowser.find(function(valid) {
    Browsers = filterBrowsers(opts.browsers, valid)
    start(Object.keys(Browsers), opts)

    process.on('SIGINT', function() {
      logger.debug('Got SIGINT. ')

      kill(Object.keys(Browsers), function() {
        process.exit()
      })
    })
  })
}

function start(names) {
  logger.info('Start browsers ' + names.join(',') + ' open ' + options.capture)

  names.forEach(function(name) {
    var Browser = Browsers[name]
    if (!Browser.instance) {
        Browser.instance = new Browser(options)
    }
    Browser.instance.start()
  })
}

function kill(names, cb) {
  logger.info('Kill browsers ', names.join(','))

  async.forEach(names, function(name, cb) {
    var Browser = Browsers[name]
    if (Browser.instance) {
      Browser.instance.kill(cb)
    } else {
      logger.debug('Not found ' + name + ' to kill.')
    }
  }, function() {
      cb && cb()
  })
}

function restart(names, cb) {
  logger.info('Restart browsers ' + names.join(','))

  kill(names, function() {
    start(names)
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
