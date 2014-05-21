'use strict';

var path = require('path')
var child_process = require('child_process')
var utilx = require('utilx')

var logger = require('../logger')
var parent = require('../safari')
var common = require('./common')


var safari = {
  getCommand: function() {
    return this.path + '/Contents/MacOS/Safari'
  },

  isExist: function(cb) {
    var that = this

    if (this.version) {
      cb(true)
      return
    }

    common.find('com.apple.Safari', function(err, p) {
      if (err) {
        cb(false)
        return
      }
      that.path = p

      var pl = path.join(p, 'Contents', 'version.plist');
      common.parseVersionByPlist(pl, 'CFBundleShortVersionString', function(v) {
        if (!v) {
          cb(false)
          return
        }

        that.version = v
        cb(true)
      })
    })
  }
}

utilx.mix(safari, parent)

module.exports = safari

