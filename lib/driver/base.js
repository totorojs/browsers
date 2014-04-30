'use strict';

var fork = require('child_process').fork
var path = require('path')
var treeKill = require('tree-kill')
var logger = require('../logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  init: function() {
    this.process = fork('./base-open', process.argv)
    logger.debug('Init', this.name, {process: this.process.pid})
  },

  open: function(capture) {
    if (!capture) return
    if (!this.process) this.init()

    logger.info('Open', this.name, {capture: capture})
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
    if (!this.process) return
    this.process.kill('SIGKILL')
    ;delete this.process
  },

  createProfile: function(cb) { cb() },

  deleteProfile: function(cb) { },

  toString: function() { return this.name }
}

module.exports = base