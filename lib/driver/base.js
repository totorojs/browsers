'use strict';

var spawn = require('child_process').spawn
var exec = require('child_process').exec
var path = require('path')
var logger = require('../logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  open: function(capture) {
    logger.info('Open', this.name)

    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      var proc = spawn(cmd, opts)
      var errMsg = ''

      proc.stderr.on('data', function(data) {
        errMsg += data.toString()
      })

      proc.on('close', function(code) {
        if (code) {
          logger.warn('Cannot start %s\n  %s', that.name, errorMsg)
        }
      })
    })
  },

  reopen: function() {

  },

  close: function() {

  },

  createProfile: function(cb) { cb() },

  deleteProfile: function(cb) { },

  toString: function() { return this.name }
}

module.exports = base