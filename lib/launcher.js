'use strict';

var events = require('events')
var util = require('util')
var logger = require('totoro-log')
var _ = require('underscore')
var async = require('async')


var Launcher = function(options) {
    var browsers = this.browsers = []
    var BrowsersMapping = {}

    this.options = options
    var maxMemory = options.maxMemory
    var that = this
    function emptyFn() {}

    this.launch = function(names, captureUrl) {
        if (options.connected === false) return

        var _browsers = getBrowsers(names) || browsers
        _browsers.forEach(function(browser) {
            logger.info('Starting browser ' + browser.name + ' open ' + captureUrl)
            browser.start(captureUrl)
        })

        return _browsers
    }

    // 获取用户指定的浏览器实例
    function getBrowsers(names) {
        if (!(_.isArray(names) || _.isString(names))) {
            return null
        }

        if (_.isString(names)) {
            names = [names]
        }

        return names.map(function(name) {
            name = name.toLowerCase()

            if (BrowsersMapping[name]) {
                return BrowsersMapping[name]
            }

            var Cls = require('./launchers/' + name) || require('./launchers/Script')
            var browser = new Cls()
            browsers.push(browser)

            return BrowsersMapping[name] = browser
        })
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


    function _parseArgs(names, callback) {
        var defaultBrowsers = options.browsers

        if (arguments.length === 1 && _.isFunction(names)) {
            callback = names
            names = defaultBrowsers
        } else {
            names = names || defaultBrowsers
            callback = callback || emptyFn
        }

        return [names, callback]
    }

    this.kill = function(names, callback) {
        var args = _parseArgs.apply(this, arguments)
        names = args[0]
        callback = args[1]

        var _browsers = []

        find(names, function(browser) {
            _browsers.push(browser)
        })

        async.forEach(_browsers, function(browser, cb) {
            logger.debug('Disconnecting ' + browser.name)
            browser.kill(cb)
        }, function() {
            callback && callback()
        })
    }

    // 重启指定的浏览器
    this.restart = function(names, callback) {
        var args = _parseArgs.apply(this, arguments)
        names = args[0]
        callback = args[1]

        logger.debug('restart browsers ' + names)

        this.kill(names, function() {
            that.launch(names)
            callback && callback()
        })
    }

    var memoryRestartTimeout = null

    this.checkMemory= function(browserName, m) {
        m = parseInt(m, 10)

        if (m > maxMemory) {
            logger.warn('The browser ' + browserName + ' memory use too much ' + m + 'M')
            if (memoryRestartTimeout) return

            memoryRestartTimeout = setTimeout(function() {
                that.restart(browserName)
                memoryRestartTimeout = null
            }, 10000)
        }
    }

    this.findBrowserById = function(id) {
        return (options.browsers).filter(function(browser) {
            return browser.is(id)
        })
    }

    // register events
    this.on('exit', this.kill)
}


util.inherits(Launcher, events.EventEmitter)

// PUBLISH
exports.Launcher = Launcher
