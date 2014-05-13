'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')

var common = require('./common')

var qryVersion = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + common.archPath + 'Apple Computer, Inc.\\Safari" /v Version';
var qryPath = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + common.archPath + 'Apple Computer, Inc.\\Safari" /v BrowserExe';

var browserPath
var browserVersion

var safari = {
  getCommand: function() {
    return browserPath
  },

  isExist: function(cb) {
    if (browserPath) {
      cb(true)
      return
    }

    exec(qryVersion, function (err, stdout) {
      var data = stdout.split('  '),
      browserVersion = data[data.length - 1].replace('Version', '').replace('REG_SZ', '').replace(/\t/g, '').replace(/\r\n/g, '').trim()

      if (!browserVersion) {
        cb(false)
        return
      }

      exec(qryPath, function (err, stdout) {
        var data = stdout.split('\r\n');
        data.forEach(function(line) {
          if (/BrowserExe/.test(line)) {
            var cmd = line.replace('BrowserExe', '').replace('REG_SZ', '').replace(/"/g, '').trim()
            if (cmd) browserPath = cmd
          }
        })

        cb(!!browserPath)
      })
    })
  }
}

utilx.mix(safari, require('../safari'))

module.exports = safari


