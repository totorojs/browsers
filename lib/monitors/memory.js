'use strict';

var util = require('util')
var exec = require('child_process').exec

var common = require('totoro-common')
var logger = common.logger


module.exports = MemoryMonitor


function MemoryMonitor(name, limit) {
  this.name = name
  this.limit = limit
}

util.inherits(MemoryMonitor, events.EventEmitter)

MemoryMonitor.prototype.start = function() {
  var that = this
  this.timer = setInterval(function() {
    MemoryMonitor.getMemory(function(m){
      if(m > that.limit) {
        that.emit('overflow', m)
      }
    })
  }, 10000)
}

MemoryMonitor.prototype.stop = function() {
  clearInterval(this.timer)
  ;delete this.timer
}

MemoryMonitor.getMemory =
  process.platform === 'win32' ? getMemoryInWin32 : getMemory


function getMemory(cb) {
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


function getMemoryInWin32(cb) {
  var imageName = this.name === 'ie' ? 'iexplore.exe' : this.name + '.exe'
  var cmd = 'tasklist /fi "ImageName eq ' + imageName + '"'

  exec(cmd, null, function(error, stdout, stderr) {
    if(error) {
      logger.warn(error.message)
      cb(0)
    } else {
      var arr = stdout.match(/[0-9,]+(?= k)/ig)
      var m = arr.reduce(function(pre, cur) {
        return pre + parseInt(cur.replace(',', ''), 10)
      }, 0)
      cb(Math.floor(m/1024))
    }
  })
}






