'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')

var common = require('./common')

var qry = 'reg query "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Internet Explorer" /v Version';
var iePath = '%ProgramFiles%\\Internet Explorer\\iexplore.exe';

var browserPath
var browserVersion

var ie = {
  getCommand: function() {
    return browserPath
  },

  isExist: function(cb) {
    if (browserPath) {
      cb(true)
      return
    }

    exec(qry, function (err, stdout) {
      var data = stdout.split(' ')
      browserVersion = data[data.length - 1].replace('Version', '').replace('REG_SZ', '').replace(/\t/g, '').replace(/\r\n/g, '').trim();

      exec('echo ' + iePath, function(err, stdout) {
        browserPath = stdout.replace(/"/g, '').trim()
        cb(true)
      })
    })
  }
}

utilx.mix(ie, require('../ie'))

module.exports = ie


