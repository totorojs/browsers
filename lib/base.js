'use strict';

var fs = require('fs')
var shelljs = require('shelljs')
var spawn = require('child_process').spawn
var path = require('path')
var logger = require('./logger')
var env = process.env

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),

  open: function(capture, cb) {
    if (!capture) {
      logger.warn('Param capture is required.')
      cb && cb()
      return
    }
    if (this.process) {
      logger.warn(this.name, 'is opened, you chould run reopen().')
      cb && cb()
      return
    }
    if (this.opening || this.closing) {
      var stats = this.opening ? 'opening' : 'closing'
      logger.warn(this.name, 'is ', stats, ', please wait a moment and retry.')
      cb && cb()
      return
    }

    logger.debug('Open', this.name)
    this.opening = true
    this.capture = capture

    var that = this
    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      that.process = spawn(cmd, opts)
      that.opening = false
      cb && cb(true)
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
    if (!this.process) {
      cb && cb()
      return
    }
    if (this.opening) {
      logger.warn(this.name, 'is opening, please wait a moment and retry.')
      cb && cb()
      return
    }
    if (this.closing) {
      logger.warn(this.name, 'is closing, will ignore repeated operation.')
      cb && cb()
      return
    }

    logger.debug('Close', this.name)
    var that = this
    this.closing = true

    this.process.on('close', function(){
      logger.debug(that.name, 'closed')
      delete that.process
      that.closing = false
      cb && cb(true)
    })

    this.process.kill('SIGKILL')

    /*
    if (process.platform === 'win32') {
      var params = ['/IM', (this.name === 'ie' ? 'iexplore' : this.name) + '.exe', '/F']
      var p = spawn('taskkill', params)

      p.on('close', function() {
        if (that.name === 'safari') {
          var params2 = ['/IM', 'WebKit2WebProcess.exe', '/F']
          var p2 = spawn('taskkill', params2)
          p2.on('close', function() {
            afterClose(that, cb)
          })
        } else {
          afterClose(that, cb)
        }
      })
    } else {
      this.process.kill('SIGKILL')
      afterClose(that, cb)
    }
    */
  },

  createProfile: function(cb) { cb && cb() },

  toString: function() { return this.name }
}

module.exports = base


function afterClose(that, cb) {
  delete that.process
  that.closing = false
  cb && cb(true)
}
