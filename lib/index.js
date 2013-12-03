'use strict';

var events = require('events')
var util = require('util')
var common = require('totoro-common')
var logger = common.logger
var async = require('async')

var helper = require('./helper')
var BaseBrowser = require('./launchers/')

var Memory = require('./monitors/memory')
var Cpu = require('./monitors/cpu')
var Server = require('./monitors/server')

var later = require('later')
later.date.localTime()

var defaultOpts = {
  port: '9997',
  timeout: 50000,
  capture: '10.15.52.87:9999',
  manager: false
}

var Browsers = {}
var options

exports.launch = function(opts) {

  var fileOpts = common.readCfgFile('browsers-config.json')
  common.mix(opts, fileOpts, defaultOpts)

  if (opts.capture.indexOf('http') < 0) {
    opts.capture = 'http://' + opts.capture
  }

  options = opts

  BaseBrowser.find(function(valid) {
    Browsers = filterBrowsers(opts.browsers, valid)
    var browserNames = Object.keys(Browsers)
    start(browserNames, opts)

    browserNames.forEach(function(name) {
      var m = Memory.get(name)
      var cpu = Cpu.get(name)

      m.on('overflow', function() {
        restart([name])
      })

      m.on('empty', function() {
        start([name])
      })

      cpu.on('overflow', function() {
        restart([name])
      })

      m.start()
      cpu.start()

    });

    if (opts.schedule) {
      schedule(opts.schedule, browserNames)
    }

    var server = Server.get(options.capture)

    server.on('disconnected', function() {
      kill(browserNames)
    })

    server.on('connected', function() {
      start(browserNames)
    })

    process.on('SIGINT', function() {
      logger.debug('Got SIGINT. ')

      kill(browserNames, function() {
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
    setTimeout(function() {
      start(names)
    }, 1000)
  })
}

function schedule(cron, names) {
  if (cron.split(/\s+/).length === 5) {
    cron = '0 ' + cron;
  }

  var sched = later.parse.cron(cron, true);
  later.setInterval(function() {
    console.info('schedule ...')
    restart(names)
  }, sched)
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
