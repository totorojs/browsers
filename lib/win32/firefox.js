'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')

var common = require('./common')

var qryVersion = 'reg query "HKEY_CURRENT_USER\\Software\\Mozilla\\Mozilla Firefox" /v CurrentVersion'
var qryVersion2 = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + common.archPath + 'Mozilla\\Mozilla Firefox" /v CurrentVersion'
var qryPath = 'reg query "HKEY_CURRENT_USER\\Software\\Mozilla\\Mozilla Firefox\\" /s /v PathToExe'
var qryPath2 = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + common.archPath + 'Mozilla\\Mozilla Firefox\\%VERSION%\\Main" /v PathToExe'

var browserPath
var browserVersion

var firefox = {
  getCommand: function() {
    return browserPath
  },

  isExist: function(cb) {
    if (browserPath) {
      cb(true)
      return
    }

    findVersion(function(v) {
      if (!v) {
        cb(false)
        return
      }
      findPath(v, function(p) {
        cb(!!p)
      })
    })
  }
}

utilx.mix(firefox, require('../firefox'))

module.exports = firefox


function findVersion(cb) {
  if (browserVersion) {
    cb(browserVersion)
    return
  }

  exec(qryVersion, function (err, stdout) {
    var data = stdout.split('  ')
    var version = data[data.length - 1].replace(/\r\n/g, '').trim()

    if (version) {
      browserVersion = version
      cb(browserVersion)
      return
    }
    exec(qryVersion2, function (err, stdout) {
      var data = stdout.split('  '),
      version = data[data.length - 1].replace('CurrentVersion', '').replace('REG_SZ', '').replace(/\r\n/g, '').trim();
      if (version) {
        browserVersion = version
      }
      cb(version)
    })
  })
}

function findPath(version, cb) {
  if (browserPath) {
    cb(browserPath)
    return
  }

  exec(qryPath, function (err, stdout) {
    var data = stdout.split('\r\n')
    var ffPath
    data.forEach(function(line) {
      if (/PathToExe/.test(line)) {
        var cmd = line.replace('PathToExe', '').replace('REG_SZ', '').replace(/"/g, '').trim();

        if (cmd) {
          ffPath = cmd
        }
      }
    })

    if (ffPath) {
      browserPath = ffPath
      cb(ffPath)
      return
    }

    exec(qryPath2.replace('%VERSION%', version), function (err, stdout) {
      var data = stdout.split('\r\n')
      var ffPath

      data.forEach(function(line) {
        if (/PathToExe/.test(line)) {
          var cmd = line.replace('PathToExe', '').replace('REG_SZ', '').replace(/"/g, '').trim()
          if (cmd) {
            ffPath = cmd;
          }
        }
      })

      if (ffPath) {
        browserPath = ffPath
      }
      cb(ffPath)
    })
  })
}


