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

    this.launch = function(names, captureUrl) {
        if (options.connected === false) return

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
            logger.info('Starting browser ' + browser.name + ' open ' + captureUrl)
            browser.start(captureUrl)
        })

        return _browsers
    }

    this.getBrowser = function(name) {
        if (BrowsersMapping[name]) {
            return BrowsersMapping[name]
        } else {
            var Cls = require('./launchers/' + name) || require('./launchers/Script')
            var browser = new Cls()
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

    var emptyFn = function() {}

    this._parseArgs = function(names, callback) {
        if (arguments.length === 0) {
           names = this.getDefaultBrowsersName()
           callback = emptyFn

        } else if (arguments.length === 1) {
            if (_.isFunction(names)) {
                callback = names
                names = this.getDefaultBrowsersName(null)
            } else {
                names = this.getDefaultBrowsersName(names)
                callback = emptyFn
            }
        } else if (arguments.length === 2) {
            names = this.getDefaultBrowsersName(names)
        }

        return [names, callback]
    }

    this.kill = function(names, callback) {
        var args = this._parseArgs.apply(this, arguments)
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
            callback()
        })
    }

    // 重启指定的浏览器
    this.restart = function(names, callback) {
        var args = this._parseArgs.apply(this, arguments)
        names = args[0]
        callback = args[1]

        logger.debug('restart browsers ' + names)

        this.kill(names, function() {
            that.launch(names)
            callback()
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

    this.getDefaultBrowsersName = function(browserName) {
        if (browserName) return browserName
        if (_.isString(options.browsers)) return options.browsers
        return _.keys(options.browsers)
    }


    this.findBrowserById = function(id) {
        var defaultBrowsers
        if (options.browsers) {
            defaultBrowsers = _.keys(options.browsers)
        } else {
            defaultBrowsers = _.keys(options.browsersMapping)
        }
        return browsers.filter(function(browser) {
            return browser.is(id) && defaultBrowsers.indexOf(browser.name.toLowerCase()) > -1
        }).map(function(browser) {
            return browser.name
        })

    }

    // register events
    this.on('exit', this.kill)
}


util.inherits(Launcher, events.EventEmitter)

// PUBLISH
exports.Launcher = Launcher
