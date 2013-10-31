module.exports = ServerMonitor


function CPUMonitor(name) {
  this.name = name
}

util.inherits(CPUMonitor, events.EventEmitter)

CPUMonitor.prototype.start = function() {
  var that = this
  this.timer = setInterval(function() {
    // TODO
  }, 10000)
}

CPUMonitor.prototype.stop = function() {
  clearInterval(this.timer)
  ;delete this.timer
}
