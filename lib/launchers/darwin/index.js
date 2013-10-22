'use strict';

var async = require('async')
var Base = require('../')
var util = require('util')

var DefaultBrowsers = ['chrome', 'firefox', 'safari']

var DarwinBase = function() {
  Base.apply(this, arguments)
}

util.inherits(DarwinBase, Base)

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

