'use strict';

var fs = require('fs')
var path = require('path')
var shelljs = require('shelljs')
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


  // deal with ctrl+c
  (readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
  })).on ('SIGINT', function (){
    var params = ['/IM', (that.alias || that.name).toLowerCase() + '.exe', '/F']
    var p = spawn('taskkill', params)

    p.on('close', function() {
      process.emit('SIGINT')
    })
  })
}

util.inherits(Win32Base, Base)

Win32Base.prototype.clean = function() {
  var profileDir = this.tempDir + this.name
  if (fs.existsSync(profileDir)) {
    // shelljs.rm('-rf', profileDir)
  }
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

  this.getBrowserProcessInfo('tasklist', [], bReg, function(infos) {
      infos.shift()

      var memory = infos.reduce(function(m, info) {
          info = info.split(/\s+/)
          return parseInt(info[info.length - 3].replace(/,/g, ''), 10) + m
      }, 0)

      cb(Math.round(memory/1024) + 'M')
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

module.exports = Win32Base
