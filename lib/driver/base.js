'use strict';

var spawn = require('child_process').spawn
var path = require('path')
var logger = require('../logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  open: function(capture) {
    if (!capture) return
    if (this.process) {
      logger.warn('Repeated opening. Please run .close() to close the existent one first.')
      return
    }

    logger.info('Open', this.name, 'to visit', capture)
    var that = this
    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      that.process = spawn(cmd, opts)
    })
  },

  reopen: function() {

  },

  close: function() {
    if (!this.process) return
    logger.info('Close', this.name)
    this.process.kill('SIGKILL')
    ;delete this.process
  },

  createProfile: function(cb) { cb() },

  deleteProfile: function(cb) { },

  toString: function() { return this.name }
}

module.exports = base