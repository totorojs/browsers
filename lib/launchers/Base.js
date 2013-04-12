'use strict';

var util = require('util');
var events = require('events');
var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var log = require('../logger');
var env = process.env;

var BEING_CAPTURED = 1;
var CAPTURED = 2;
var BEING_KILLED = 3;
var FINISHED = 4;
var BEING_TIMEOUTED = 5;


var BaseBrowser = function(id, captureTimeout, retryLimit) {
  var self = this;
  var capturingUrl;
  var exitCallback = function() {};

  this.id = id;
  this.state = null;
  this._tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-' +
      id.toString());


  this.start = function(url) {
    capturingUrl = url;

    try {
      log.debug('Creating temp dir at ' + self._tempDir);
      fs.mkdirSync(self._tempDir);
    } catch (e) {}

    self._start(capturingUrl + '?id=' + self.id);
    self.state = BEING_CAPTURED;

    // 临时解决方案，应该是 capture 的服务进行通知.
    setTimeout(function() {
      self.markCaptured();
    }, 2000);

    if (captureTimeout) {
      setTimeout(self._onTimeout, captureTimeout);
    }
  };


  this._start = function(url) {
    self._execCommand(self._getCommand(), self._getOptions(url));
  };


  this.markCaptured = function() {
    self.state = CAPTURED;
  };


  this.isCaptured = function() {
    return self.state === CAPTURED;
  };


  this.kill = function(callback) {
    exitCallback = callback || function() {};

    log.debug('Killing ' + self.name);
    if (self.state !== FINISHED) {
      self.state = BEING_KILLED;
      self._process.kill();
      if (!self._process.killed) {
        self._kill && self._kill(self._process.pid);
      }
    } else {
      process.nextTick(exitCallback);
    }
  };


  this._onTimeout = function() {
    if (self.state !== BEING_CAPTURED) {
      return;
    }

    log.warn(self.name + ' have not captured in ' + captureTimeout + ' ms, killing.');

    self.state = BEING_TIMEOUTED;
    self._process.kill();
  };


  this.toString = function() {
    return self.name;
  };


  this._getCommand = function() {
    var cmd = path.normalize(env[self.ENV_CMD] || self.DEFAULT_CMD[process.platform]);

    if (!cmd) {
      console.error('No binary for %s browser on your platform.\n\t' +
          'Please, set "%s" env variable.', self.name, self.ENV_CMD);
    }

    return cmd;
  };


  this._execCommand = function(cmd, args) {
    log.debug(cmd + ' ' + args.join(' '));
    self._process = spawn(cmd, args);

    var errorOutput = '';
    self._process.stderr.on('data', function(data) {
      errorOutput += data.toString();
    });

    self._process.on('close', function(code) {
      self._onProcessExit(code, errorOutput);
    });
  };


  this._onProcessExit = function(code, errorOutput) {
    console.log('Process %s exitted with code %d', self.name, code);

    if (code) {
      console.error('Cannot start %s\n\t%s', self.name, errorOutput);
    }

    /**

    // 因为在 win7 下面的 ie8,ie9 打开浏览器后，直接正常推出进程，所以如果继续进行
    // retryLimit 的判断，将额外的打开浏览器.
    retryLimit--;

    if (self.state === BEING_CAPTURED || self.state === BEING_TIMEOUTED) {
      if (retryLimit > 0) {
        return self._cleanUpTmp(function() {
          console.info('Trying to start %s again.', self.name);
          self.start(capturingUrl);
        });
      } else {
        self.emit('browser_process_failure', self);
      }
    }
    **/

    self.state = BEING_KILLED;
    self._cleanUpTmp(exitCallback);
  };


  this._cleanUpTmp = function(done) {
    console.log('Cleaning temp dir %s', self._tempDir);
    rimraf(self._tempDir, done);
  };


  this._getOptions = function(url) {
    return [url];
  };

  this.getMemory = function(cb) {
    var bReg = new RegExp(this.name + '|' + this.alias, 'i');
    if (process.platform === 'win32') {
      getBrowserProcessInfo('tasklist', [], bReg, function(infos) {
        infos.shift();

        var memory = infos.reduce(function(m, info) {
          info = info.split(/\s+/);
          return parseInt(info[info.length - 3].replace(/,/g, ''), 10) + m;
        }, 0);

        cb(Math.round(memory/1024) + 'M');
      });

    } else {
      getBrowserProcessInfo('ps', ['axu'], bReg, function(infos) {
        // 开始找到内存的位置
        var head = infos.shift();
        var rssIndex = 0;
        head.split(/\s+/).some(function(t) {
          rssIndex++;
          return t === 'RSS';
        });

        // 默认就是第5这个位置
        rssIndex = rssIndex || 5;

        var memory = infos.reduce(function(m, info) {
            return parseInt(info.split(/\s+/)[5], 10) + m;
        }, 0);
        cb(Math.round(memory/1024)+ 'M');
      });
    }
  };

  function getBrowserProcessInfo(cmd, arg, bReg, cb) {
    var datas = [];
    var p = spawn(cmd, arg);
    p.stdout.on('data', function(data) {
      datas.push(data);
    });

    p.on('close', function() {
      datas = datas.join('').split('\n');
      var infos = datas.filter(function(info) {
        return bReg.test(info);
      });

      infos.unshift(datas[0]);
      cb(infos);
    });
  }

  if (process.platform === 'win32') {
     // 强制退出
    this._kill = function(pid) {
        spawn('taskkill', ['/pid', pid])
    }
  }
};

util.inherits(BaseBrowser, events.EventEmitter);

// PUBLISH
module.exports = BaseBrowser;
