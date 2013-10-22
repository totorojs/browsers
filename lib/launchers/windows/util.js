'use strict';

var util = require('util')
var fs = require('fs')
var exec = require('child_process').exec
var path = require('path')
var plist = require('plist');

exports.find = function(id, callback) {
  var pathQuery = 'mdfind "kMDItemCFBundleIdentifier=="' + id + '""'

  exec(pathQuery, function (err, stdout) {
    var loc = stdout.trim()
    if (loc === '') {
      loc = null
      err = 'not installed'
    }
    callback(err, loc)
  })
}

exports.parseVersionByPlist = function(plPath, key, cb) {
  if (!fs.existsSync(plPath)) {
    cb(null)
  } else {

    var data = plist.parseFileSync(plPath)
    cb(data[key])
  }
}

exports.inherits = util.inherits
