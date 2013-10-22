'use strict';

var async = require('async')
var util = require('util')
var fs = require('fs')
var shelljs = require('shelljs')
var Base = require('../')

var DefaultBrowsers = ['chrome', 'firefox', 'safari']

var DarwinBase = function() {
  Base.apply(this, arguments)
}

util.inherits(DarwinBase, Base)

DarwinBase.prototype.clean = function() {
  var profileDir = this.tempDir + this.name
  if (fs.existsSync(profileDir)) {
    shelljs.rm('-rf', profileDir)
  }
}

DarwinBase.find = function(cb) {
  var browserInfo = {}

  async.forEach(DefaultBrowsers, function(name, cb) {
     var browser  = require(__dirname + '/' + name)
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

module.exports = DarwinBase

