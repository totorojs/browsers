'use strict';

var spawn = require('child_process').spawn
var path = require('path')
var logger = require('../logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  open: function(capture, cb) {
    if (!capture) return
    if (this.process) {
      logger.warn('Repeated opening. Please run .close() to close the existent one first.')
      return
    }

    logger.info('Open', this.name, 'to visit', capture)
    this.capture = capture
    // this is only a placeholder to avoid immediate repeated opening
    // real assignment of this.process is asynchronous
    this.process = true

    var that = this
    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      that.process = spawn(cmd, opts)
      cb && cb()
    })
  },

  reopen: function() {

  },

  close: function(cb) {
    if (!this.process) return
    logger.info('Close', this.name)
    this.process.kill('SIGKILL')
    ;delete this.process
    cb && cb()
  },

  createProfile: function(cb) { cb() },

  deleteProfile: function(cb) { cb() },

  toString: function() { return this.name }
}

module.exports = base