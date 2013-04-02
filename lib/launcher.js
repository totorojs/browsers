var events = require('events');
var util = require('util');
var log = require('./logger');
var _ = require('underscore');

var Launcher = function() {
  var browsers = this.browsers = [];

  this.launch = function(names, options) {
    var Cls, browser;
    var captureUrl = options.capture;
    var timeout = options.timeout;
    var retryLimit = options.retry;

    if (_.isString(names)) {
      names = [names];
    }

    names.forEach(function(name) {
      Cls = require('./launchers/' + name) || require('./launchers/Script');
      // TODO  throw other exceptions (dep not provided, etc.)
      browser = new Cls(Launcher.generateId(), timeout, retryLimit);

      log.info('Starting browser ' + browser.name);
      browser.start(captureUrl);
      browsers.push(browser);
    });

    return browsers;
  };

  this.kill = function(callback) {
    log.debug('Disconnecting all browsers');

    var remaining = 0;
    var finish = function() {
      remaining--;
      if (!remaining && callback) {
        callback();
      }
    };

    if (!browsers.length) {
      return process.nextTick(callback);
    }

    browsers.forEach(function(browser) {
      remaining++;
      browser.kill(finish);
    });
  };


  this.areAllCaptured = function() {
    return !browsers.some(function(browser) {
      return !browser.isCaptured();
    });
  };


  this.markCaptured = function(id) {
    browsers.forEach(function(browser) {
      if (browser.id === id) {
        browser.markCaptured();
      }
    });
  };

  // register events
  this.on('exit', this.kill);
};


Launcher.generateId = function() {
  return Math.floor(Math.random() * 100000000);
};

util.inherits(Launcher, events.EventEmitter);


// PUBLISH
exports.Launcher = Launcher;
