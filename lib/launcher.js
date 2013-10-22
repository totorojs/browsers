'use strict';

var events = require('events')
var util = require('util')
var logger = require('totoro-common').logger
var async = require('async')
var helper = require('./helper')
var BaseBrowser = require('./launchers/')

var Launcher = function(opts) {
    var that = this
    this.maxMemory = opts.maxMemory
    function emptyFn() {}

    BaseBrowser.find(function(validBrowsers) {
        that.browsers = findBrowsers(validBrowsers, opts.browsers)
        that.launch(opts.capture)
    })

    this.kill = function() {
        var that = this
        parseArgs(arguments, function(names, cb) {
            async.forEach(Object.keys(that.browsers), function(browserName, cb) {
                // 如果用户指定浏览器, 需要去匹配.
                if (names && names.length > 0 && names.indexOf(browserName) < 0) {
                    cb()
                    return
                }
                var browser = that.browsers[browserName]
                logger.debug('Disconnecting ' + browserName)
                browser.kill(cb)
            }, function() {
                cb && cb()
            })
        })
    }

    // 重启指定的浏览器
    this.restart = function() {
        parseArgs(arguments, function(names, cb) {
            logger.debug('restart browsers ' + names)

            this.kill(names, function() {
                that.launch(names)
                cb && cb()
            })
        })
    }

    function parseArgs(args, callback) {
        var cb, names = []
        if (args.length === 1 && isFunction(args[0])) {
            cb = args[0]
        } else {
            names = args[0]
            cb = args[1] || emptyFn
        }
        callback(names, cb)
    }
    
    // register events
    this.on('exit', this.kill)
}


util.inherits(Launcher, events.EventEmitter)

Launcher.prototype.launch = function(captureUrl) {
    var that = this
    Object.keys(this.browsers).forEach(function(browserName) {
        var browser = that.browsers[browserName]
        logger.info('Starting browser ' + browser.name + ' open ' + captureUrl)
        browser.instance = new (browser.Cons)()
        console.info('----->', browser.instance)
        browser.instance.start(captureUrl)
    })
}

Launcher.prototype.findBrowserById = function(id) {
    this.browsers.filter(function(browser) {
        return browser.is(id)
    }).map(function(b) {
        return b.name
    })
}


Launcher.prototype.checkMemory= function(browserName, m) {
    m = parseInt(m, 10)

    if (m > maxMemory) {
        logger.warn('The browser ' + browserName + ' memory use too much ' + m + 'M')
        if (this.memoryRestartTimeout) return

        this.memoryRestartTimeout = setTimeout(function() {
            that.restart(browserName)
            this.memoryRestartTimeout = null
        }, 10000)
    }
}


function isFunction(obj) {
    return typeof obj === 'function'
}

function findBrowsers(validBrowsers, expectBrowsers) {
    //TODO filter expect browsers
    return {
        'chrome': validBrowsers['chrome'],
        'safari': validBrowsers['safari']
    }
    //return validBrowsers
}

// PUBLISH
exports.Launcher = Launcher
