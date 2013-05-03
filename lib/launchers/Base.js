'use strict';

var util = require('util')
var events = require('events')
var spawn = require('child_process').spawn
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var async = require('async')
var _ = require('underscore')
var logger = require('totoro-log')

var env = process.env

var tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/totorojs-')

var BaseBrowser = function() {
    var that = this
    var capturingUrl

    // record sub process
    var processList = {}


    this._tempDir = tempDir


    this.start = function(url) {
        if (url) {
            capturingUrl = url
        } else {
            url = capturingUrl
        }

        var subId = BaseBrowser.generateId()

        try {
            logger.debug('Creating temp dir at ' + this._tempDir + subId)
            fs.mkdirSync(this._tempDir + subId)
        } catch (e) {}

        this._start(subId, url + '?id=' + subId)
    }


    this.is = function(browserName) {
        if (/^\d+$/.test(browserName)) {
            return _.keys(processList).indexOf(browserName)
        }

        var reg = new RegExp(this.name, 'i')

        if (_.isString(browserName)) {
            browserName = [browserName]
        }

        return browserName.some(function(name) {
            return name === '*' || reg.test(name)
        })
    }


    this._start = function(id, url) {
        this._execCommand(id, this._getCommand(), this._getOptions(id, url))
    }


    this.kill = function(callback) {
        var that = this
        logger.debug('Killing ' + this.name)

        async.forEach(_.keys(processList), function(subId, cb) {
            var _process = processList[subId]
            if (!_process) {
                cb()
                return
            }

            _process.kill()

            if (!_process.killed) {
                that._kill(cb)
            } else {
                cb()
            }

            processList[subId] = null
        }, function() {
            setTimeout(function() {
                callback()
            }, 1000)
        })
}


    this.toString = function() {
        return this.name
    }


    this._getCommand = function() {
        var cmd = path.normalize(env[this.ENV_CMD] || this.DEFAULT_CMD[process.platform])

        if (!cmd) {
            logger.error('No binary for %s browser on your platform.\n\t' +
              'Please, set "%s" env variable.', this.name, this.ENV_CMD)
        }

        return cmd
    }


    this._execCommand = function(id, cmd, args) {
        var that = this
        logger.debug(cmd + ' ' + args.join(' '))
        var _process = spawn(cmd, args)

        var errorOutput = ''
        _process.stderr.on('data', function(data) {
            errorOutput += data.toString()
        })

        _process.on('close', function(code) {
            that._onProcessExit(code, errorOutput)
        })
        processList[id] = _process
    }


    this._onProcessExit = function(code, errorOutput) {
        logger.debug('Process %s exitted with code %d', this.name, code)
        if (code) {
            logger.error('Cannot start %s\n\t%s', this.name, errorOutput)
        }
    }

    process.on('exit', function() {
        _.keys(processList).forEach(function(id) {
            logger.debug('Cleaning temp dir %s', that._tempDir + id)
            rimraf(that._tempDir + id, function() {

            })
        })
    })


    this._getOptions = function(id, url) {
        return [url]
    }


    this.getMemory = function(cb) {
        var bReg = new RegExp(this.name + '|' + this.alias, 'i')
        if (process.platform === 'win32') {
            getBrowserProcessInfo('tasklist', [], bReg, function(infos) {
                infos.shift()

                var memory = infos.reduce(function(m, info) {
                    info = info.split(/\s+/)
                    return parseInt(info[info.length - 3].replace(/,/g, ''), 10) + m
                }, 0)

                cb(Math.round(memory/1024) + 'M')
            })

        } else {
            getBrowserProcessInfo('ps', ['axu'], bReg, function(infos) {
                // 开始找到内存的位置
                var head = infos.shift()
                var rssIndex = 0
                head.split(/\s+/).some(function(t) {
                    rssIndex++
                    return t === 'RSS'
                })

                // 默认就是第5这个位置
                rssIndex = rssIndex || 5

                var memory = infos.reduce(function(m, info) {
                    return parseInt(info.split(/\s+/)[5], 10) + m
                }, 0)
                cb(Math.round(memory/1024)+ 'M')
            })
        }
    }


    function getBrowserProcessInfo(cmd, arg, bReg, cb) {
        var datas = []
        var p = spawn(cmd, arg)
        p.stdout.on('data', function(data) {
            datas.push(data)
        })

        p.on('close', function() {
            datas = datas.join('').split('\n')
            var infos = datas.filter(function(info) {
                return bReg.test(info)
            })

            infos.unshift(datas[0])
            cb(infos)
        })
    }


    if (process.platform === 'win32') {
        //只有在 win 下面才会用到强制退出
        this._kill = function(cb) {
            var params = ['/IM', (this.alias || this.name).toLowerCase() + '.exe', '/F']
            var p = spawn('taskkill', params)

            p.on('close', function() {
                cb()
            })
        }
    } else {
        this._kill = function() {
            logger.error('error exit process!')
        }
    }
}


BaseBrowser.generateId = function() {
    return Math.floor(Math.random() * 100000000)
}

BaseBrowser.tempDir = tempDir

util.inherits(BaseBrowser, events.EventEmitter)

// PUBLISH
module.exports = BaseBrowser
