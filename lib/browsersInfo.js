'use strict';

var _ = require('underscore')
var browsers = require('./browsers')

// 获取系统浏览器详细信息
exports.run = function(launcher, options, cb) {
    // 浏览器版本映射

    var validBrowsers = browsers.listValidBrowsers()
    var browsersMapping = options.browsersMapping

    var captureUrl = 'http://127.0.0.1:' + options.port + '/version'

    launcher.launch(validBrowsers, captureUrl)

    var fetch = setInterval(function() {
        if (_.keys(browsersMapping).length === validBrowsers.length) {
            clearInterval(fetch)
            clearTimeout(error)
            completeBrowsersInfo(options)

            launcher.kill(validBrowsers, function() {
                cb()
            })
        }
    }, 1000)

    var error = setTimeout(function() {
        console.error('browsers info service error!')
        process.exit(1)
    }, 120 * 1000)

    function completeBrowsersInfo(options) {

        var browsers = _.clone(browsersMapping)
        var _browsers = options.browsers

        if (_.isString(_browsers)) {
            _browsers = _browsers.split(',')
        }

        _browsers = (_browsers || []).map(function(b) {
            return b.toLowerCase()
        })

        if (_browsers.length > 0) {
            _.keys(browsers).forEach(function(name) {
                if (_browsers.indexOf(name) < 0) {
                    delete browsers[name]
                }
            })
        }
        options.browsers = browsers
    }
}

