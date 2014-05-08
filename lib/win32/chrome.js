'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')

var common = require('./common')

var queryVersion = 'reg query "' + common.regQueryPathPrefix + 'Google\\Update\\Clients" /s'
var queryPath = 'reg query "' + common.regQueryPathPrefix + 'Google\\Update" /s /v LastInstallerSuccessLaunchCmdLine'

var defaultPath = '%HOMEPATH%\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe'
var getDefaultPath = function(callback) {
  exec('echo ' + defaultPath, function(err, stdout) {
    callback(err, stdout.replace(/"/g, '').trim())
  })
}

var browserPath
var browserVersion

var chrome = {
  getCommand: function() {
    return browserPath
  },

  isExist: function(cb) {
    if (browserPath) {
      cb(true)
      return
    }

    exec(queryVersion, function (err, stdout) {
      var data = stdout.split('\r\n')
      var inChrome

      data.forEach(function(line) {
        if (inChrome && !browserVersion) {
          if (/pv/.test(line)) {
            browserVersion = line.replace('pv', '').replace('REG_SZ', '').trim()
          }
        }
        if (/Google Chrome/.test(line)) {
          inChrome = true;
        }
      })


      if (!browserVersion) {
          cb(false)
          return
      }

      exec(queryPath, function (err, stdout) {
        var data = stdout.split('\r\n')

        data.forEach(function(line) {
          if (/LastInstallerSuccessLaunchCmdLine/.test(line)) {
            var cmd = line.replace('LastInstallerSuccessLaunchCmdLine', '').replace('REG_SZ', '').replace(/"/g, '').trim()
            if (cmd) browserPath = cmd
          }
        })

        if (browserPath) {
          cb(true)
        } else {
          getDefaultPath(function(err, p) {
            logger.debug('Chrome path:', p)
            browserPath = p
            cb(!!p)
          })
        }
      })
    })
  }
}

utilx.mix(chrome, require('../chrome'))

module.exports = chrome
