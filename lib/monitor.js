'use strict';

var logger = require('totoro-log')

exports.run = function(launcher, options, cb) {

    var checkInterval
    var browserStatus = {}
    var notRespondings = {}
    var browsersInstance = launcher.getBrowsers(options.browsers)

     // begin check browsers status
    var checkBrowsersStatus = function() {
        var allIds = []
        browsersInstance.forEach(function(ins) {
            allIds = allIds.concat(Object.keys(ins.processList))
        })

        if (allIds.length === 0) {
            clearInterval(checkInterval)
            checkInterval = null
        }

        allIds.forEach(function(id) {
            if (!browserStatus[id]) {
                if (notRespondings[id]) {
                    notRespondings[id]++
                } else {
                    notRespondings[id] = 1
                }
            }

            browserStatus[id] = false
            if (notRespondings[id] > 5) {
                launcher.restart(launcher.findBrowserById(id))
            }
        })

        Object.keys(notRespondings).forEach(function(id) {
            if (allIds.indexOf(id) < 0) {
                delete notRespondings[id]
            }
        })

        Object.keys(browserStatus).forEach(function(id) {
            if (allIds.indexOf(id) < 0) {
                delete browserStatus[id]
            }
        })

        //console.info('allIds---->', allIds)
        //console.info('notRespondings---->', notRespondings)
        //console.info('browserStatus--2-->', browserStatus)
    }

    options.io.of('/status').on('connection', function(socket) {

        if (!checkInterval) {
            checkInterval = setInterval(checkBrowsersStatus, 60 * 1000)
        }

        socket.on('running', function(id) {
            browserStatus[id] = true
        })
    })
    cb()
}