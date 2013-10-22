'use strict';

var path = require('path')
var Base = require('./')
var BaseFirefox = require('../Firefox')
var util = require('./util')

var Firefox = function() {
  Base.apply(this, arguments)
  BaseFirefox.apply(this, arguments)
}

util.inherits(Firefox, Base)

Firefox.prototype.getCommand = function() {
  return Firefox.path + '/Contents/MacOS/firefox-bin'
}

Firefox.find = function(cb) {
  if (Firefox.path) {
    cb(null, Firefox.path)
  }

  util.find('org.mozilla.firefox', function(err, p) {
    if (!p) {
      cb()
      return
    }

    // firefox 可以多版本共存, 简单起见, 我们只处理一个版本.
    p = p.split('\n')[0]
    Firefox.path = p

    var pl = path.join(p, 'Contents', 'Info.plist');

    util.parseVersionByPlist(pl, 'CFBundleShortVersionString', function(ver) {
      Firefox.version = ver
      cb(p, ver)
    })
  })
}

// PUBLISH
module.exports = Firefox
