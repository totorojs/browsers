'use strict';

var util = require('util')
var events = require('events')
var spawn = require('child_process').spawn
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var async = require('async')
var logger = require('totoro-common').logger

var env = process.env

var tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-')

process.on('SIGINT', function(){
  //graceful shutdown
  process.exit()
})


var Base = function() {
  var that = this
  // record sub process,
  this.processList = {}
  this.tempDir = tempDir
  this.id = Base.generateId()

  process.on('exit', function() {
    that.clean()
  })
}

util.inherits(Base, events.EventEmitter)

// 查找具体系统下的浏览器信息.
Base.find = function(cb) {
  var sysBase = require('.' + path.sep + process.platform + path.sep)
  sysBase.find(cb)
}

Base.prototype.start = function(url) {
  this.url = url || this.url
  this._start(this.url + '?id=' + this.id)
}

Base.prototype._start = function(url) {
  this.execCommand(this.getCommand(), this.getOptions(url))
}

Base.prototype.kill = function(cb) {
  logger.debug('Killing ' + this.name)
  var pl = this.processList

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
    }, 1000)
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
    that._onProcessExit(code, errorOutput)
  })

  this.processList[this.id] = _process
}


Base.prototype._onProcessExit = function(code, errorOutput) {
  logger.debug('Process %s exitted with code %d', this.name, code)
  if (code) {
      logger.debug('Cannot start %s\n\t%s', this.name, errorOutput)
  }
}

Base.prototype.toString = function() {
  return this.name
}

// processId or browsersName
Base.prototype.is = function(browserName) {
  if (/^\d+$/.test(browserName)) {
    return Object.keys(this.processList).indexOf(browserName) > -1
  }

  var reg = new RegExp(this.name, 'i')

  if (typeof browserName === 'string') {
      browserName = [browserName]
  }

  return browserName.some(function(name) {
      return name === '*' || reg.test(name)
  })
}

Base.prototype.getMemory = function(cb) {
  var bReg = new RegExp(this.name + '|' + this.alias, 'i')

  this.getProcessInfo('ps', ['axu'], bReg, function(infos) {
    // To find the memory location
    var head = infos.shift()
    var rssIndex = 0

    head.split(/\s+/).some(function(t) {
      rssIndex++
      return t === 'RSS'
    })

    // The default is fifth this position
    rssIndex = rssIndex || 5

    var memory = infos.reduce(function(m, info) {
        return parseInt(info.split(/\s+/)[5], 10) + m
    }, 0)

    cb(Math.round(memory / 1024) + 'M')
  })
}

Base.prototype.getProcessInfo = function(cmd, arg, bReg, cb) {
  var datas = []
  var p = spawn(cmd, arg)

  p.stdout.on('data', function(data) {
    datas.push(data)
  })

  p.on('close', function() {
    datas = datas.join('').split('\n')
    var infos = datas.filter(function(info) {
      return bReg.test(info)
    })

    infos.unshift(datas[0])
    cb(infos)
  })
}

Base.prototype.clean = function() {

}

Base.generateId = function() {
  return Math.floor(Math.random() * 100000000)
}

// PUBLISH
module.exports = Base
