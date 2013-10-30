'use strict';

var util = require('util')
var events = require('events')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var shelljs = require('shelljs')
var async = require('async')
var logger = require('totoro-common').logger

var env = process.env

var tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-')

var Base = function(opts) {
  var that = this
  // record sub process,
  this.processList = {}
  this.tempDir = tempDir
  this.capture = opts.capture
  this.memory = opts.memory
  this.id = Base.generateId()
}

util.inherits(Base, events.EventEmitter)

// find system browsers info
Base.find = function(cb) {
  var defaultBrowsers = require('./' + process.platform + '/').browsers
  var browserInfo = {}

  async.forEach(defaultBrowsers, function(name, cb) {
     var Browser  = require(__dirname + path.sep + process.platform + path.sep + name)
     Browser.find(function(p, ver) {
       if (p && ver) {
          browserInfo[name] = Browser
       }
       cb()
     })
  }, function() {
    cb(browserInfo)
  })
}

Base.prototype.start = function() {
  var that = this
  logger.debug('Start ' + this.name)

  this.createProfile(function() {
    var args = that.getOptions.apply(that, [].slice.call(arguments, 0))
    var cmd = that.getCommand()

    logger.debug(cmd + ' ' + args.join(' '))
    var _process = spawn(cmd, args)
    var errorOutput = ''

    _process.stderr.on('data', function(data) {
      errorOutput += data.toString()
    })

    _process.on('close', function(code) {
      logger.debug('Process %s exitted with code %d', that.name, code)
      if (code) {
          logger.debug('Cannot start %s\n\t%s', that.name, errorOutput)
      }
      that.clean()
    })

    that.processList[that.id] = _process

    // begin memory check
    that.checkMemory()
  })
}

Base.prototype.createProfile = function(callback) {
  callback.call(this)
}

Base.prototype.restart = function() {
  var that = this
  logger.debug('Restart ' + this.name)
  this.kill(function() {
    setTimeout(function() {
      that.start()
    }, 5000)
  })
}

Base.prototype.kill = function(cb) {
  logger.debug('Kill ' + this.name)

  // close memory check
  clearInterval(this.checkInterval)
  this.checkInterval = null

  var pl = this.processList
  var that = this

  async.forEach(Object.keys(pl), function(subId, cb) {
    var _process = pl[subId]
    if (!_process) {
        cb()
        return
    }

    _process.kill()
    ;delete pl[subId]
    cb()
  }, function() {
    setTimeout(function() {
      cb()
    }, 100)
  })
}

Base.prototype.toString = function() {
  return this.name
}

Base.prototype.checkMemory = function() {
  var that = this
  var memory = this.memory

  this.checkInterval = setInterval(function() {

    that.getMemory(function(m) {
      logger.debug(that.name, 'memory: ', m)

      if (m > memory) {
        logger.warn('Browser memory overflow.', {
          browser: that.name,
          memory: m
        })
        that.restart()
      }
    })
  }, 10000)
}

Base.prototype.getMemory = function(cb) {
  var cmd = 'ps -eo rss,comm | grep -i \'' + this.name + '\' | awk \'{sum+=$1} END {print sum/1024}\''

  exec(cmd, null, function(error, stdout, stderr) {
    if(error) {
      logger.warn(error.message)
      cb(0)
    } else {
      cb(Math.floor(stdout))
    }
  })
}

Base.prototype.clean = function() {
  var profileDir = this.tempDir + this.name
  if (fs.existsSync(profileDir)) {
    shelljs.rm('-rf', profileDir + '/*')
  }
}

Base.generateId = function() {
  return Math.floor(Math.random() * 100000000)
}

// PUBLISH
module.exports = Base
