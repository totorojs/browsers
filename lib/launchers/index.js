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

  process.on('exit', function() {
    logger.info('close browser ' + that.name)
  })

  this.checkMemory()
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
  this.execCommand(this.getCommand(), this.getOptions(this.capture))
}

Base.prototype.restart = function() {

}

Base.prototype.kill = function(cb) {
  logger.debug('Killing ' + this.name)
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

Base.prototype.execCommand = function(cmd, args) {
  var that = this
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

  this.processList[this.id] = _process
}

Base.prototype.toString = function() {
  return this.name
}

Base.prototype.checkMemory = function() {
  var that = this
  var memory = this.memory

  this.checkInterval = setInterval(function() {
    var cmd = 'ps -eo rss,comm | grep -i \'' + that.name + '\' | awk \'{sum+=$1} END {print sum/1024}\''
    exec(cmd, null, function(error, stdout, stderr) {
      if(error) {
        logger.warn(error.message)
      } else {
        stdout = Math.floor(stdout)
        logger.debug(that.name, 'memory: ', stdout)
        if (stdout > memory) {
          logger.warn('Browser memory overflow.', {
            browser: that.name,
            memory: stdout
          })

          clearInterval(that.checkInterval)
          that.checkInterval = null

          that.kill(function() {
            setTimeout(function() {
              that.start()
              that.checkMemory()
            }, 5000)
          })
        }
      }
    })
  }, 10000)
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
