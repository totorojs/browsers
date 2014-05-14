'use strict';

var fs = require('fs')
var shelljs = require('shelljs')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var path = require('path')
var logger = require('./logger')
var env = process.env

var FREE = 0
var OPENING = 1
var CLOSING = 2

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),
  stats: FREE,

  open: function(capture, cb) {
    if (!capture) {
      logger.warn('Param capture is required.')
      cb && cb()
      return
    }

    if (this.stats === OPENING) {
      logger.info(this.name, 'is opening, will ignore repeated operation.')
      cb && cb()
      return
    }

    if (this.stats === CLOSING) {
      logger.info(this.name, 'is closing, will open browser after it closed.')
      this.blockedOpen = { capture: capture, cb: cb }
      return
    }

    if (this.process) {
      logger.info(this.name, 'is opened, you should run reopen().')
      cb && cb()
      return
    }

    logger.debug('Start open', this.name)
    this.stats = OPENING
    this.capture = capture

    var that = this
    var cmd = this.getCommand()
    var opts = this.getOptions(capture)

    this.createProfile(function() {
      that.process = spawn(cmd, opts)

      that.process.on('close', function() {
        delete that.process
        logger.debug('Finish close', that.name, '(0)')
      })


      that.stats = FREE
      logger.debug('Finish open', that.name)
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
    if (this.stats === OPENING) {
      logger.info(this.name, 'is opening, will close browser after it opened.')
      this.blockedOpen = { cb: cb }
      return
    }

    if (this.info === CLOSING) {
      logger.warn(this.name, 'is closing, will ignore repeated operation.')
      cb && cb()
      return
    }

    if (!this.process) {
      logger.info(this.name, 'is not opened, not need to close.')
      cb && cb()
      return
    }

    logger.debug('Start close', this.name)
    this.stats = CLOSING

    var that = this
    if (this.name === 'safari' && process.platform === 'darwin') {
      exec('osascript -e \'tell application "safari" to quit\'', function(err){
        if (err) throw err

        if (that.process) {
          that._close(cb)

        } else {
          that.stats = FREE
          logger.debug('Finish close', that.name, '(2)')
          cb && cb(true)
        }
      })

    } else {
      this._close(cb)
    }
  },

  _close: function(cb) {
    var that = this

    this.process.on('close', function() {
      delete that.process
      that.stats = FREE
      logger.debug('Finish close', that.name, '(1)')
      cb && cb(true)
    })

    this.process.kill('SIGKILL')
  },

  createProfile: function(cb) { cb && cb() },

  toString: function() { return this.name }
}

module.exports = base





