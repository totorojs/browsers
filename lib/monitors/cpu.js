'use strict';

var util = require('util')
var exec = require('child_process').exec
var EventEmitter = require('events').EventEmitter
var os = require('os')

var common = require('totoro-common')
var logger = common.logger


module.exports = CPUMonitor


function CPUMonitor(name) {
  this.name = name.toLowerCase()
  this.limit = 10 * os.cpus().length
  this._values = []
  this.start()
}

util.inherits(CPUMonitor, EventEmitter)

CPUMonitor.prototype.start = function() {
  if (this.timer) return

  var that = this
  this.timer = setInterval(function() {
    that.getValue(function(v){
      if (v > that.limit) {
        that._values.push(v)
        if (that._values.length >= 3) {
          logger.info('CPU overflow.', {name: that.name, values: that._values})
          that.emit('overflow', v)
          that._values = []
        }
      } else {
        that._values = []
      }
    })
  }, 1000)
}

CPUMonitor.prototype.stop = function() {
  if (!this.timer) return

  clearInterval(this.timer)
  ;delete this.timer

  this._values = []
}

CPUMonitor.prototype.getValue =
  process.platform === 'win32' ? getValueInWin32 : getValue


function getValue(cb) {
  var that = this
  var cmd = 'ps -eo %cpu,comm | egrep -i \'' +
            (this.name === 'safari' ? 'safari|(?:web|plugin)process' : this.name) +
            '\''

  exec(cmd, null, function(error, stdout, stderr) {
    if (error) {
      logger.warn(error.message)
      cb(-1)

    } else {
      var temp = stdout.match(/ \d+\.\d+(?= )/ig) || []
      var rt = temp.reduce(function(pre, cur) {
        return pre + parsewa(cur)
      }, 0).toFixed(1)

      console.log(rt)
      cb(rt)
    }
  })
}


function getValueInWin32(cb) {
  cb(0)
  var that = this
  var imageName = this.name === 'ie' ? 'iexplore.exe' : this.name + '.exe'
  var cmd = this.name === 'safari' ? 'tasklist /v' : 'tasklist /v /fi "ImageName eq ' + imageName + '"'

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
          rt += parseInt(matched[1].replace(',', ''), 10)
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






