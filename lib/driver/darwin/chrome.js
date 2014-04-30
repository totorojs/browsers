'use strict';

var path = require('path')
var utilx = require('utilx')

var common = require('./common')

var browserPath
var browserVersion

var chrome = {

  getCommand: function() {
    return browserPath + '/Contents/MacOS/Google Chrome'
  },

  isExist: function(cb) {
    if (browserPath) cb(true)

    common.find('com.google.Chrome', function(err, p) {
      if (err) {
        logger.info('Not found chrome.')
        cb(false)
        return
      }

      browserPath = p

      var pl = path.join(p, 'Contents', 'Info.plist')
      common.parseVersionByPlist(pl, 'KSVersion', function(v) {
        if (!v) {
          logger.info('Don\'t know chrome version.')
          cb(false)
          return
        }

        browserVersion = v
        cb(true)
      })
    })
  }
}

utilx.mix(chrome, require('../chrome'))

module.exports = chrome
