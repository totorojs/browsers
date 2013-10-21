'use strict';

var path = require('path')
var Base = require('./')
var BaseSafari = require('../safari')
var util = require('./util')

var Safari = function() {
  Base.apply(this, arguments)
  BaseSafari.apply(this, arguments)
}

util.inherits(Safari, Base)

Safari.prototype.getCommand = function() {
  return Safari.path + '/Contents/MacOS/Safari'
}

Safari.find = function(cb) {
  if (Safari.path) {
    cb(Safari.path, Safari.version)
  }

  util.find('com.apple.Safari', function(err, p) {
    if (!p) {
      cb()
      return
    }

    Safari.path = p

    var pl = path.join(p, 'Contents', 'version.plist');
    util.parseVersionByPlist(pl, 'CFBundleShortVersionString', function(ver) {
      Safari.version = ver
      cb(p, ver)
    })
  })
}

// PUBLISH
module.exports = Safari
