'use strict';

var events = require('events')
var util = require('util')
var log = require('./logger')
var _ = require('underscore')
var async = require('async')


var Launcher = function(options) {
    var browsers = this.browsers = []
    var BrowsersMapping = {}

    this.options = options
    var timeout = options.timeout
    var maxMemory = options.maxMemory
    var that = this

    this.launch = function(names, captureUrl) {
        var Cls, _browsers

        if (_.isString(names)) {
            names = [names]
        }

        if (names) {
            _browsers = names.map(function(name) {
                name = name.toLowerCase()
                return that.getBrowser(name)
            })
        } else {
            _browsers = browsers
        }

        _browsers.forEach(function(browser) {
            log.info('Starting browser ' + browser.name)
            browser.start(captureUrl)
        })

        return _browsers
    }

    this.getBrowser = function(name) {
        if (BrowsersMapping[name]) {
            return BrowsersMapping[name]
        } else {
            var Cls = require('./launchers/' + name) || require('./launchers/Script')
            var browser = new Cls(Launcher.generateId(), timeout)
            browsers.push(browser)
            return BrowsersMapping[name] = browser
        }
    }


    function find(browserName, callback) {
        var isFind = false
        browsers.forEach(function(browser) {
            if (browser.is(browserName)) {
                isFind = true
                callback(browser)
            }
        })
        return isFind
    }

    this.kill = function(names, callback) {

        if (_.isString(names)) {
            names = [names]
        }

        if (!callback) {
            callback = names || function() {}
            names = null
        }
        names = this.getDefaultBrowsersName(names)

        var _browsers = []

        find(names, function(browser) {
            _browsers.push(browser)
        })

        async.forEach(_browsers, function(browser, cb) {
            log.debug('Disconnecting ' + browser.name)
            browser.kill(cb)
        }, function() {
            callback()
        })
    }

    // 重启指定的浏览器
    this.restart = function(browserName, callback) {
        if (!callback) {
            callback = browserName || function() {}
        }
        browserName = this.getDefaultBrowsersName(browserName)

        log.debug('restart browsers ' + browserName)

        this.kill(browserName, function() {
            that.launch(browserName)
            callback()
        })
    }

    var memoryRestartTimeout = null

    this.memoryWarn = function(browserName, m) {
        m = parseInt(m, 10)

        if (m > maxMemory) {
            log.warn('The browser ' + browserName + ' memory use too much ' + m + 'M')
            if (memoryRestartTimeout) return
            memoryRestartTimeout = setTimeout(function() {
                that.restart()
                memoryRestartTimeout = null
            }, 10000)
        }
    }

    this.getDefaultBrowsersName = function(browserName) {
        if (browserName) return browserName
        if (_.isString(options.browsers)) return options.browsers
        return _.keys(options.browsers)
    }

    // register events
    this.on('exit', this.kill)
}

Launcher.generateId = function() {
    return Math.floor(Math.random() * 100000000)
}

util.inherits(Launcher, events.EventEmitter)

// PUBLISH
exports.Launcher = Launcher
