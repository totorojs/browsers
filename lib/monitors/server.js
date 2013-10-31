'use strict';

var util = require('util')
var http = require('http')

var common = require('totoro-common')
var logger = common.logger


module.exports = ServerMonitor


function ServerMonitor(capture) {
  this.capture = capture
}

util.inherits(ServerMonitor, events.EventEmitter)

ServerMonitor.prototype.start = function() {
  var that = this
  this.timer = setInterval(function() {
    http.get(that.capture, function(res) {
      if (res.statusCode > 199 && res.statusCode < 400) {
        that.emit('connected')
      } else {
        that.emit('disconnected')
      }
    }).on('error', function(e) {
      that.emit('disconnected')
    })
  }, 10000)
}

ServerMonitor.prototype.stop = function() {
  clearInterval(this.timer)
  ;delete this.timer
}
