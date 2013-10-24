'use strict';

var fs = require('fs')
var path = require('path')
var async = require('async')
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var Base = require('../')
var util = require('util')

var readLine = require ('readline')

var DefaultBrowsers = ['chrome', 'firefox', 'safari', 'ie']

var Win32Base = function() {
  var that = this
  Base.apply(this, arguments)
  Win32Base.browsers.push(this)
}

util.inherits(Win32Base, Base)

Win32Base.prototype.kill = function(cb) {
  var that = this
  var params = ['/IM', (this.alias || this.name).toLowerCase() + '.exe', '/F']
    var p = spawn('taskkill', params)
    p.on('close', function() {
      that.killSubProcess(cb)
    })
}

Win32Base.find = function(cb) {
  var browserInfo = {}

  async.forEach(DefaultBrowsers, function(name, cb) {
    var browser  = require(__dirname + path.sep + name)
    browser.find(function(p, ver) {
      if (p && ver) {
        browserInfo[name] = {
          path: p,
          version: ver,
          Cons: browser
        }
      }
      cb()
    })
  }, function() {
    cb(browserInfo)
  })
}

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
