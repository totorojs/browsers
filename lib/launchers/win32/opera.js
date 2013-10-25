'use strict';

var path = require('path')
var exec = require('child_process').exec
var Base = require('./')
var BaseOpera = require('../opera')
var util = require('./util')

var qryPath = 'reg query "HKEY_CURRENT_USER\\Software\\' + util.archPath + 'Opera Software\\" /v Last CommandLine v2';

var Opera = function() {
  Base.apply(this, arguments)
  BaseOpera.apply(this, arguments)
}

util.inherits(Opera, Base)

Opera.prototype.getCommand = function() {
  return Opera.path
}

Opera.version = '12.0'

Opera.find = function(cb) {
  if (Opera.path) {
    cb(Opera.path, Opera.version)
  }

  exec(qryPath, function (err, stdout) {
    var data = stdout.split('\r\n')
    var operaPath

    data.forEach(function(line) {
      if (/CommandLine/.test(line)) {
        var cmd = line.replace('Last CommandLine', '').replace('REG_SZ', '').replace(/"/g, '').trim()
        if (cmd) {
          operaPath = cmd;
        }
      }
    })

    if (operaPath) {
      Opera.path = operaPath
    }
    cb(operaPath, Opera.version)
  })
}

module.exports = Opera
