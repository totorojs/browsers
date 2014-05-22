'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')

var common = require('./common')

var qryVersion = 'reg query "HKEY_CURRENT_USER\\Software\\Mozilla\\Mozilla Firefox" /v CurrentVersion'
var qryVersion2 = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + common.archPath + 'Mozilla\\Mozilla Firefox" /v CurrentVersion'
var qryPath = 'reg query "HKEY_CURRENT_USER\\Software\\Mozilla\\Mozilla Firefox\\" /s /v PathToExe'
var qryPath2 = 'reg query "HKEY_LOCAL_MACHINE\\Software\\' + common.archPath + 'Mozilla\\Mozilla Firefox\\%VERSION%\\Main" /v PathToExe'


var firefox = {
  getCommand: function() {
    return this.path
  },

  isExist: function(cb) {
    var that = this

    if (this.path) {
      cb(true)
      return
    }

    this._findVersion(function(v) {
      if (!v) {
        cb(false)
        return
      }
      that._findPath(function(p) {
        cb(!!p)

        that.version = that.version.replace(/[^\d.]+/g, '');
      })
    })
  },

  _findVersion: function(cb) {
    var that = this

    if (this.version) {
      cb(this.version)
      return
    }

    exec(qryVersion, function (err, stdout) {
      var data = stdout.split('  ')
      var version = data[data.length - 1].replace(/\r\n/g, '').trim()

      if (version) {
        that.version = version
        cb(that.version)
        return
      }
      exec(qryVersion2, function (err, stdout) {
        var data = stdout.split('  '),
        version = data[data.length - 1].replace('CurrentVersion', '').replace('REG_SZ', '').replace(/\r\n/g, '').trim();
        if (version) {
          that.version = version
        }
        cb(version)
      })
    })
  },

  _findPath: function(cb) {
    var that = this

    if (this.path) {
      cb(this.path)
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
        that.path = ffPath
        cb(ffPath)
        return
      }

      exec(qryPath2.replace('%VERSION%', that.version), function (err, stdout) {
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
          that.path = ffPath
        }
        cb(ffPath)
      })
    })
  }
}


utilx.mix(firefox, require('../firefox'))


module.exports = firefox




