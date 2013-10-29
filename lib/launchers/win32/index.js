'use strict';

var fs = require('fs')
var spawn = require('child_process').spawn
var Base = require('../')
var util = require('util')

var readLine = require ('readline')


var Win32Base = function() {
  var that = this
  Base.apply(this, arguments)
}

util.inherits(Win32Base, Base)

Win32Base.prototype.kill = function(cb) {
  var that = this
  var params = ['/IM', (this.alias || this.name).toLowerCase() + '.exe', '/F']
    var p = spawn('taskkill', params)
    p.on('close', function() {
      Win32Base.super_.prototype.kill.call(that, cb)
    })
}

Win32Base.browsers = ['chrome', 'firefox', 'safari', 'ie', 'opera']

Win32Base.prototype.getMemory = function(cb) {
  var bReg = new RegExp(this.name + '|' + this.alias, 'i')

  this.getProcessInfo('tasklist', [], bReg, function(infos) {
      infos.shift()

      var memory = infos.reduce(function(m, info) {
          info = info.split(/\s+/)
          return parseInt(info[info.length - 3].replace(/,/g, ''), 10) + m
      }, 0)

      cb(Math.round(memory / 1024))
  })
}

module.exports = Win32Base
