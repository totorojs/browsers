'use strict';

var events = require('events')
var util = require('util')
var log = require('./logger')
var _ = require('underscore')


var Launcher = function(options) {
    var browsers = this.browsers = []
    var BrowsersMapping = {}

    this.options = options
    var timeout = options.timeout

    this.launch = function(names, captureUrl) {
        var Cls, _browsers
        var that = this

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

        return browsers
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

    this.kill = function(browserName, callback) {

        if (_.isString(browserName)) {
            log.debug('Disconnecting ' + browserName)
            var isFind = find(browserName, function(browser) {
                browser.kill(callback)
            })

            if (!isFind) {
                log.error('Not found browser!')
                return
            }
            return
        }

        if (!callback) {
            callback = browserName || function() {}
        }


        log.debug('Disconnecting all browsers')

        var remaining = 0
        var finish = function() {
            remaining--
            if (!remaining && callback) {
                callback()
            }
        }

        if (!browsers.length) {
            return process.nextTick(callback)
        }

        var browser
        while(browser = browsers.pop()) {
            remaining++
            browser.kill(finish)
        }
    }

    // 重启指定的浏览器
    this.restart = function(browserName, callback) {
        var that = this
        if (!callback) {
            callback = browserName || function() {}
        }

        this.kill(browserName, function() {
            that.launch(browserName)
            callback()
        })
    }

    this.memoryWarn = function(browserName) {
        this.restart(browserName)
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
