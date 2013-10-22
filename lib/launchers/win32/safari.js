'use strict';

var path = require('path')
var exec = require('child_process').exec
var Base = require('./')
var BaseSafari = require('../safari')
var util = require('./util')

var qryVersion = 'reg query "HKEY_LOCAL_MACHINE\\Software\\Apple Computer, Inc.\\Safari" /v Version';
var qryPath = 'reg query "HKEY_LOCAL_MACHINE\\Software\\Apple Computer, Inc.\\Safari" /v BrowserExe';

var Safari = function() {
  Base.apply(this, arguments)
  BaseSafari.apply(this, arguments)
}

util.inherits(Safari, Base)

Safari.prototype.getCommand = function() {
  return Safari.path
}


Safari.find = function(cb) {
  if (Safari.path) {
    cb(Safari.path, Safari.version)
  }

  exec(qryVersion, function (err, stdout) {
    var data = stdout.split('  '),
    version = data[data.length - 1].replace('Version', '').replace('REG_SZ', '').replace(/\t/g, '').replace(/\r\n/g, '').trim()

    exec(qryVersion, function (err, stdout) {
      var data = stdout.split(' ')
      Safari.version = data[data.length - 1].replace('Version', '').replace('REG_SZ', '').replace(/\t/g, '').replace(/\r\n/g, '').trim()

      exec(qryPath, function (err, stdout) {
        var data = stdout.split('\r\n');
        data.forEach(function(line) {
          if (/BrowserExe/.test(line)) {
            var cmd = line.replace('BrowserExe', '').replace('REG_SZ', '').replace(/"/g, '').trim()
            if (cmd) {
              Safari.path = cmd
              cb(cmd, Safari.version)
            }
          }
        })
      })
    })
  })
}

module.exports = Safari
