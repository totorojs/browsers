'use strict';

var async = require('async')
var util = require('util')
var fs = require('fs')
var Base = require('../')

var DefaultBrowsers = ['chrome', 'firefox', 'safari', 'opera']

var DarwinBase = function() {
  Base.apply(this, arguments)
}

util.inherits(DarwinBase, Base)

DarwinBase.find = function(cb) {
  var browserInfo = {}

  async.forEach(DefaultBrowsers, function(name, cb) {
     var Browser  = require(__dirname + '/' + name)
     Browser.find(function(p, ver) {
       if (p && ver) {
          browserInfo[name] = Browser
       }
       cb()
     })
  }, function() {
    cb(browserInfo)
  })
}

module.exports = DarwinBase
