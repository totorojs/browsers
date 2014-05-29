'use strict';

var fs = require('fs')
var shelljs = require('shelljs')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var path = require('path')
var logger = require('./logger')
var env = process.env

var FREE = 'free'
var OPENING = 'opening'
var CLOSING = 'closing'

var base = {
  tempDir: path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-'),
  stats: FREE,

  open: function(capture, cb) {
    if (!capture) {
      logger.warn('Param capture is required.')
      cb && cb()
      return
    }

    if (this.stats !== FREE) {
      logger.info(this.name, 'is', this.stats,', will ignore this operation.')
      cb && cb()
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
        logger.info('Finish close', that.name, '(0)')
      })


      that.stats = FREE
      logger.info('Finish open', that.name)
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
    var name = this.name

    if (this.stats !== FREE) {
      logger.info(name, 'is', this.stats,', will ignore this operation.')
      return
    }

    if (!this.process) {
      logger.info(name, 'is not opened, not need to close.')
      cb && cb()
      return
    }

    logger.debug('Start close', name)
    this.stats = CLOSING

    var that = this
    if (name === 'safari' && process.platform === 'darwin') {
      exec('osascript -e \'tell application "safari" to quit\'', function(err){
        if (err) throw err

        if (that.process) { that._close(cb) }
        else              { that._afterClose(cb, 2) }
      })

    } else if (process.platform === 'win32') {
      var params = ['/IM', (name === 'ie' ? 'iexplore' : name) + '.exe', '/F']
      var p = spawn('taskkill', params)
      p.on('close', function() {
        if (that.process) { that._close(cb) }
        else              { that._afterClose(cb, 2) }
      })
      /** 关闭 safari.exe 的时候基本会自动关闭 WebKit 这个进程.
      if (name === 'safari') {
        var params2 = ['/IM', 'WebKit2WebProcess.exe', '/F']
        var p2 = spawn('taskkill', params2)
      }
      **/

    } else {
      this._close(cb)
    }
  },

  _close: function(cb) {
    var that = this
    this.process.removeAllListeners('close')
    this.process.on('close', function() {
      that._afterClose(cb, 1)
    })
    this.process.kill('SIGKILL')
  },

  _afterClose: function(cb, code) {
    delete this.process
    this.stats = FREE
    logger.info('Finish close', this.name, '(' + code + ')')
    cb && cb(true)
  },

  createProfile: function(cb) { cb && cb() },

  toString: function() { return this.name }
}

module.exports = base
