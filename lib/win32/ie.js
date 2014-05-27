'use strict';

var exec = require('child_process').exec
var utilx = require('utilx')

var common = require('./common')

var qry = 'reg query "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Internet Explorer" /v Version';
var iePath = '%ProgramFiles%\\Internet Explorer\\iexplore.exe';


var ie = {
  getCommand: function() {
    return this.path
  },

  isExist: function(cb) {
    var that = this

    if (this.path) {
      cb(true)
      return
    }

    exec(qry, function (err, stdout) {
      var data = stdout.split(' ')
      that.version = data[data.length - 1].replace('Version', '').replace('REG_SZ', '').replace(/\t/g, '').replace(/\r\n/g, '').trim();
      if (/^9\.1\d/.test(that.version)) {
        that.version = that.version.replace(/^9\.(\d+)/, '$1.0');
      }
      exec('echo ' + iePath, function(err, stdout) {
        that.path = stdout.replace(/"/g, '').trim()
        cb(true)
      })
    })
  }
}

utilx.mix(ie, require('../ie'))

module.exports = ie


