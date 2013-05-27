'use strict';

var http = require('http')
var logger = require('totoro-common').logger

exports.run = function(launcher, opts, cb) {
    var running = false
    var checkCapture = function() {
        logger.debug('capture check ......' + opts.capture)
        http.get(opts.capture, function(res) {
            logger.debug('captureTotoro STATUS: ' + res.statusCode);
            if (res.statusCode > 199 && res.statusCode < 400) {
                if (!running) {
                    launcher.launch(null, opts.capture)
                    running = true
                }
            }
        }).on('error', function(e) {
            if (running) {
                launcher.kill(function() {
                    running = false
                })
            }
        })
    }

    checkCapture()

    setInterval(checkCapture, 10 * 1000)
    cb()
}
