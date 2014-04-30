'use strict';

var fork = require('child_process').fork
var path = require('path')
var logger = require('../logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  init: function() {
    this.process = fork('./base-open', process.argv)
    logger.debug(this.name, 'init (pid:', this.process.pid, ')')
    this.init = function() {}
  },

  open: function(capture) {
    if (!capture) return
    this.init()

    logger.info(this.name, 'open', capture)
    var that = this
    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      that.process.send({
        name: that.name,
        action:'open',
        cmd: cmd,
        opts: opts
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