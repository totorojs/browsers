'use strict';

var path = require('path')
var exec = require('child_process').exec
var Base = require('./')
var BaseIE = require('../ie')
var util = require('./util')

var qry = 'reg query "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Internet Explorer" /v Version';
var iePath = '%ProgramFiles%\\Internet Explorer\\iexplore.exe';

var IE = function() {
  Base.apply(this, arguments)
  BaseIE.apply(this, arguments)
}

util.inherits(IE, Base)

IE.prototype.getCommand = function() {
  return IE.path
}


IE.find = function(cb) {
  if (IE.path) {
    cb(IE.path, IE.version)
  }

  exec(qry, function (err, stdout) {
    var data = stdout.split(' ')
    IE.version = data[data.length - 1].replace('Version', '').replace('REG_SZ', '').replace(/\t/g, '').replace(/\r\n/g, '').trim();

    exec('echo ' + iePath, function(err, stdout) {
      IE.path = stdout.replace(/"/g, '').trim()
      cb(IE.path, IE.version)
    })
  })
}
