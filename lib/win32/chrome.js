'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')
var logger = require('../logger');

var common = require('./common')

var queryVersion = 'reg query "' + common.regQueryPathPrefix + 'Google\\Update\\Clients" /s'
var queryPath = 'reg query "' + common.regQueryPathPrefix + 'Google\\Update" /s /v LastInstallerSuccessLaunchCmdLine'

var defaultPath = '%HOMEPATH%\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe'
var getDefaultPath = function(callback) {
  exec('echo ' + defaultPath, function(err, stdout) {
    callback(err, stdout.replace(/"/g, '').trim())
  })
}


var chrome = {
  getCommand: function() {
    return this.path
  },

  isExist: function(cb) {
    var that = this

    if (this.path) {
      cb(true)
      return
    }

    exec(queryVersion, function (err, stdout) {
      var data = stdout.split('\r\n')
      var inChrome

      data.forEach(function(line) {
        if (inChrome && !that.version) {
          if (/pv/.test(line)) {
            that.version = line.replace('pv', '').replace('REG_SZ', '').trim()
          }
        }
        if (/Google Chrome/.test(line)) {
          inChrome = true;
        }
      })


      if (!that.version) {
          cb(false)
          return
      }

      exec(queryPath, function (err, stdout) {
        var data = stdout.split('\r\n')

        data.forEach(function(line) {
          if (/LastInstallerSuccessLaunchCmdLine/.test(line)) {
            var cmd = line.replace('LastInstallerSuccessLaunchCmdLine', '').replace('REG_SZ', '').replace(/"/g, '').trim()
            if (cmd) that.path = cmd
          }
        })

        if (that.path) {
          cb(true)
        } else {
          getDefaultPath(function(err, p) {
            logger.debug('Chrome path:', p)
            that.path = p
            cb(!!p)
          })
        }
      })
    })
  }
}

utilx.mix(chrome, require('../chrome'))

module.exports = chrome
