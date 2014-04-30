'use strict';

var path = require('path')
var utilx = require('utilx')

var common = require('./common')

var browserPath
var browserVersion

var firefox = {
  getCommand: function() {
    return browserPath + '/Contents/MacOS/firefox-bin'
  },

  isExist: function(cb) {
    if (browserVersion) cb(true)

    common.find('org.mozilla.firefox', function(err, p) {

      if (err) {
        cb(false)
        return
      }

      // may be multiple firefoxs of different version
      p = p.split('\n')[0]
      browserPath = p

      var pl = path.join(p, 'Contents', 'Info.plist');
      common.parseVersionByPlist(pl, 'CFBundleShortVersionString', function(v) {
        if (!v) {
          cb(false)
          return
        }

        browserVersion = v
        cb(true)
      })
    })
  }
}

utilx.mix(firefox, require('../firefox'))

module.exports = firefox
