'use strict';

var path = require('path')
var exec = require('child_process').exec
var Base = require('./')
var BaseFirefox = require('../firefox')
var util = require('./util')

var qryVersion = 'reg query "HKEY_CURRENT_USER\\Software\\Mozilla\\Mozilla Firefox" /v CurrentVersion';
var qryVersion2 = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + util.archPath + 'Mozilla\\Mozilla Firefox" /v CurrentVersion';
var qryPath = 'reg query "HKEY_CURRENT_USER\\Software\\Mozilla\\Mozilla Firefox\\" /s /v PathToExe';
var qryPath2 = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + util.archPath + 'Mozilla\\Mozilla Firefox\\%VERSION%\\Main\\" /s /v PathToExe';


var Firefox = function() {
  Base.apply(this, arguments)
  BaseFirefox.apply(this, arguments)
}

util.inherits(Firefox, Base)

Firefox.prototype.getCommand = function() {
  return Firefox.path
}

function findVersion(cb) {
  if (Firefox.version) {
    cb(Firefox.version)
    return
  }

  exec(qryVersion, function (err, stdout) {
    var data = stdout.split('  ')
    var version = data[data.length - 1].replace(/\r\n/g, '').trim()

    if (version) {
      Firefox.version = version
      cb(version)
      return
    }
    exec(qryVersion2, function (err, stdout) {
      var data = stdout.split('  '),
      version = data[data.length - 1].replace('CurrentVersion', '').replace('REG_SZ', '').replace(/\r\n/g, '').trim();
      if (version) {
        Firefox.version = version
      }
      cb(version)
    })
  })
}

function findPath(cb) {
  if (Firefox.path) {
    cb(Firefox.path)
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
      Firefox.path = ffPath
      cb(ffPath)
      return
    }

    findVersion(function(version) {
      if (!version) {
        cb(null)
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
          Firefox.path = ffPath
        }
        cb(ffPath)
      })
    })
  })
}

Firefox.find = function(cb) {
  findPath(function(ffpath) {
    findVersion(function(version) {
      cb(ffpath, version)
    })
  })
}

module.exports = Firefox
