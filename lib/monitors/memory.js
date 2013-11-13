'use strict';

var util = require('util')
var exec = require('child_process').exec
var EventEmitter = require('events').EventEmitter

var common = require('totoro-common')
var logger = common.logger


module.exports = MemoryMonitor


function MemoryMonitor(name, limit) {
  this.name = name.toLowerCase()
  this.limit = limit
  this.start()
}

util.inherits(MemoryMonitor, EventEmitter)

MemoryMonitor.prototype.start = function() {
  if (this.timer) return

  var that = this
  this.timer = setInterval(function() {
    that.getMemory(function(m){
      if(m > that.limit) {
        logger.info('Memory overflow.', {browser: that.name, usage: m})
        that.emit('overflow', m)
      }
    })
  }, 10000)
}

MemoryMonitor.prototype.stop = function() {
  if (!this.timer) return

  clearInterval(this.timer)
  ;delete this.timer
}

MemoryMonitor.prototype.getMemory =
  process.platform === 'win32' ? getMemoryInWin32 : getMemory


function getMemory(cb) {
  var that = this
  var cmd = 'ps -eo rss,comm | egrep -i \'' +
            (this.name === 'safari' ? 'safari|(web|plugin)process' : this.name) +
            '\' | awk \'{sum+=$1} END {print sum/1024}\''

  exec(cmd, null, function(error, stdout, stderr) {
    if(error) {
      logger.warn(error.message)
      cb(-1)

    } else {
      var rt = Math.floor(stdout)
      logger.debug('Memory usage.', {browser: that.name, usage: rt})
      cb(Math.floor(stdout))
    }
  })
}


function getMemoryInWin32(cb) {
  var that = this
  var imageName = this.name === 'ie' ? 'iexplore.exe' : this.name + '.exe'
  var cmd = this.name === 'safari' ? 'tasklist' : 'tasklist /fi "ImageName eq ' + imageName + '"'

  exec(cmd, null, function(error, stdout, stderr) {
    if(error) {
      logger.warn(error.message)
      cb(-1)

    } else {
      var rt = 0

      if (that.name === 'safari') {
        var pattern = /(?:safari|webkit2webprocess)\.exe.+?([0-9,]+) k/ig
        var matched
        while ((matched = pattern.exec(stdout)) != null) {
          rt += parseInt(matched.replace(',', ''), 10)
        }

      } else {
        var arr = stdout.match(/[0-9,]+(?= k)/ig) || []
        rt = arr.reduce(function(pre, cur) {
          return pre + parseInt(cur.replace(',', ''), 10)
        }, 0)
      }

      rt = Math.floor(rt/1024)
      logger.debug('Memory usage.', {browser: that.name, usage: rt})
      cb(rt)
    }
  })
}






