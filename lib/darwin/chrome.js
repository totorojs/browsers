'use strict';

var path = require('path')
var utilx = require('utilx')

var common = require('./common')


var chrome = {

  getCommand: function() {
    return this.path + '/Contents/MacOS/Google Chrome'
  },

  isExist: function(cb) {
    var that = this

    if (this.version) {
      cb(true)
      return
    }

    common.find('com.google.Chrome', function(err, p) {
      if (err) {
        cb(false)
        return
      }

      that.path = p

      var pl = path.join(p, 'Contents', 'Info.plist')
      common.parseVersionByPlist(pl, 'KSVersion', function(v) {
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

utilx.mix(chrome, require('../chrome'))

module.exports = chrome
