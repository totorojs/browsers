'use strict';

var http = require('http')
var logger = require('totoro-common').logger

exports.run = function(launcher) {
  var running = true
  var defaultBrowsers = Object.keys(launcher.browsers)
  var capture = launcher.capture

  var checkCapture = function() {
      logger.debug('capture check ......' + capture)
      http.get(capture, function(res) {
          logger.debug('captureTotoro STATUS: ' + res.statusCode);
          if (res.statusCode > 199 && res.statusCode < 400) {
              if (!running) {
                  launcher.start(defaultBrowsers, capture)
                  running = true
              }
          }
      }).on('error', function(e) {
          if (running) {
              launcher.kill(defaultBrowsers, function() {
                  running = false
              })
          }
      })
  }

  checkCapture()

  setInterval(checkCapture, 10 * 1000)
}
