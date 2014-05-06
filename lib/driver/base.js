'use strict';

var spawn = require('child_process').spawn
var path = require('path')
var logger = require('../logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  open: function(capture, cb) {
    if (!capture) {
      logger.warn('Param capture is required.')
      return
    }
    if (this.opening || this.process) {
      logger.warn('Repeated opening, please run .close() to close the existent one first.')
      return
    }
    if (this.closing) {
      logger.warn('Browser is closing, please wait a moment and retry.')
      return
    }

    logger.info('Open', this.name, 'to visit', capture)
    this.opening = true
    this.capture = capture

    var that = this
    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      that.process = spawn(cmd, opts)
      that.opening = false
      cb && cb()

    })
  },

  reopen: function(capture, cb) {
    capture = capture || this.capture
    var that = this
    this.close(function() {
      that.open(capture, cb)
    })
  },

  close: function(cb) {
    if (this.opening) {
      logger.warn('Browser is opening, please wait a moment and retry.')
      return
    }
    if (!this.process) return
    if (this.closing) {
      logger.warn('Repeated closing, will be ignored.')
    }

    logger.info('Close', this.name)
    var that = this
    this.closing = true
    this.process.kill('SIGKILL')
    ;delete this.process
    setTimeout(function() {
      that.closing = false
      cb && cb()
    }, 3000)
  },

  createProfile: function(cb) { cb() },

  deleteProfile: function(cb) { cb() },

  toString: function() { return this.name }
}

module.exports = base