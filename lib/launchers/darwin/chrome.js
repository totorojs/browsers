'use strict';

var path = require('path')
var Base = require('./')
var BaseChrome = require('../Chrome')
var util = require('./util')

var Chrome = function() {
  Base.apply(this, arguments)
  BaseChrome.apply(this, arguments)
}

util.inherits(Chrome, Base)

Chrome.prototype.getCommand = function() {
  return Chrome.path + '/Contents/MacOS/Google Chrome'
}

Chrome.find = function(cb) {
  if (Chrome.path) {
    cb(Chrome.path, Chrome.version)
  }

  util.find('com.google.Chrome', function(err, p) {
    if (!p) {
      cb()
      return
    }

    Chrome.path = p

    var pl = path.join(p, 'Contents', 'Info.plist')

    util.parseVersionByPlist(pl, 'KSVersion', function(ver) {
      Chrome.version = ver
      cb(p, ver)
    })
  })
}

// PUBLISH
module.exports = Chrome
