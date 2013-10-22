'use strict';

var os = require('os')
var async = require('async')
var logger = require('totoro-common').logger

var helper = require('./helper')

// memory monitor
exports.run = function(launcher, opts) {
  var memory, computeTimeout
  var allBrowsers = launcher.browsers

  function computeMemory(cb) {
    cb = cb || function() {}

    if (computeTimeout) {
      cb(memory || {})
      return
    }

    computeTimeout = setTimeout(function() {
      memory = {}
      async.forEachSeries(allBrowsers, function(b, cb) {
        if (memory[b.name]) cb()

        b.getMemory(function(m) {
          memory[b.name] = m
          // check memory
          launcher.checkMemory(b.name, m)
          cb()
        })
      }, function() {
        // 添加系统内存使用情况
        var freemem = os.freemem()
        var totalmem = os.totalmem()
        var usedmem = totalmem - freemem

        memory['totalmem'] = Math.round(totalmem / (1024 * 1024)) + 'M'
        memory['usedmem'] = Math.round(usedmem / (1024 * 1024)) + 'M'
        cb(memory)
      })

      computeTimeout = null

    }, 5000)
  }
}
