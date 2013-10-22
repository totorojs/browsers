'use strict';

var path = require('path')
var child_process = require('child_process');
var async = require('async')
var logger = require('totoro-common').logger
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

Safari.prototype.kill = function(cb) {
  var that = this
  logger.debug('Killing ' + this.name)
  var pl = this.processList

   //Closing Safari is "special"
  child_process.exec('osascript -e \'tell application "safari" to quit\'', function(err){
    if(err){
      throw err
    }

    that.killSubProcess(cb)
  })
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
