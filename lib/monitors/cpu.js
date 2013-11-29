'use strict';

var util = require('util')
var exec = require('child_process').exec
var EventEmitter = require('events').EventEmitter
var os = require('os')

var common = require('totoro-common')
var logger = common.logger

var INTERVAL = 1


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
  }, INTERVAL * 1000)
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
        return pre + parseFloat(cur)
      }, 0).toFixed(1)

      logger.debug(rt)
      cb(rt)
    }
  })
}

var preCPUTimes = {}
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
      var curCPUTimes = {}

      var pattern
      if (that.name === 'safari') {
        pattern = /(?:safari|webkit2webprocess)\.exe +(\d+) .+?(\d+:\d+:\d+)/ig
      } else {
        pattern = /\.exe +(\d+) .+?(\d+:\d+:\d+)/ig
      }
      console.log(stdout)
      var matched
      while ((matched = pattern.exec(stdout)) != null) {
        console.log(matched)
        curCPUTimes[matched[1]] = matched[2]
      }

      var rt = curCPUTimes.keys().reduce(function(pre, cur) {
        if (cur in preCPUTimes) {
          return pre + (parse2second(curCPUTimes[cur]) - parse2second(preCPUTimes[cur]))/INTERVAL
        } else {
          return pre
        }
      }, 0).toFixed(1)

      preCPUTimes = curCPUTimes

      cb(rt)
    }
  })
}






