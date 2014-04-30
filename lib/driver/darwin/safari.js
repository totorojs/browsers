'use strict';

var path = require('path')
var child_process = require('child_process')
var utilx = require('utilx')

var logger = require('../../logger')
var parent = require('../safari')
var common = require('./common')

var browserPath
var browserVersion

var safari = {
  getCommand: function() {
    return browserPath + '/Contents/MacOS/Safari'
  },

  isExist: function(cb) {
    if (browserVersion) {
      cb(true)
      return
    }

    common.find('com.apple.Safari', function(err, p) {
      if (err) {
        cb(false)
        return
      }
      browserPath = p

      var pl = path.join(p, 'Contents', 'version.plist');
      common.parseVersionByPlist(pl, 'CFBundleShortVersionString', function(v) {
        if (!v) {
          cb(false)
          return
        }

        browserVersion = v
        cb(true)
      })
    })
  },

  close: function(cb) {
    var that = this
    child_process.exec('osascript -e \'tell application "safari" to quit\'', function(err){
      if (err) throw err
      if (!that.process) return

      logger.info('Close', that.name)

      that.process.kill('SIGKILL')
      ;delete that.process
      cb && cb()
    })
  }
}

utilx.mix(safari, parent)

module.exports = safari

