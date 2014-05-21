'use strict';

var path = require('path')
var utilx = require('utilx')

var common = require('./common')


var firefox = {
  getCommand: function() {
    return this.path + '/Contents/MacOS/firefox-bin'
  },

  isExist: function(cb) {
    var that = this

    if (this.version) {
      cb(true)
      return
    }

    common.find('org.mozilla.firefox', function(err, p) {
      if (err) {
        cb(false)
        return
      }

      // may be multiple firefoxs of different version
      p = p.split('\n')[0]
      that.path = p

      var pl = path.join(p, 'Contents', 'Info.plist');
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

utilx.mix(firefox, require('../firefox'))

module.exports = firefox
