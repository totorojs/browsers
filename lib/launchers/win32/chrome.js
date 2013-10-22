'use strict';

var path = require('path')
var exec = require('child_process').exec
var Base = require('./')
var BaseChrome = require('../chrome')
var util = require('./util')

var qryVersion = 'reg query "HKEY_CURRENT_USER\\Software\\Google\\Update\\Clients" /s';
var qryPath = 'reg query "HKEY_CURRENT_USER\\Software\\Google\\Update" /v LastInstallerSuccessLaunchCmdLine';

var Chrome = function() {
  Base.apply(this, arguments)
  BaseChrome.apply(this, arguments)
}

util.inherits(Chrome, Base)

Chrome.prototype.getCommand = function() {
  return Chrome.path
}


Chrome.find = function(cb) {
  if (Chrome.path) {
    cb(Chrome.path, Chrome.version)
  }

  exec(qryVersion, function (err, stdout) {
    var data = stdout.split('\r\n')
    var version = ''
    var inChrome

    data.forEach(function(line) {
      if (inChrome && !version) {
        if (/pv/.test(line)) {
          version = line.replace('pv', '').replace('REG_SZ', '').trim()
        }
      }
      if (/Google Chrome/.test(line)) {
        inChrome = true;
      }
    })

    Chrome.version = version

    exec(qryPath, function (err, stdout) {
      var data = stdout.split('\r\n')
      var chromePath

      data.forEach(function(line) {
        if (/LastInstallerSuccessLaunchCmdLine/.test(line)) {
          var cmd = line.replace('LastInstallerSuccessLaunchCmdLine', '').replace('REG_SZ', '').replace(/"/g, '').trim()

          if (cmd) {
            chromePath = cmd
          }
        }
      })

      if (!chromePath && version) {
        getDefaultPath(function(err, p) {
          Chrome.path = p
          cb(p, version)
        })
      } else {
        Chrome.path = chromePath
        cb(chromePath, version)
      }
    })
  })
}

var defaultPath = '%HOMEPATH%\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe'
var getDefaultPath = function(callback) {
  exec('echo ' + defaultPath, function(err, stdout) {
    callback(err, stdout.replace(/"/g, '').trim())
  })
}

module.exports = Chrome
