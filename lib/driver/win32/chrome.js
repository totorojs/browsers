'use strict';

var exec = require('child_process').exec

var common = require('./common')

var queryVersion = 'reg query "' + common.regQueryPathPrefix + 'Google\\Update\\Clients" /s'
var queryPath = 'reg query "' + common.regQueryPathPrefix + 'Google\\Update" /s /v LastInstallerSuccessLaunchCmdLine'

var defaultPath = '%HOMEPATH%\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe'
var getDefaultPath = function(callback) {
  exec('echo ' + defaultPath, function(err, stdout) {
    callback(err, stdout.replace(/"/g, '').trim())
  })
}

var chromeVersion
var chromePath

exports.find = function(cb) {
  if (chromePath) cb(chromePath, chromeVersion)

  exec(queryVersion, function (err, stdout) {
    var data = stdout.split('\r\n')
    var inChrome

    data.forEach(function(line) {
      if (inChrome && !chromeVersion) {
        if (/pv/.test(line)) {
          chromeVersion = line.replace('pv', '').replace('REG_SZ', '').trim()
        }
      }
      if (/Google Chrome/.test(line)) {
        inChrome = true;
      }
    })


    if (!chromeVersion) {
        cb()
        return
    }

    exec(queryPath, function (err, stdout) {
      var data = stdout.split('\r\n')

      data.forEach(function(line) {
        if (/LastInstallerSuccessLaunchCmdLine/.test(line)) {
          var cmd = line.replace('LastInstallerSuccessLaunchCmdLine', '').replace('REG_SZ', '').replace(/"/g, '').trim()
          if (cmd) chromePath = cmd
        }
      })

      if (chromePath) {
        cb(chromePath, chromeVersion)
      } else {
        getDefaultPath(function(err, p) {
          chromePath = p
          cb(chromePath, chromeVersion)
        })
      }
    })
  })
}

exports.getCommand = function() {
  return chromePath
}

