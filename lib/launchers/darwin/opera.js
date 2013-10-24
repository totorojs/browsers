'use strict';

var path = require('path')
var Base = require('./')
var BaseOpera = require('../opera')
var util = require('./util')

var Opera = function() {
  Base.apply(this, arguments)
  BaseOpera.apply(this, arguments)
}

util.inherits(Opera, Base)

Opera.prototype.getCommand = function() {
  return Opera.path + '/Contents/MacOS/Opera'
}

Opera.find = function(cb) {
  if (Opera.path) {
    cb(Opera.path, Opera.version)
  }

  util.find('com.operasoftware.Opera', function(err, p) {
    if (!p) {
      cb()
      return
    }
    Opera.path = p
    var pl = path.join(p, 'Contents', 'Info.plist');

    util.parseVersionByPlist(pl, 'CFBundleShortVersionString', function(ver) {
      Opera.version = ver
      cb(p, ver)
    })
  })
}

// PUBLISH
module.exports = Opera
