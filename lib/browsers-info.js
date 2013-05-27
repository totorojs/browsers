'use strict';

var logger = require('totoro-log')

// 获取系统浏览器详细信息
exports.run = function(launcher, opts, cb) {
    var browsers = opts.browsers
    // 浏览器版本映射
    var browsersMapping = opts.browsersMapping

    var captureUrl = 'http://127.0.0.1:' + opts.port + '/version'
    launcher.launch(browsers, captureUrl)

    var fetch = setInterval(function() {
        if (Object.keys(browsersMapping).length === browsers.length) {
            clearInterval(fetch)
            clearTimeout(error)

            launcher.kill(browsers, function() {
                cb()
            })
        }
    }, 1000)

    var error = setTimeout(function() {
        logger.error('browsers info service error!')
        process.exit(1)
    }, 120 * 1000)
}
