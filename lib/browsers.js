'use strict';

var fs = require('fs')
var async = require('async')
var path = require('path')
var _ = require('underscore')
var rimraf = require('rimraf')
var logger = require('totoro-log')

var Launcher = require('./launcher').Launcher
var BaseBrowser = require('./launchers/Base')
var Service = require('./service')

var defaultBrowsrs = ['Chrome', 'Firefox', 'Opera', 'Safari', 'IE']
var validBrowsers = (function() {
    return defaultBrowsrs.filter(function(name) {
        var Cls = require('./launchers/' + name)
        var bPath = Cls.prototype.DEFAULT_CMD[process.platform]
        return fs.existsSync(bPath)
    }).map(function(bName) {
        return bName.toLowerCase()
    })
}())

exports.run = function(options) {
    var browsers = options.browsers

    if (browsers) {
        browsers = browsers.split(',')
        browsers.forEach(function(bName) {
            bName = bName.toLowerCase()
            if (validBrowsers.indexOf(bName) < 0) {
                logger.error('The specified browser' + bName + 'not found')
            }
        })

        options.browsers = browsers
    } else {
        options.browsers = validBrowsers
    }

    var launcher = new Launcher(options)

    var q = async.queue(function(task, cb) {
        task(cb);
    }, 1)

    q.drain = function() {
        logger.info('browsers server start...')
        if (options.capture) {
            launcher.launch(options.browsers, options.capture)
        }

        /**
        setTimeout(function() {
            launcher.restart()
        }, 8000)

        setTimeout(function() {
            launcher.kill()
        }, 18000)
        **/

    }

    // clean temp dir
    q.push(function(cb) {
        var tempDir = path.dirname(BaseBrowser.tempDir)
        var baseName = path.basename(BaseBrowser.tempDir)
        fs.readdirSync(tempDir).forEach(function(filename) {
            var file = path.join(tempDir, filename);

            if (file.indexOf(baseName) > -1) {
                rimraf(file, function() {})
            }
            //listFiles(path.join(dir, filename), filter, files);
        });

        cb()
    })

    // 1. 加载 Node 本身管理服务(浏览器打开, 关闭，重启等)
    // 2. 加载管理服务, 监听相关注册信息
    q.push(function(cb) {
        Service.create(launcher, options, cb)
    })

    // 3. 探测系统浏览器信息
    q.push(function(cb) {
        require('./browsersInfo').run(launcher, options, cb)
    })

    // 4. 检查用户配置，如果无配置注册所有浏览器信息到 hub
    // 5. 监听 totoro-test
    q.push(function(cb) {
        require('./register').run(launcher, options, cb)
    })

    // launcher.launch(['Chrome', 'Firefox', 'Safari', 'Opera'], 'localhost:9000', 300000, 4);
    // browsers = launcher.launch(browsers, options);

    process.on('uncaughtException', function(err) {
        logger.error(err);
        logger.info(err.stack)
    })

    process.on('SIGINT', function() {
        logger.debug('Got SIGINT. ')
        launcher.kill();
        process.exit(0);
    })
}

